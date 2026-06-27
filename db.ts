import fs from 'fs';
import path from 'path';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, setDoc, updateDoc, deleteDoc, addDoc, getDoc } from 'firebase/firestore';
import {
  Event,
  Task,
  InventoryItem,
  StaffMember,
  Vendor,
  FinanceTransaction,
  Issue,
  Comment,
  Attachment,
  ActivityLog,
  Notification,
  User
} from './src/types';

interface DatabaseSchema {
  events: Event[];
  tasks: Task[];
  inventory: InventoryItem[];
  staff: StaffMember[];
  vendors: Vendor[];
  finance: FinanceTransaction[];
  issues: Issue[];
  comments: Comment[];
  attachments: Attachment[];
  activityLogs: ActivityLog[];
  notifications: Notification[];
  users: User[];
  whatsappLogs?: any[];
}

const DB_PATH = path.join(process.cwd(), 'db.json');

const INITIAL_DB: DatabaseSchema = {
  users: [
    { id: 'u1', name: 'Rohan Sharma', email: 'rohan@slvevents.com', role: 'Admin', password: 'password123', isVerified: true },
    { id: 'u2', name: 'Priya Patel', email: 'priya@slvevents.com', role: 'Operations Lead', password: 'password123', isVerified: true },
    { id: 'u3', name: 'Amit Kumar', email: 'amit@slvevents.com', role: 'Finance Team', password: 'password123', isVerified: true },
    { id: 'u4', name: 'Sneha Rao', email: 'sneha@slvevents.com', role: 'Vendor Coordinator', password: 'password123', isVerified: true },
    { id: 'u5', name: 'Rajesh Mehta', email: 'rajesh@slvevents.com', role: 'Event Planner', password: 'password123', isVerified: true },
    { id: 'u6', name: 'Vikram Singh', email: 'vikram@slvevents.com', role: 'Team Lead', department: 'Decoration Team', password: 'password123', isVerified: true },
    { id: 'u7', name: 'Sanjay Kapoor (Client)', email: 'client@slvevents.com', role: 'Client', password: 'password123', isVerified: true },
    { id: 'u8', name: 'Raju Ground Crew', email: 'staff@slvevents.com', role: 'Staff', password: 'password123', isVerified: true }
  ],
  events: [
    {
      id: 'e1',
      name: 'The Kapoor Royal Wedding Gala',
      clientName: 'Sanjay Kapoor',
      type: 'Wedding',
      date: '2026-06-24', // Today's Event (as per system time 2026-06-24)
      venue: 'Palace Grounds, Bangalore - Royal Ballroom',
      guestCount: 850,
      budget: 4500000, // 45 Lakhs INR
      expenses: 3200000,
      status: 'In Progress',
      description: 'A lavish multi-cultural wedding featuring premium floral stage decors, state-of-the-art line array sound systems, VIP catering, and high-production drone videography.',
      notes: 'Ensure the main floral canopy is completed by 4 PM. High-priority client.'
    },
    {
      id: 'e2',
      name: 'TechNova Global Executive Summit 2026',
      clientName: 'TechNova Solutions Ltd.',
      type: 'Corporate',
      date: '2026-06-25', // Tomorrow
      venue: 'Sheraton Grand convention Center, Bangalore',
      guestCount: 350,
      budget: 2500000,
      expenses: 1800000,
      status: 'Upcoming',
      description: 'Annual corporate summit with keynote panel discussions, product launches, interactive LED walls, and global delegate networking dinners.',
      notes: 'Strict schedule. LED screens must be color-calibrated before rehearsals at 6 PM today.'
    },
    {
      id: 'e3',
      name: 'Aarav\'s Space Explorer 10th Birthday',
      clientName: 'Dr. Meera Nambiar',
      type: 'Birthday',
      date: '2026-06-28',
      venue: 'SLV Premium Banquet Hall, Indiranagar',
      guestCount: 120,
      budget: 650000,
      expenses: 420000,
      status: 'Upcoming',
      description: 'Space-themed interactive kids birthday with dynamic projection mapping, planetarium-dome balloons, and customized interactive game zones.',
      notes: 'Need to coordinate the astronaut mascot entry exactly at 5:30 PM.'
    },
    {
      id: 'e4',
      name: 'Swarasadhana Classical Music Concert',
      clientName: 'Swarasadhana Trust',
      type: 'Cultural',
      date: '2026-06-20', // Completed
      venue: 'Chowdiah Memorial Hall, Bangalore',
      guestCount: 600,
      budget: 1200000,
      expenses: 950000,
      status: 'Completed',
      description: 'An acoustic classical violin and vocal jugalbandi featuring renowned national artists. Required premium acoustic tuning and elegant traditional backdrop.',
      notes: 'Backdrop was highly appreciated.'
    }
  ],
  tasks: [
    // Tasks for Event 1 (In Progress)
    {
      id: 't1_1',
      eventId: 'e1',
      name: 'Main Floral Canopy Stage Construction',
      department: 'Decoration Team',
      status: 'In Progress',
      priority: 'High',
      owner: 'Vikram Singh',
      completionPercentage: 75,
      notes: 'Imports from Ooty delayed by 1 hour but arrived now. Working at high speed.',
      updatedAt: '2026-06-24T12:00:00Z'
    },
    {
      id: 't1_2',
      eventId: 'e1',
      name: 'Entrance Arch & Carpet Laying',
      department: 'Decoration Team',
      status: 'Completed',
      priority: 'Medium',
      owner: 'Vikram Singh',
      completionPercentage: 100,
      notes: 'Both entrance and side pathways fully carpeted and decorated.',
      completionTime: '2026-06-24T11:30:00Z',
      updatedAt: '2026-06-24T11:30:00Z'
    },
    {
      id: 't1_3',
      eventId: 'e1',
      name: 'Main Line Array Sound System Setup',
      department: 'Sound Team',
      status: 'In Progress',
      priority: 'High',
      owner: 'Karan Mehra',
      completionPercentage: 60,
      notes: 'Rigging completed. Audio cabling being patched now.',
      updatedAt: '2026-06-24T12:15:00Z'
    },
    {
      id: 't1_4',
      eventId: 'e1',
      name: 'Artist Microphone & Monitor Check',
      department: 'Sound Team',
      status: 'Pending',
      priority: 'High',
      owner: 'Karan Mehra',
      completionPercentage: 0,
      notes: 'Pending the completion of the line array sound setup. Scheduled for 3 PM.',
      updatedAt: '2026-06-24T10:00:00Z'
    },
    {
      id: 't1_5',
      eventId: 'e1',
      name: 'Welcome Drinks & Mocktail Bar Setup',
      department: 'Catering Team',
      status: 'Completed',
      priority: 'Medium',
      owner: 'Chef Anand',
      completionPercentage: 100,
      notes: 'Live bar set up. Ingredients, ice, and glassware in position.',
      completionTime: '2026-06-24T12:30:00Z',
      updatedAt: '2026-06-24T12:30:00Z'
    },
    {
      id: 't1_6',
      eventId: 'e1',
      name: 'Main Course Buffet Stations Ready',
      department: 'Catering Team',
      status: 'In Progress',
      priority: 'High',
      owner: 'Chef Anand',
      completionPercentage: 45,
      notes: 'Preparations in kitchen on track. Chafing dishes being placed now.',
      updatedAt: '2026-06-24T12:20:00Z'
    },
    {
      id: 't1_7',
      eventId: 'e1',
      name: 'Groom & Bride Photoshoot Preparation',
      department: 'Photography Team',
      status: 'In Progress',
      priority: 'Medium',
      owner: 'Sameer Sen',
      completionPercentage: 50,
      notes: 'Camera team assigned. Pre-wedding portrait area lighting finalized.',
      updatedAt: '2026-06-24T12:40:00Z'
    },
    {
      id: 't1_8',
      eventId: 'e1',
      name: 'Drone Videography Permission & Calibration',
      department: 'Videography Team',
      status: 'Blocked',
      priority: 'High',
      owner: 'Sameer Sen',
      completionPercentage: 20,
      notes: 'Slight localized wind issue and waiting for official clearance from venue coordinator.',
      issueReport: 'Drones cannot calibrate safely due to high wind gust on the open lawn. Standing by for weather check and airport authority portal clearance.',
      updatedAt: '2026-06-24T12:50:00Z'
    },
    {
      id: 't1_9',
      eventId: 'e1',
      name: 'VIP Guest Escort & Seating Coordination',
      department: 'Guest Management Team',
      status: 'Pending',
      priority: 'Medium',
      owner: 'Sneha Deshmukh',
      completionPercentage: 0,
      notes: 'Will start at 5:00 PM once VIP arrivals begin.',
      updatedAt: '2026-06-24T09:00:00Z'
    },
    {
      id: 't1_10',
      eventId: 'e1',
      name: '150KVA DG Backup Synchronisation',
      department: 'Power Backup',
      status: 'Completed',
      priority: 'High',
      owner: 'Eshwar Prasad',
      completionPercentage: 100,
      notes: 'Synchronized primary and backup lines. Seamless cutover tested.',
      completionTime: '2026-06-24T10:15:00Z',
      updatedAt: '2026-06-24T10:15:00Z'
    },
    {
      id: 't1_11',
      eventId: 'e1',
      name: 'VIP Valet Parking Management',
      department: 'Parking',
      status: 'In Progress',
      priority: 'Low',
      owner: 'Ramu K.',
      completionPercentage: 80,
      notes: 'Parking zones demarcated, signage installed. Drivers prepped.',
      updatedAt: '2026-06-24T11:00:00Z'
    },

    // Tasks for Event 2 (Upcoming Corporate)
    {
      id: 't2_1',
      eventId: 'e2',
      name: 'Vantage LED Screen Installation (P3 Panels)',
      department: 'Lighting',
      status: 'Pending',
      priority: 'High',
      owner: 'Nikhil Roy',
      completionPercentage: 0,
      notes: 'Equipment dispatched. Setup begins tonight at 8 PM.',
      updatedAt: '2026-06-24T08:00:00Z'
    },
    {
      id: 't2_2',
      eventId: 'e2',
      name: 'Delegate Registration & Badge Print Setup',
      department: 'Registration',
      status: 'In Progress',
      priority: 'Medium',
      owner: 'Divya Hedge',
      completionPercentage: 30,
      notes: 'Printers delivered to Sheraton. Portal testing is active.',
      updatedAt: '2026-06-24T12:00:00Z'
    }
  ],
  inventory: [
    { id: 'i1', name: 'Premium Red Roses (Ooty Bunch)', category: 'Flowers', quantity: 240, status: 'Reserved', location: 'Ballroom Storage' },
    { id: 'i2', name: 'White Orchids (Imported)', category: 'Flowers', quantity: 180, status: 'Reserved', location: 'Ballroom Storage' },
    { id: 'i3', name: 'P3 High-Definition LED Display Panels', category: 'Audio/Visual', quantity: 64, status: 'Assigned', location: 'Sheraton Conv.' },
    { id: 'i4', name: 'JBL VTX V20 Line Array Speakers', category: 'Audio/Visual', quantity: 12, status: 'Reserved', location: 'Palace Grounds' },
    { id: 'i5', name: 'Crown I-Tech 4x3500HD Amplifiers', category: 'Audio/Visual', quantity: 4, status: 'Reserved', location: 'Palace Grounds' },
    { id: 'i6', name: '150 KVA DG Silent Diesel Generator', category: 'Power/Generator', quantity: 2, status: 'Assigned', location: 'Palace Grounds B-Block' },
    { id: 'i7', name: 'Sony FX3 Cinema Camera + G-Master Lenses', category: 'Camera/Equipment', quantity: 3, status: 'Assigned', location: 'Palace Grounds' },
    { id: 'i8', name: 'DJI Inspire 3 Drone Kit', category: 'Camera/Equipment', quantity: 1, status: 'Assigned', location: 'Palace Grounds (Standby)' },
    { id: 'i9', name: 'Royal Gold-Plated Cushion Chairs', category: 'Furniture', quantity: 450, status: 'Reserved', location: 'Palace Grounds' },
    { id: 'i10', name: 'Round Dinner Tables (10-Seater)', category: 'Furniture', quantity: 60, status: 'Reserved', location: 'Palace Grounds' },
    { id: 'i11', name: 'Premium Velvet Curtains (Crimson)', category: 'Other', quantity: 30, status: 'Available', location: 'SLV Central Warehouse' },
    { id: 'i12', name: 'High-Watt Follow Spot Light', category: 'Lights', quantity: 2, status: 'Damaged', location: 'Maintenance Workshop' }
  ],
  staff: [
    { id: 's1', name: 'Vikram Singh', email: 'vikram@slvevents.com', role: 'Decoration Lead', department: 'Decoration Team', attendanceStatus: 'Present', shift: 'Full', performanceRating: 4.8, availability: false, phone: '+91 98860 12345' },
    { id: 's2', name: 'Karan Mehra', email: 'karan@slvevents.com', role: 'Sound Director', department: 'Sound Team', attendanceStatus: 'Present', shift: 'Day', performanceRating: 4.7, availability: false, phone: '+91 98860 54321' },
    { id: 's3', name: 'Sameer Sen', email: 'sameer@slvevents.com', role: 'Head of Media', department: 'Photography Team', attendanceStatus: 'Late', shift: 'Day', performanceRating: 4.9, availability: false, phone: '+91 98860 99999' },
    { id: 's4', name: 'Chef Anand Swamy', email: 'anand@slvevents.com', role: 'Executive Chef', department: 'Catering Team', attendanceStatus: 'Present', shift: 'Full', performanceRating: 4.6, availability: false, phone: '+91 98860 88888' },
    { id: 's5', name: 'Sneha Deshmukh', email: 'sneha.d@slvevents.com', role: 'Guest Relations Manager', department: 'Guest Management Team', attendanceStatus: 'Present', shift: 'Night', performanceRating: 4.8, availability: true, phone: '+91 98860 77777' },
    { id: 's6', name: 'Eshwar Prasad', email: 'eshwar@slvevents.com', role: 'Power & Safety Officer', department: 'Power Backup', attendanceStatus: 'Present', shift: 'Day', performanceRating: 4.5, availability: false, phone: '+91 98860 11111' },
    { id: 's7', name: 'Nikhil Roy', email: 'nikhil@slvevents.com', role: 'AV Technical Specialist', department: 'Lighting', attendanceStatus: 'Present', shift: 'Night', performanceRating: 4.7, availability: true, phone: '+91 98860 22222' },
    { id: 's8', name: 'Arjun Gowda', email: 'arjun@slvevents.com', role: 'Inventory Executive', department: 'Inventory Team', attendanceStatus: 'On Leave', shift: 'Day', performanceRating: 4.3, availability: false, phone: '+91 98860 33333' }
  ],
  vendors: [
    { id: 'v1', name: 'Aura Flowers Bangalore', category: 'Floral & Decor', contact: 'Madan Gopal (+91 99001 12345)', email: 'auraflowers@gmail.com', rating: 4.7, contractValue: 650000, paidAmount: 400000, outstandingAmount: 250000, status: 'Active' },
    { id: 'v2', name: 'Vantage Sound & Lights', category: 'AV & Technicals', contact: 'Hassan Raza (+91 99001 54321)', email: 'contact@vantagesound.in', rating: 4.8, contractValue: 980000, paidAmount: 500000, outstandingAmount: 480000, status: 'Active' },
    { id: 'v3', name: 'Nectar Catering Services', category: 'Food & Beverage', contact: 'Suresh Kamath (+91 99001 99999)', email: 'kamath@nectarcatering.com', rating: 4.6, contractValue: 1800000, paidAmount: 1000000, outstandingAmount: 800000, status: 'Active' },
    { id: 'v4', name: 'Candid Shots Studio', category: 'Photography & Media', contact: 'Ananya Gupta (+91 99001 88888)', email: 'bookings@candidshots.com', rating: 4.9, contractValue: 400000, paidAmount: 400000, outstandingAmount: 0, status: 'Completed' },
    { id: 'v5', name: 'Guardforce Security Solutions', category: 'Security & Logistics', contact: 'Capt. R. S. Negi (+91 99001 77777)', email: 'negi@guardforce.co.in', rating: 4.4, contractValue: 220000, paidAmount: 100000, outstandingAmount: 120000, status: 'Active' }
  ],
  finance: [
    // Income Transactions
    { id: 'f1', eventId: 'e1', type: 'Income', category: 'Client Booking Package', amount: 2500000, date: '2026-06-10', description: 'Advance payment (55%) received from संजय कपूर for Wedding Gala booking.', gstAmount: 381355, status: 'Paid' },
    { id: 'f2', eventId: 'e1', type: 'Income', category: 'Client Milestone 2', amount: 1500000, date: '2026-06-22', description: 'Second milestone payment received.', gstAmount: 228813, status: 'Paid' },
    { id: 'f3', eventId: 'e2', type: 'Income', category: 'Client Booking Package', amount: 1500000, date: '2026-06-15', description: 'Retainer deposit for TechNova Global Summit.', gstAmount: 228813, status: 'Paid' },
    { id: 'f4', eventId: 'e3', type: 'Income', category: 'Client Booking Package', amount: 300000, date: '2026-06-23', description: 'Advance deposit for Birthday Event.', gstAmount: 45762, status: 'Paid' },

    // Expense Transactions
    { id: 'f5', eventId: 'e1', type: 'Expense', category: 'Vendor Payout - Floral', amount: 400000, date: '2026-06-11', description: 'Part-payment paid to Aura Flowers Bangalore.', gstAmount: 61016, status: 'Paid' },
    { id: 'f6', eventId: 'e1', type: 'Expense', category: 'Vendor Payout - Sound', amount: 500000, date: '2026-06-18', description: 'Advance paid to Vantage Sound & Lights.', gstAmount: 76271, status: 'Paid' },
    { id: 'f7', eventId: 'e1', type: 'Expense', category: 'Vendor Payout - Catering', amount: 1000000, date: '2026-06-16', description: 'Part-payment to Nectar Catering Services.', gstAmount: 152542, status: 'Paid' },
    { id: 'f8', eventId: 'e1', type: 'Expense', category: 'Venue Permission Fees', amount: 150000, date: '2026-06-12', description: 'Palace Grounds authority licensing fees (18% GST).', gstAmount: 22881, status: 'Paid' },
    { id: 'f9', eventId: 'e1', type: 'Expense', category: 'Staff Daily Wages', amount: 80000, date: '2026-06-24', description: 'Daily wages and meals for on-ground crew (Decoration & Setup).', gstAmount: 0, status: 'Paid' }
  ],
  issues: [
    {
      id: 'is1',
      eventId: 'e1',
      taskName: 'Drone Videography Permission & Calibration',
      department: 'Videography Team',
      description: 'Calibration failing due to high wind speeds of 28 knots at Palace Grounds. Port authority portal verification server is also experiencing downtime.',
      reportedBy: 'Sameer Sen',
      status: 'Open',
      reportedAt: '2026-06-24T12:50:00Z'
    }
  ],
  comments: [
    { id: 'c1', eventId: 'e1', user: 'Priya Patel', role: 'Operations Lead', text: 'I am on my way to Palace Grounds for inspection. Vikram, please push the stage floral crew to speed up.', timestamp: '2026-06-24T12:05:00Z' },
    { id: 'c2', eventId: 'e1', user: 'Vikram Singh', role: 'Decoration Team', text: 'Yes Priya, Ooty roses have been unloaded and we have added 5 extra craftsmen to work on the centerpiece panel. We should catch up on schedule by 3:30 PM.', timestamp: '2026-06-24T12:12:00Z' },
    { id: 'c3', eventId: 'e1', user: 'Sameer Sen', role: 'Photography Team', text: 'Reported issue regarding the drone. Standby camera crew is capturing beautiful indoor handheld gimbal shots as backup.', timestamp: '2026-06-24T12:52:00Z' }
  ],
  attachments: [
    { id: 'a1', eventId: 'e1', name: 'Wedding_Floorplan_V4.pdf', size: '4.2 MB', uploadedBy: 'Priya Patel', timestamp: '2026-06-23T15:00:00Z', url: '#' },
    { id: 'a2', eventId: 'e1', name: 'Stage_3D_Design_Concept.jpg', size: '2.8 MB', uploadedBy: 'Vikram Singh', timestamp: '2026-06-23T17:30:00Z', url: '#' }
  ],
  activityLogs: [
    { id: 'al1', eventId: 'e1', timestamp: '2026-06-24T09:00:00Z', user: 'Priya Patel', role: 'Operations Lead', action: 'Event Status Update', details: 'Status set to "In Progress" for The Kapoor Royal Wedding Gala.' },
    { id: 'al2', eventId: 'e1', timestamp: '2026-06-24T10:15:00Z', user: 'Eshwar Prasad', role: 'Power Backup', action: 'Task Completed', details: 'Task "150KVA DG Backup Synchronisation" marked COMPLETED.' },
    { id: 'al3', eventId: 'e1', timestamp: '2026-06-24T11:30:00Z', user: 'Vikram Singh', role: 'Decoration Team', action: 'Task Completed', details: 'Task "Entrance Arch & Carpet Laying" marked COMPLETED.' },
    { id: 'al4', eventId: 'e1', timestamp: '2026-06-24T12:05:00Z', user: 'Priya Patel', role: 'Operations Lead', action: 'New Comment Added', details: 'Added checklist inspection note for Vikram.' },
    { id: 'al5', eventId: 'e1', timestamp: '2026-06-24T12:50:00Z', user: 'Sameer Sen', role: 'Photography Team', action: 'Issue Escalation', details: 'Logged blocker issue regarding Drone Weather & Calibration.' }
  ],
  notifications: [
    { id: 'n1', title: 'Task Blocked Alert', message: 'Drone Videography at Kapoor Wedding is BLOCKED due to high wind speeds.', timestamp: '2026-06-24T12:50:00Z', read: false, type: 'error' },
    { id: 'n2', title: 'Task Completed', message: 'Entrance Arch decoration completed on schedule.', timestamp: '2026-06-24T11:30:00Z', read: true, type: 'success' },
    { id: 'n3', title: 'Financial Milestone', message: 'Second milestone payment of INR 15 Lakhs processed for Kapoor Wedding.', timestamp: '2026-06-22T14:30:00Z', read: true, type: 'info' }
  ],
  whatsappLogs: []
};

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: null,
      email: null,
      emailVerified: null,
      isAnonymous: null,
      tenantId: null,
      providerInfo: []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

class Database {
  private data: DatabaseSchema;
  private dbInstance: any = null;
  private initialized: boolean = false;

  constructor() {
    this.data = { ...INITIAL_DB };
  }

  async init() {
    if (this.initialized) return;
    try {
      const CONFIG_PATH = path.join(process.cwd(), 'firebase-applet-config.json');
      let firebaseConfig;

      if (fs.existsSync(CONFIG_PATH)) {
        firebaseConfig = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf-8'));
      } else {
        firebaseConfig = {
          apiKey: "AIzaSyAneSuatexazZM7bETgnhECo_JriSILPgw",
          authDomain: "fair-blueprint-0k7s0.firebaseapp.com",
          projectId: "fair-blueprint-0k7s0",
          storageBucket: "fair-blueprint-0k7s0.firebasestorage.app",
          messagingSenderId: "437054212930",
          appId: "1:437054212930:web:519668b9a8480f8f2696db"
        };
      }

      const app = initializeApp(firebaseConfig);
      const dbId = firebaseConfig.firestoreDatabaseId || "ai-studio-slvevents-ad5ef53e-4901-460b-8860-77cf577079cf";
      this.dbInstance = getFirestore(app, dbId);
      console.log('Firebase initialized successfully on server. DB ID:', dbId);

      await this.loadFromFirestore();
      this.initialized = true;
    } catch (err) {
      console.error('Failed to initialize Firebase database:', err);
    }
  }

  private async loadFromFirestore() {
    try {
      // Check if we need to seed by seeing if there are any events
      const eventsSnap = await getDocs(collection(this.dbInstance, 'events'));
      if (eventsSnap.empty) {
        console.log('Firestore is empty. Seeding database from INITIAL_DB...');
        await this.seedFirestore();
      } else {
        console.log('Loading database from Firestore...');
        await this.loadAllCollections();
      }
    } catch (err) {
      console.error('Error loading from Firestore, falling back to INITIAL_DB:', err);
    }
  }

  private async seedFirestore() {
    const collectionsToSeed = {
      events: INITIAL_DB.events,
      tasks: INITIAL_DB.tasks,
      inventory: INITIAL_DB.inventory,
      staff: INITIAL_DB.staff,
      vendors: INITIAL_DB.vendors,
      finance: INITIAL_DB.finance,
      issues: INITIAL_DB.issues,
      comments: INITIAL_DB.comments,
      attachments: INITIAL_DB.attachments,
      activity_logs: INITIAL_DB.activityLogs,
      notifications: INITIAL_DB.notifications,
      users: INITIAL_DB.users,
      whatsapp_logs: INITIAL_DB.whatsappLogs || []
    };

    for (const [col, list] of Object.entries(collectionsToSeed)) {
      console.log(`Seeding ${list.length} documents into "${col}"...`);
      for (const item of list) {
        try {
          await setDoc(doc(this.dbInstance, col, item.id), item);
        } catch (e) {
          console.error(`Failed to seed ${col}/${item.id}:`, e);
          handleFirestoreError(e, OperationType.WRITE, `${col}/${item.id}`);
        }
      }
    }
    console.log('Firestore seeding completed successfully!');
    this.data = { ...INITIAL_DB };
  }

  private async loadAllCollections() {
    const cols = {
      events: 'events',
      tasks: 'tasks',
      inventory: 'inventory',
      staff: 'staff',
      vendors: 'vendors',
      finance: 'finance',
      issues: 'issues',
      comments: 'comments',
      attachments: 'attachments',
      activityLogs: 'activity_logs',
      notifications: 'notifications',
      users: 'users',
      whatsappLogs: 'whatsapp_logs'
    };

    const newData: any = {};
    for (const [key, colName] of Object.entries(cols)) {
      try {
        const snap = await getDocs(collection(this.dbInstance, colName));
        newData[key] = snap.docs.map(doc => doc.data());
      } catch (err) {
        console.error(`Failed to load collection ${colName}:`, err);
        newData[key] = (INITIAL_DB as any)[key] || [];
        handleFirestoreError(err, OperationType.GET, colName);
      }
    }
    this.data = newData as DatabaseSchema;
    console.log('All collections loaded successfully from Firestore.');
  }

  private async syncDoc(colName: string, id: string, data: any) {
    if (!this.dbInstance) return;
    try {
      await setDoc(doc(this.dbInstance, colName, id), data);
      console.log(`Synced ${colName}/${id} successfully to Firestore.`);
    } catch (err) {
      console.error(`Error syncing ${colName}/${id} to Firestore:`, err);
      handleFirestoreError(err, OperationType.WRITE, `${colName}/${id}`);
    }
  }

  private async deleteDocFromFirestore(colName: string, id: string) {
    if (!this.dbInstance) return;
    try {
      await deleteDoc(doc(this.dbInstance, colName, id));
      console.log(`Deleted ${colName}/${id} successfully from Firestore.`);
    } catch (err) {
      console.error(`Error deleting ${colName}/${id} from Firestore:`, err);
      handleFirestoreError(err, OperationType.DELETE, `${colName}/${id}`);
    }
  }

  // Generic DB accessors
  getEvents() { return this.data.events; }
  getEventById(id: string) { return this.data.events.find(e => e.id === id); }
  createEvent(event: Omit<Event, 'id' | 'expenses'>) {
    const newEvent: Event = {
      ...event,
      id: 'e_' + Math.random().toString(36).substr(2, 9),
      expenses: 0
    };
    this.data.events.push(newEvent);
    this.addActivityLog(newEvent.id, 'System', 'Event Planner', 'Event Created', `New event "${newEvent.name}" registered.`);
    this.syncDoc('events', newEvent.id, newEvent);
    return newEvent;
  }
  updateEvent(id: string, updates: Partial<Event>) {
    const idx = this.data.events.findIndex(e => e.id === id);
    if (idx !== -1) {
      this.data.events[idx] = { ...this.data.events[idx], ...updates };
      this.syncDoc('events', id, this.data.events[idx]);
      return this.data.events[idx];
    }
    return null;
  }
  deleteEvent(id: string) {
    this.data.events = this.data.events.filter(e => e.id !== id);
    this.deleteDocFromFirestore('events', id);

    // Clean up related tasks
    const tasksToDelete = this.data.tasks.filter(t => t.eventId === id);
    this.data.tasks = this.data.tasks.filter(t => t.eventId !== id);
    for (const t of tasksToDelete) {
      this.deleteDocFromFirestore('tasks', t.id);
    }

    // Comments
    const commentsToDelete = this.data.comments.filter(c => c.eventId === id);
    this.data.comments = this.data.comments.filter(c => c.eventId !== id);
    for (const c of commentsToDelete) {
      this.deleteDocFromFirestore('comments', c.id);
    }

    // Attachments
    const attachmentsToDelete = this.data.attachments.filter(a => a.eventId === id);
    this.data.attachments = this.data.attachments.filter(a => a.eventId !== id);
    for (const a of attachmentsToDelete) {
      this.deleteDocFromFirestore('attachments', a.id);
    }

    // Activity Logs
    const logsToDelete = this.data.activityLogs.filter(a => a.eventId === id);
    this.data.activityLogs = this.data.activityLogs.filter(a => a.eventId !== id);
    for (const log of logsToDelete) {
      this.deleteDocFromFirestore('activity_logs', log.id);
    }

    return true;
  }

  // Tasks
  getTasks(eventId?: string) {
    return eventId ? this.data.tasks.filter(t => t.eventId === eventId) : this.data.tasks;
  }
  createTask(task: Omit<Task, 'id' | 'updatedAt'>) {
    const newTask: Task = {
      ...task,
      id: 't_' + Math.random().toString(36).substr(2, 9),
      updatedAt: new Date().toISOString()
    };
    this.data.tasks.push(newTask);
    this.addActivityLog(newTask.eventId, 'System', 'Operations', 'Task Added', `Task "${newTask.name}" added to department "${newTask.department}".`);
    this.syncDoc('tasks', newTask.id, newTask);
    return newTask;
  }
  updateTask(id: string, updates: Partial<Task>, userName: string = 'System', userRole: string = 'Operations') {
    const idx = this.data.tasks.findIndex(t => t.id === id);
    if (idx !== -1) {
      const oldTask = this.data.tasks[idx];
      const updated = {
        ...oldTask,
        ...updates,
        updatedAt: new Date().toISOString()
      };
      
      // Handle completion timestamp
      if (updates.status === 'Completed' && oldTask.status !== 'Completed') {
        updated.completionTime = new Date().toISOString();
        this.addActivityLog(oldTask.eventId, userName, userRole, 'Task Completed', `Task "${oldTask.name}" was marked COMPLETED.`);
        
        // Add a success notification
        this.addNotification('Task Completed', `Task "${oldTask.name}" marked completed by ${userName}.`, 'success');
      } else if (updates.status === 'Blocked' && oldTask.status !== 'Blocked') {
        this.addActivityLog(oldTask.eventId, userName, userRole, 'Task Blocked', `Task "${oldTask.name}" reported BLOCKED. Reason: ${updates.issueReport || 'No reason specified'}`);
        
        // Add issue automatically
        this.createIssue(oldTask.eventId, oldTask.name, oldTask.department, updates.issueReport || 'No description provided', userName);

        // Add a warning notification
        this.addNotification('Task Blocked Blocker', `Task "${oldTask.name}" is now BLOCKED.`, 'error');
      } else if (updates.status && updates.status !== oldTask.status) {
        this.addActivityLog(oldTask.eventId, userName, userRole, 'Task Status Update', `Task "${oldTask.name}" changed status from ${oldTask.status} to ${updates.status}.`);
      }

      this.data.tasks[idx] = updated;
      this.syncDoc('tasks', id, updated);
      return updated;
    }
    return null;
  }

  // Inventory
  getInventory() { return this.data.inventory; }
  updateInventoryItem(id: string, updates: Partial<InventoryItem>) {
    const idx = this.data.inventory.findIndex(i => i.id === id);
    if (idx !== -1) {
      this.data.inventory[idx] = { ...this.data.inventory[idx], ...updates };
      this.syncDoc('inventory', id, this.data.inventory[idx]);
      return this.data.inventory[idx];
    }
    return null;
  }
  createInventoryItem(item: Omit<InventoryItem, 'id'>) {
    const newItem = { ...item, id: 'i_' + Math.random().toString(36).substr(2, 9) };
    this.data.inventory.push(newItem);
    this.syncDoc('inventory', newItem.id, newItem);
    return newItem;
  }

  // Staff
  getStaff() { return this.data.staff; }
  updateStaffMember(id: string, updates: Partial<StaffMember>) {
    const idx = this.data.staff.findIndex(s => s.id === id);
    if (idx !== -1) {
      this.data.staff[idx] = { ...this.data.staff[idx], ...updates };
      this.syncDoc('staff', id, this.data.staff[idx]);
      return this.data.staff[idx];
    }
    return null;
  }
  createStaffMember(member: Omit<StaffMember, 'id'>) {
    const newMember = { ...member, id: 's_' + Math.random().toString(36).substr(2, 9) };
    this.data.staff.push(newMember);
    this.syncDoc('staff', newMember.id, newMember);
    return newMember;
  }

  // Vendors
  getVendors() { return this.data.vendors; }
  updateVendor(id: string, updates: Partial<Vendor>) {
    const idx = this.data.vendors.findIndex(v => v.id === id);
    if (idx !== -1) {
      this.data.vendors[idx] = { ...this.data.vendors[idx], ...updates };
      this.syncDoc('vendors', id, this.data.vendors[idx]);
      return this.data.vendors[idx];
    }
    return null;
  }
  createVendor(vendor: Omit<Vendor, 'id'>) {
    const newVendor = { ...vendor, id: 'v_' + Math.random().toString(36).substr(2, 9) };
    this.data.vendors.push(newVendor);
    this.syncDoc('vendors', newVendor.id, newVendor);
    return newVendor;
  }

  // Finance
  getFinance(eventId?: string) {
    return eventId ? this.data.finance.filter(f => f.eventId === eventId) : this.data.finance;
  }
  createFinanceTransaction(tx: Omit<FinanceTransaction, 'id'>) {
    const newTx = { ...tx, id: 'f_' + Math.random().toString(36).substr(2, 9) };
    this.data.finance.push(newTx);

    // Update event expenses if it is an expense
    if (tx.type === 'Expense') {
      const evIdx = this.data.events.findIndex(e => e.id === tx.eventId);
      if (evIdx !== -1) {
        this.data.events[evIdx].expenses += tx.amount;
        this.syncDoc('events', tx.eventId, this.data.events[evIdx]);
      }
    }

    this.syncDoc('finance', newTx.id, newTx);
    return newTx;
  }
  updateFinanceTransaction(id: string, updates: Partial<FinanceTransaction>) {
    const idx = this.data.finance.findIndex(f => f.id === id);
    if (idx !== -1) {
      const oldTx = this.data.finance[idx];
      const newTx = { ...oldTx, ...updates };
      this.data.finance[idx] = newTx;
      this.syncDoc('finance', id, newTx);
      return newTx;
    }
    return null;
  }

  // Issues
  getIssues(eventId?: string) {
    return eventId ? this.data.issues.filter(i => i.eventId === eventId) : this.data.issues;
  }
  createIssue(eventId: string, taskName: string, department: string, description: string, reportedBy: string) {
    const newIssue: Issue = {
      id: 'is_' + Math.random().toString(36).substr(2, 9),
      eventId,
      taskName,
      department,
      description,
      reportedBy,
      status: 'Open',
      reportedAt: new Date().toISOString()
    };
    this.data.issues.push(newIssue);
    this.syncDoc('issues', newIssue.id, newIssue);
    return newIssue;
  }
  resolveIssue(issueId: string, resolvedBy: string) {
    const idx = this.data.issues.findIndex(i => i.id === issueId);
    if (idx !== -1) {
      this.data.issues[idx].status = 'Resolved';
      this.data.issues[idx].resolvedAt = new Date().toISOString();
      
      const eventId = this.data.issues[idx].eventId;
      const taskName = this.data.issues[idx].taskName;
      
      // Update associated task status back to In Progress
      const taskIdx = this.data.tasks.findIndex(t => t.eventId === eventId && t.name === taskName);
      if (taskIdx !== -1) {
        this.data.tasks[taskIdx].status = 'In Progress';
        this.data.tasks[taskIdx].issueReport = undefined;
        this.addActivityLog(eventId, resolvedBy, 'Operations Lead', 'Issue Resolved', `Blocker on "${taskName}" resolved. Task status restored to In Progress.`);
        this.syncDoc('tasks', this.data.tasks[taskIdx].id, this.data.tasks[taskIdx]);
      }

      this.addNotification('Issue Resolved', `Issue with "${taskName}" has been successfully resolved.`, 'success');
      this.syncDoc('issues', issueId, this.data.issues[idx]);
      return this.data.issues[idx];
    }
    return null;
  }

  // Comments
  getComments(eventId: string) {
    return this.data.comments.filter(c => c.eventId === eventId);
  }
  addComment(comment: Omit<Comment, 'id' | 'timestamp'>) {
    const newComment: Comment = {
      ...comment,
      id: 'c_' + Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toISOString()
    };
    this.data.comments.push(newComment);
    this.addActivityLog(comment.eventId, comment.user, comment.role, 'Comment Added', `Added commentary: "${comment.text.substring(0, 50)}..."`);
    this.syncDoc('comments', newComment.id, newComment);
    return newComment;
  }

  // Attachments
  getAttachments(eventId: string) {
    return this.data.attachments.filter(a => a.eventId === eventId);
  }
  addAttachment(attachment: Omit<Attachment, 'id' | 'timestamp'>) {
    const newAttachment: Attachment = {
      ...attachment,
      id: 'at_' + Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toISOString()
    };
    this.data.attachments.push(newAttachment);
    this.addActivityLog(attachment.eventId, attachment.uploadedBy, 'Team Lead', 'File Uploaded', `Uploaded attachment "${attachment.name}".`);
    this.syncDoc('attachments', newAttachment.id, newAttachment);
    return newAttachment;
  }

  // Activity Logs
  getActivityLogs(eventId?: string) {
    const logs = eventId ? this.data.activityLogs.filter(a => a.eventId === eventId) : this.data.activityLogs;
    return logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }
  addActivityLog(eventId: string, user: string, role: string, action: string, details: string) {
    const newLog: ActivityLog = {
      id: 'al_' + Math.random().toString(36).substr(2, 9),
      eventId,
      timestamp: new Date().toISOString(),
      user,
      role,
      action,
      details
    };
    this.data.activityLogs.push(newLog);
    this.syncDoc('activity_logs', newLog.id, newLog);
    return newLog;
  }

  // Notifications
  getNotifications() {
    return this.data.notifications.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }
  addNotification(title: string, message: string, type: 'info' | 'warning' | 'error' | 'success' = 'info') {
    const newNotif: Notification = {
      id: 'n_' + Math.random().toString(36).substr(2, 9),
      title,
      message,
      timestamp: new Date().toISOString(),
      read: false,
      type
    };
    this.data.notifications.push(newNotif);
    this.syncDoc('notifications', newNotif.id, newNotif);
    return newNotif;
  }
  markNotificationsAsRead() {
    this.data.notifications.forEach(n => {
      n.read = true;
      this.syncDoc('notifications', n.id, n);
    });
    return true;
  }
  deleteNotification(id: string) {
    this.data.notifications = this.data.notifications.filter(n => n.id !== id);
    this.deleteDocFromFirestore('notifications', id);
    return true;
  }

  // Users Auth / Account Management
  getUsers() {
    return this.data.users || [];
  }

  getUserByEmail(email: string) {
    const users = this.getUsers();
    return users.find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  registerUser(name: string, email: string, passwordStr: string, roleStr: string) {
    const users = this.getUsers();
    if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
      return null;
    }

    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

    const newUser: User = {
      id: 'u_' + Math.random().toString(36).substr(2, 9),
      name,
      email: email.toLowerCase(),
      role: roleStr as any,
      password: passwordStr,
      isVerified: false,
      verificationCode
    };

    if (!this.data.users) {
      this.data.users = [];
    }
    this.data.users.push(newUser);
    this.syncDoc('users', newUser.id, newUser);
    return newUser;
  }

  verifyUser(email: string, code: string) {
    const user = this.getUserByEmail(email);
    if (!user) return { success: false, message: 'User not found' };
    if (user.verificationCode === code) {
      user.isVerified = true;
      this.syncDoc('users', user.id, user);
      return { success: true, user };
    }
    return { success: false, message: 'Invalid verification code' };
  }

  updateUserVerificationCode(email: string, code: string) {
    const user = this.getUserByEmail(email);
    if (!user) return false;
    user.verificationCode = code;
    this.syncDoc('users', user.id, user);
    return true;
  }

  getWhatsAppLogs() {
    if (!this.data.whatsappLogs) {
      this.data.whatsappLogs = [];
    }
    return this.data.whatsappLogs;
  }

  addWhatsAppLog(phoneNumber: string, text: string, status: string = 'Sent') {
    if (!this.data.whatsappLogs) {
      this.data.whatsappLogs = [];
    }
    const log = {
      id: 'wa_' + Math.random().toString(36).substr(2, 9),
      phoneNumber,
      text,
      status,
      timestamp: new Date().toISOString()
    };
    this.data.whatsappLogs.push(log);
    this.syncDoc('whatsapp_logs', log.id, log);
    return log;
  }
}

export const db = new Database();
