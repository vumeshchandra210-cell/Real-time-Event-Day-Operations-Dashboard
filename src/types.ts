export type UserRole =
  | 'Admin'
  | 'Staff'
  | 'Operations Lead'
  | 'Finance Team'
  | 'Vendor Coordinator'
  | 'Event Planner'
  | 'Team Lead'
  | 'Client'
  | 'Decoration Team'
  | 'Photography Team'
  | 'Videography Team'
  | 'Sound Team'
  | 'Catering Team'
  | 'Guest Management Team'
  | 'Security Team'
  | 'Inventory Team';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  department?: string;
  password?: string;
  isVerified?: boolean;
  verificationCode?: string;
}

export type EventStatus = 'Upcoming' | 'In Progress' | 'Completed' | 'Cancelled';

export interface Event {
  id: string;
  name: string;
  clientName: string;
  type: 'Wedding' | 'Corporate' | 'Birthday' | 'Cultural' | 'Exhibition' | 'Conference';
  date: string;
  venue: string;
  guestCount: number;
  budget: number;
  expenses: number;
  status: EventStatus;
  description: string;
  notes?: string;
}

export type TaskStatus = 'Pending' | 'In Progress' | 'Completed' | 'Delayed' | 'Blocked';
export type TaskPriority = 'Low' | 'Medium' | 'High';

export interface Task {
  id: string;
  eventId: string;
  name: string;
  department: string;
  status: TaskStatus;
  priority: TaskPriority;
  owner: string;
  completionPercentage: number;
  notes?: string;
  issueReport?: string;
  completionTime?: string;
  updatedAt: string;
}

export type InventoryStatus = 'Available' | 'Reserved' | 'Assigned' | 'Damaged' | 'Lost' | 'Maintenance';

export interface InventoryItem {
  id: string;
  name: string;
  category: 'Flowers' | 'Lights' | 'Audio/Visual' | 'Furniture' | 'Power/Generator' | 'Camera/Equipment' | 'Other';
  quantity: number;
  status: InventoryStatus;
  location?: string;
}

export type AttendanceStatus = 'Present' | 'Absent' | 'On Leave' | 'Late';

export interface StaffMember {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  attendanceStatus: AttendanceStatus;
  shift: 'Day' | 'Night' | 'Full';
  performanceRating: number;
  availability: boolean;
  phone: string;
}

export interface Vendor {
  id: string;
  name: string;
  category: string;
  contact: string;
  email: string;
  rating: number;
  contractValue: number;
  paidAmount: number;
  outstandingAmount: number;
  status: 'Active' | 'Completed' | 'Pending';
  documents?: string[];
}

export interface FinanceTransaction {
  id: string;
  eventId: string;
  type: 'Income' | 'Expense';
  category: string;
  amount: number;
  date: string;
  description: string;
  gstAmount: number;
  status: 'Paid' | 'Pending' | 'Overdue';
  totalAmount?: number;
  paidAmount?: number;
  balanceAmount?: number;
  vendorName?: string;
  transactionTime?: string;
  receiptNo?: string;
}

export interface Issue {
  id: string;
  eventId: string;
  taskName: string;
  department: string;
  description: string;
  reportedBy: string;
  status: 'Open' | 'Resolved';
  reportedAt: string;
  resolvedAt?: string;
}

export interface Comment {
  id: string;
  eventId: string;
  user: string;
  role: UserRole;
  text: string;
  timestamp: string;
}

export interface Attachment {
  id: string;
  eventId: string;
  name: string;
  size: string;
  uploadedBy: string;
  timestamp: string;
  url: string;
}

export interface ActivityLog {
  id: string;
  eventId: string;
  timestamp: string;
  user: string;
  role: string;
  action: string;
  details: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  type: 'info' | 'warning' | 'error' | 'success';
}

export interface AiBriefing {
  summary: string;
  delayedCount: number;
  risks: string[];
  priorityActions: string[];
  bottlenecks: string[];
  resourceAllocation: string[];
  confidenceScore: number;
  timestamp: string;
}
