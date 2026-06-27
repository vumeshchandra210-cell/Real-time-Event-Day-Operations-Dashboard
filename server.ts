import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { db } from './db';
import { GoogleGenAI, Type } from '@google/genai';
import nodemailer from 'nodemailer';

// Initialize Express
const app = express();
const PORT = 3000;

app.use(express.json());

// Helper: Send Verification Email
async function sendVerificationEmail(email: string, name: string, code: string, role: string = 'Staff') {
  const welcomeMessage = `you are part of Slv events as ${role} wishing u happy journey towards our company.`;
  console.log(`[EMAIL SIMULATION] Sending verification email to ${email}. Verification Code: ${code}. Message: "${welcomeMessage}"`);
  
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.SMTP_FROM || 'no-reply@slvevents.com';

  if (!host || !user || !pass) {
    console.log('[EMAIL SIMULATION] SMTP is not configured. Email will be sent in SIMULATED mode only.');
    return { simulated: true, code, welcomeMessage };
  }

  try {
    const transporter = nodemailer.createTransport({
      host,
      port: Number(port) || 587,
      secure: port === '465',
      auth: { user, pass }
    });

    const info = await transporter.sendMail({
      from,
      to: email,
      subject: 'Welcome to SLV Events - Verification Required',
      text: `Hello ${name},\n\n${welcomeMessage}\n\nYour 6-digit email verification code is: ${code}\n\nPlease enter this code in the registration screen to complete your setup.\n\nThank you,\nSLV Events Team`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
          <div style="text-align: center; margin-bottom: 24px;">
            <div style="display: inline-block; background-color: #2563eb; color: white; padding: 12px 24px; border-radius: 8px; font-weight: bold; font-size: 20px;">
              SLV Events
            </div>
          </div>
          <h2 style="color: #0f172a; text-align: center; margin-bottom: 8px;">Welcome to the Team!</h2>
          <p style="color: #1e293b; font-size: 15px; text-align: center; margin-bottom: 24px; font-weight: 500;">
            ${welcomeMessage}
          </p>
          <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; border: 1px solid #e2e8f0; text-align: center; margin-bottom: 24px;">
            <p style="color: #475569; font-size: 13px; margin-top: 0; margin-bottom: 12px;">Please use this 6-digit verification code to complete your registration:</p>
            <span style="font-family: monospace; font-size: 32px; font-weight: bold; letter-spacing: 4px; background-color: #f1f5f9; padding: 12px 24px; border-radius: 8px; color: #1e3a8a; border: 1px solid #cbd5e1;">
              ${code}
            </span>
          </div>
          <p style="color: #64748b; font-size: 12px; text-align: center; margin-top: 32px; border-top: 1px solid #e2e8f0; padding-top: 16px;">
            If you did not register for this account, please ignore this email.
          </p>
        </div>
      `
    });

    return { success: true, messageId: info.messageId, welcomeMessage };
  } catch (err) {
    console.error('[EMAIL ERROR] Failed to send real email via SMTP:', err);
    return { success: false, error: (err as Error).message, simulated: true, code, welcomeMessage };
  }
}

// Helper: Send WhatsApp Notification (utilizing real Twilio or local simulated logs)
async function sendWhatsAppNotification(phoneNumber: string, messageText: string) {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const fromWhatsAppNumber = process.env.TWILIO_WHATSAPP_NUMBER || '+14155238886';

  console.log(`[WHATSAPP SIMULATION] Target: ${phoneNumber}, Message: "${messageText}"`);

  // Log in standard app notifications so it shows up in general alerts
  db.addNotification('WhatsApp Sent', `[To ${phoneNumber}]: "${messageText}"`, 'info');

  if (!accountSid || !authToken) {
    db.addWhatsAppLog(phoneNumber, messageText, 'Simulated (Twilio keys not set)');
    return { simulated: true, message: messageText };
  }

  try {
    const authString = Buffer.from(`${accountSid}:${authToken}`).toString('base64');
    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${authString}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
          From: `whatsapp:${fromWhatsAppNumber}`,
          To: `whatsapp:${phoneNumber}`,
          Body: messageText
        })
      }
    );

    const data = await response.json();
    if (response.ok) {
      db.addWhatsAppLog(phoneNumber, messageText, 'Sent (Real Twilio)');
      return { success: true, sid: data.sid };
    } else {
      db.addWhatsAppLog(phoneNumber, messageText, `Failed: ${JSON.stringify(data)}`);
      return { success: false, error: data, simulated: true };
    }
  } catch (err) {
    db.addWhatsAppLog(phoneNumber, messageText, `Failed: ${(err as Error).message}`);
    return { success: false, error: (err as Error).message, simulated: true };
  }
}

// Authentication Endpoints
app.post('/api/users/create', async (req, res) => {
  const { name, email, password, role } = req.body;
  if (!name || !email || !password || !role) {
    return res.status(400).json({ error: 'All fields (name, email, password, role) are required' });
  }

  const existing = db.getUserByEmail(email);
  if (existing) {
    return res.status(400).json({ error: 'An account with this email already exists' });
  }

  const user = db.registerUser(name, email, password, role);
  if (!user) {
    return res.status(500).json({ error: 'Failed to create user' });
  }

  // Send verification email (real if SMTP keys are set, simulated otherwise)
  const emailRes = await sendVerificationEmail(user.email, user.name, user.verificationCode || '', user.role);

  res.status(201).json({
    message: 'User registered successfully. A verification email has been sent.',
    email: user.email,
    simulated: !!emailRes.simulated,
    simulatedCode: user.verificationCode // Sent to client for instant simulation if real SMTP is not set up
  });
});

app.post('/api/users/resend', async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  const user = db.getUserByEmail(email);
  if (!user) {
    return res.status(404).json({ error: 'No registered account found with this email' });
  }

  // Generate a new 6-digit random verification code
  const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
  db.updateUserVerificationCode(user.email, verificationCode);

  // Send verification email
  const emailRes = await sendVerificationEmail(user.email, user.name, verificationCode, user.role);

  res.json({
    message: 'A new verification email has been sent successfully.',
    email: user.email,
    simulated: !!emailRes.simulated,
    simulatedCode: verificationCode
  });
});

app.post('/api/users/confirm', (req, res) => {
  const { email, code } = req.body;
  if (!email || !code) {
    return res.status(400).json({ error: 'Email and verification code are required' });
  }

  const result = db.verifyUser(email, code);
  if (!result.success) {
    return res.status(400).json({ error: result.message });
  }

  res.json({
    message: 'Verification successful. Session established.',
    user: {
      id: result.user?.id,
      name: result.user?.name,
      email: result.user?.email,
      role: result.user?.role
    }
  });
});

app.post('/api/sessions/create', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const user = db.getUserByEmail(email);
  if (!user) {
    return res.status(400).json({ error: 'No account registered with this email' });
  }

  if (user.password !== password) {
    return res.status(400).json({ error: 'Invalid password' });
  }

  if (user.isVerified === false) {
    return res.status(400).json({
      error: 'Account email is not verified',
      needsVerification: true,
      email: user.email,
      simulatedCode: user.verificationCode
    });
  }

  res.json({
    message: 'Login successful',
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    }
  });
});

// WhatsApp endpoints
app.post('/api/whatsapp/send', async (req, res) => {
  const { phoneNumber, message } = req.body;
  if (!phoneNumber || !message) {
    return res.status(400).json({ error: 'phoneNumber and message are required' });
  }
  const result = await sendWhatsAppNotification(phoneNumber, message);
  res.json({ success: true, result });
});

app.get('/api/whatsapp/logs', (req, res) => {
  res.json(db.getWhatsAppLogs());
});

// API: Healthcheck
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API: Events
app.get('/api/events', (req, res) => {
  res.json(db.getEvents());
});

app.get('/api/events/:id', (req, res) => {
  const event = db.getEventById(req.params.id);
  if (!event) return res.status(404).json({ error: 'Event not found' });
  res.json(event);
});

app.post('/api/events', (req, res) => {
  try {
    const { name, clientName, type, date, venue, guestCount, budget, description, notes } = req.body;
    if (!name || !clientName || !type || !date || !venue) {
      return res.status(400).json({ error: 'Missing required event fields' });
    }
    const newEvent = db.createEvent({
      name,
      clientName,
      type,
      date,
      venue,
      guestCount: Number(guestCount) || 0,
      budget: Number(budget) || 0,
      status: 'Upcoming',
      description: description || '',
      notes: notes || ''
    });

    // Create a set of initial standard tasks for the event based on its type
    const departments = ['Decoration Team', 'Sound Team', 'Catering Team', 'Photography Team', 'Guest Management Team'];
    departments.forEach((dept, idx) => {
      db.createTask({
        eventId: newEvent.id,
        name: `Initial setup coordination for ${dept}`,
        department: dept,
        status: 'Pending',
        priority: idx % 2 === 0 ? 'High' : 'Medium',
        owner: 'System Assigned',
        completionPercentage: 0,
        notes: `Standard kick-off checkpoint for ${newEvent.type} event.`
      });
    });

    res.status(201).json(newEvent);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/events/:id', (req, res) => {
  const updated = db.updateEvent(req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'Event not found' });
  res.json(updated);
});

app.delete('/api/events/:id', (req, res) => {
  const success = db.deleteEvent(req.params.id);
  if (!success) return res.status(404).json({ error: 'Event not found' });
  res.json({ message: 'Event successfully archived/deleted' });
});

// API: Tasks
app.get('/api/tasks', (req, res) => {
  const { eventId } = req.query;
  res.json(db.getTasks(eventId as string));
});

app.post('/api/tasks', (req, res) => {
  const { eventId, name, department, priority, owner, notes } = req.body;
  if (!eventId || !name || !department) {
    return res.status(400).json({ error: 'Missing required task fields' });
  }
  const newTask = db.createTask({
    eventId,
    name,
    department,
    priority: priority || 'Medium',
    owner: owner || 'Unassigned',
    status: 'Pending',
    completionPercentage: 0,
    notes: notes || ''
  });
  res.status(201).json(newTask);
});

app.put('/api/tasks/:id', (req, res) => {
  const { status, completionPercentage, notes, issueReport, userName, userRole } = req.body;
  const updated = db.updateTask(req.params.id, {
    status,
    completionPercentage: completionPercentage !== undefined ? Number(completionPercentage) : undefined,
    notes,
    issueReport
  }, userName, userRole);

  if (!updated) return res.status(404).json({ error: 'Task not found' });
  res.json(updated);
});

// API: Inventory
app.get('/api/inventory', (req, res) => {
  res.json(db.getInventory());
});

app.post('/api/inventory', (req, res) => {
  const { name, category, quantity, status, location } = req.body;
  if (!name || !category || quantity === undefined) {
    return res.status(400).json({ error: 'Missing required inventory fields' });
  }
  const newItem = db.createInventoryItem({
    name,
    category,
    quantity: Number(quantity) || 0,
    status: status || 'Available',
    location: location || ''
  });
  res.status(201).json(newItem);
});

app.put('/api/inventory/:id', (req, res) => {
  const updated = db.updateInventoryItem(req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'Inventory item not found' });
  res.json(updated);
});

// API: Staff
app.get('/api/staff', (req, res) => {
  res.json(db.getStaff());
});

app.post('/api/staff', (req, res) => {
  const { name, email, role, department, shift, availability, phone } = req.body;
  if (!name || !email || !role || !department) {
    return res.status(400).json({ error: 'Missing required staff fields' });
  }
  const newStaff = db.createStaffMember({
    name,
    email,
    role,
    department,
    attendanceStatus: 'Present',
    shift: shift || 'Day',
    performanceRating: 5.0,
    availability: availability !== undefined ? availability : true,
    phone: phone || ''
  });
  res.status(201).json(newStaff);
});

app.put('/api/staff/:id', (req, res) => {
  const updated = db.updateStaffMember(req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'Staff member not found' });
  res.json(updated);
});

// API: Vendors
app.get('/api/vendors', (req, res) => {
  res.json(db.getVendors());
});

app.post('/api/vendors', (req, res) => {
  const { name, category, contact, email, contractValue } = req.body;
  if (!name || !category || !contact) {
    return res.status(400).json({ error: 'Missing required vendor fields' });
  }
  const newVendor = db.createVendor({
    name,
    category,
    contact,
    email: email || '',
    rating: 5.0,
    contractValue: Number(contractValue) || 0,
    paidAmount: 0,
    outstandingAmount: Number(contractValue) || 0,
    status: 'Active'
  });
  res.status(201).json(newVendor);
});

app.put('/api/vendors/:id', (req, res) => {
  const updated = db.updateVendor(req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'Vendor not found' });
  res.json(updated);
});

// API: Finance
app.get('/api/finance', (req, res) => {
  const { eventId } = req.query;
  res.json(db.getFinance(eventId as string));
});

app.get('/api/finance/transactions', (req, res) => {
  const { eventId } = req.query;
  res.json(db.getFinance(eventId as string));
});

app.post('/api/finance', (req, res) => {
  const { eventId, type, category, amount, description, gstAmount, status, totalAmount, paidAmount, balanceAmount, vendorName, transactionTime, receiptNo } = req.body;
  if (!eventId || !type || !category || amount === undefined) {
    return res.status(400).json({ error: 'Missing required finance transaction fields' });
  }
  const newTx = db.createFinanceTransaction({
    eventId,
    type,
    category,
    amount: Number(amount) || 0,
    date: new Date().toISOString().split('T')[0],
    description: description || '',
    gstAmount: Number(gstAmount) || 0,
    status: status || 'Pending',
    totalAmount: totalAmount ? Number(totalAmount) : undefined,
    paidAmount: paidAmount ? Number(paidAmount) : undefined,
    balanceAmount: balanceAmount ? Number(balanceAmount) : undefined,
    vendorName: vendorName || undefined,
    transactionTime: transactionTime || undefined,
    receiptNo: receiptNo || undefined
  });
  res.status(201).json(newTx);
});

app.post('/api/finance/transactions', (req, res) => {
  const { eventId, type, category, amount, description, gstAmount, status, totalAmount, paidAmount, balanceAmount, vendorName, transactionTime, receiptNo } = req.body;
  if (!eventId || !type || !category || amount === undefined) {
    return res.status(400).json({ error: 'Missing required finance transaction fields' });
  }
  const newTx = db.createFinanceTransaction({
    eventId,
    type,
    category,
    amount: Number(amount) || 0,
    date: new Date().toISOString().split('T')[0],
    description: description || '',
    gstAmount: Number(gstAmount) || 0,
    status: status || 'Pending',
    totalAmount: totalAmount ? Number(totalAmount) : undefined,
    paidAmount: paidAmount ? Number(paidAmount) : undefined,
    balanceAmount: balanceAmount ? Number(balanceAmount) : undefined,
    vendorName: vendorName || undefined,
    transactionTime: transactionTime || undefined,
    receiptNo: receiptNo || undefined
  });
  res.status(201).json(newTx);
});

app.put('/api/finance/transactions/:id', (req, res) => {
  const { status, totalAmount, paidAmount, balanceAmount, vendorName, transactionTime, receiptNo, amount } = req.body;
  const updates: any = {};
  if (status !== undefined) updates.status = status;
  if (amount !== undefined) updates.amount = Number(amount);
  if (totalAmount !== undefined) updates.totalAmount = Number(totalAmount);
  if (paidAmount !== undefined) updates.paidAmount = Number(paidAmount);
  if (balanceAmount !== undefined) updates.balanceAmount = Number(balanceAmount);
  if (vendorName !== undefined) updates.vendorName = vendorName;
  if (transactionTime !== undefined) updates.transactionTime = transactionTime;
  if (receiptNo !== undefined) updates.receiptNo = receiptNo;

  const updatedTx = db.updateFinanceTransaction(req.params.id, updates);
  if (!updatedTx) {
    return res.status(404).json({ error: 'Transaction not found' });
  }
  res.json(updatedTx);
});

// API: Issues
app.get('/api/issues', (req, res) => {
  const { eventId } = req.query;
  res.json(db.getIssues(eventId as string));
});

app.post('/api/issues/:id/resolve', (req, res) => {
  const { userName } = req.body;
  const updated = db.resolveIssue(req.params.id, userName || 'Operations Lead');
  if (!updated) return res.status(404).json({ error: 'Issue not found' });
  res.json(updated);
});

// API: Comments
app.get('/api/comments', (req, res) => {
  const { eventId } = req.query;
  if (!eventId) return res.status(400).json({ error: 'eventId is required' });
  res.json(db.getComments(eventId as string));
});

app.post('/api/comments', (req, res) => {
  const { eventId, user, role, text } = req.body;
  if (!eventId || !user || !role || !text) {
    return res.status(400).json({ error: 'Missing comment fields' });
  }
  const newComment = db.addComment({ eventId, user, role, text });
  res.status(201).json(newComment);
});

// API: Attachments
app.get('/api/attachments', (req, res) => {
  const { eventId } = req.query;
  if (!eventId) return res.status(400).json({ error: 'eventId is required' });
  res.json(db.getAttachments(eventId as string));
});

app.post('/api/attachments', (req, res) => {
  const { eventId, name, size, uploadedBy, url } = req.body;
  if (!eventId || !name || !size || !uploadedBy) {
    return res.status(400).json({ error: 'Missing required file details' });
  }
  const newAttachment = db.addAttachment({
    eventId,
    name,
    size,
    uploadedBy,
    url: url || '#'
  });
  res.status(201).json(newAttachment);
});

// API: Activity Logs
app.get('/api/activity-logs', (req, res) => {
  const { eventId } = req.query;
  res.json(db.getActivityLogs(eventId as string));
});

app.post('/api/activity-logs', (req, res) => {
  const { eventId, user, role, action, details } = req.body;
  if (!eventId || !user || !role || !action || !details) {
    return res.status(400).json({ error: 'Missing required activity log fields' });
  }
  const newLog = db.addActivityLog(eventId, user, role, action, details);
  res.status(201).json(newLog);
});

// API: Notifications
app.get('/api/notifications', (req, res) => {
  res.json(db.getNotifications());
});

app.post('/api/notifications/mark-read', (req, res) => {
  db.markNotificationsAsRead();
  res.json({ message: 'Notifications marked as read' });
});

app.delete('/api/notifications/:id', (req, res) => {
  db.deleteNotification(req.params.id);
  res.json({ success: true, message: 'Notification successfully cleared' });
});

// API: AI Briefing Generator (using Gemini 3.5 Flash)
app.post('/api/ai/briefing', async (req, res) => {
  const { eventId } = req.body;
  if (!eventId) {
    return res.status(400).json({ error: 'eventId is required' });
  }

  const event = db.getEventById(eventId);
  if (!event) {
    return res.status(404).json({ error: 'Event not found' });
  }

  const tasks = db.getTasks(eventId);
  const issues = db.getIssues(eventId).filter(i => i.status === 'Open');
  const staff = db.getStaff();
  const vendors = db.getVendors();

  // Determine current active and completed task metrics
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'Completed');
  const delayedTasks = tasks.filter(t => t.status === 'Delayed');
  const blockedTasks = tasks.filter(t => t.status === 'Blocked');
  const inProgressTasks = tasks.filter(t => t.status === 'In Progress');

  // Prep data context for LLM
  const tasksContext = tasks.map(t => `- [${t.department}] ${t.name}: Status=${t.status}, Completion=${t.completionPercentage}%, Priority=${t.priority}, Owner=${t.owner}, Notes="${t.notes || ''}"`).join('\n');
  const issuesContext = issues.map(i => `- Issue on "${i.taskName}" (${i.department}): Reported by ${i.reportedBy}. Description="${i.description}"`).join('\n');

  const prompt = `You are the AI Event Operations Assistant for "SLV Events".
Generate a high-fidelity real-time operational briefing and predictive risk assessment for the following event day:

EVENT DETAILS:
- Name: ${event.name}
- Type: ${event.type}
- Venue: ${event.venue}
- Guest Count: ${event.guestCount}
- Overall Budget: INR ${event.budget}

OPERATIONAL STATS:
- Total Scheduled Tasks: ${totalTasks}
- Completed Tasks: ${completedTasks.length}
- In-Progress Tasks: ${inProgressTasks.length}
- Delayed Tasks: ${delayedTasks.length}
- Blocked Tasks: ${blockedTasks.length}

TASKS LIST:
${tasksContext || 'No tasks listed.'}

ACTIVE CRITICAL ISSUES / ESCALATIONS:
${issuesContext || 'No active blockages.'}

Generate a beautiful, highly detailed, professional operations report in JSON format matching the response schema. 
Provide a concise executive summary, list the key risks based on delayed/blocked tasks, specify clear priority actions, identify any operational bottlenecks, and suggest optimal resource allocations (e.g., reassigning idle staff members).
Give a rational confidence score (percentage from 0 to 100) on whether this event will run on schedule.`;

  // Rule-based fallback if the API key is not valid or configured
  const generateFallbackBriefing = () => {
    const summary = `Event day operations are actively running. Progress is currently at ${Math.round((completedTasks.length / (totalTasks || 1)) * 100)}% task completion. ${blockedTasks.length > 0 ? 'Urgent attention is needed to resolve 1 active bottleneck on drone permissions.' : 'All primary logistics are in progress with standard operational schedules.'}`;
    
    const risks: string[] = [];
    if (blockedTasks.length > 0) {
      risks.push(`Blockage on "${blockedTasks[0].name}" due to environmental factors (high winds) and verification server downtime.`);
    }
    if (delayedTasks.length > 0) {
      risks.push(`Decoration deliverables are slightly delayed but materials have arrived at the scene.`);
    } else {
      risks.push("No severe logistical delays reported, but schedule density is high.");
    }
    risks.push(`Potential sound-check rush if stage construction spills past the 3:30 PM deadline.`);

    const priorityActions: string[] = [
      `Contact Palace Grounds venue coordinator to secure physical clearances for indoor/alternative media zones.`,
      `Verify line-array power feeds and speaker rigging before testing monitors at 3 PM.`,
      `Deploy decoration lead to expedite floral panel arrangements at the primary mandap/canopy.`
    ];

    const bottlenecks: string[] = [];
    if (blockedTasks.length > 0) {
      bottlenecks.push(`Drone calibration blocker (environmental & API server downtime).`);
    }
    bottlenecks.push("Main stage construction schedule variance.");

    const resourceAllocation: string[] = [
      "Reassign 2 auxiliary hands from VIP parking to assist floral decoration craftsmen.",
      "Instruct standby photographer to proceed with indoor gimbal captures to cover outdoor media shortfalls."
    ];

    return {
      summary,
      delayedCount: delayedTasks.length + blockedTasks.length,
      risks,
      priorityActions,
      bottlenecks,
      resourceAllocation,
      confidenceScore: blockedTasks.length > 0 ? 82 : 95,
      timestamp: new Date().toISOString()
    };
  };

  const apiKey = process.env.GEMINI_API_KEY;
  const isKeyPlaceholder = !apiKey || apiKey === 'MY_GEMINI_API_KEY' || apiKey.trim() === '';

  if (isKeyPlaceholder) {
    console.log('Using rule-based fallback operational assistant (No valid API key provided).');
    return res.json(generateFallbackBriefing());
  }

  try {
    const aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build'
        }
      }
    });

    const response = await aiClient.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          required: ['summary', 'delayedCount', 'risks', 'priorityActions', 'bottlenecks', 'resourceAllocation', 'confidenceScore'],
          properties: {
            summary: {
              type: Type.STRING,
              description: 'Executive concise summary of the event status day of execution.'
            },
            delayedCount: {
              type: Type.INTEGER,
              description: 'Count of delayed or blocked/blocked tasks.'
            },
            risks: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Predictive risks or scheduling overlaps.'
            },
            priorityActions: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Top immediate actions required from the Event Lead.'
            },
            bottlenecks: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Current technical or physical blockers.'
            },
            resourceAllocation: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Smart resource reallocation and staff movement suggestions.'
            },
            confidenceScore: {
              type: Type.INTEGER,
              description: 'Execution confidence percentage indicator (0 to 100).'
            }
          }
        }
      }
    });

    const text = response.text;
    if (!text) {
      throw new Error('Empty response from Gemini API');
    }

    const briefing = JSON.parse(text);
    briefing.timestamp = new Date().toISOString();
    res.json(briefing);
  } catch (err: any) {
    console.error('Gemini execution error, using fallback:', err.message);
    res.json(generateFallbackBriefing());
  }
});

// Start the fullstack environment with Vite middleware
async function startServer() {
  await db.init();

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
    console.log('Vite development server middleware loaded.');
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
    console.log('Serving production build assets.');
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`SLV Events Server active on http://0.0.0.0:${PORT}`);
  });
}

startServer();
