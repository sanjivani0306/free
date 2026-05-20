/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type UserRole = 'Client' | 'Freelancer' | 'Admin';

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  avatarUrl?: string;
  isVerified: boolean;
  isSuspended: boolean;
  twoFactorEnabled?: boolean;
}

export interface Skill {
  name: string;
  level: 'Beginner' | 'Intermediate' | 'Expert';
}

export interface Milestone {
  id: string;
  title: string;
  description: string;
  amount: number;
  status: 'Pending' | 'Escrowed' | 'Released' | 'Refunded';
}

export interface FreelancerProfile {
  userId: string;
  skills: Skill[];
  bio: string;
  title: string;
  hourlyRate: number;
  certifications: string[];
  workExperience: {
    id: string;
    company: string;
    role: string;
    duration: string;
    description: string;
  }[];
  portfolio: {
    id: string;
    title: string;
    description: string;
    imageUrl: string;
    projectUrl?: string;
  }[];
  availability: {
    slots: string[]; // e.g. "Mon 09:00 - 12:00"
    isBooked: Record<string, boolean>;
  };
  reputationScore: number; // 0 to 100 weighted
  profileViews: number;
  earningsThisMonth: number;
  completedJobsCount: number;
}

export interface Gig {
  id: string;
  clientId: string;
  clientName: string;
  title: string;
  description: string;
  category: string;
  budgetMin: number;
  budgetMax: number;
  location: string;
  skillsRequired: string[];
  status: 'Open' | 'In Progress' | 'Completed' | 'Draft' | 'Suspended';
  milestones: Milestone[];
  createdAt: string;
}

export interface Proposal {
  id: string;
  gigId: string;
  gigTitle: string;
  clientId: string;
  freelancerId: string;
  freelancerName: string;
  freelancerRating: number;
  bidAmount: number;
  coverLetter: string;
  timelineDays: number;
  status: 'Pending' | 'Accepted' | 'Rejected' | 'Completed';
  createdAt: string;
  progressPercentage: number;
  uploadedFiles: string[];
  progressLogs: {
    id: string;
    text: string;
    timestamp: string;
  }[];
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  fileAttachment?: {
    name: string;
    url: string;
    type: string;
  };
  timestamp: string;
  read: boolean;
}

export interface ChatChannel {
  id: string; // gigId or proposalId
  title: string;
  participants: {
    id: string;
    name: string;
    role: UserRole;
  }[];
  messages: ChatMessage[];
}

export interface Review {
  id: string;
  gigId: string;
  gigTitle: string;
  reviewerId: string;
  reviewerName: string;
  reviewerRole: UserRole;
  targetId: string; // freelancerId or clientId
  rating: number; // 1-5
  text: string;
  weightedScoreImpact: number; // based on user verification & experience
  isVerifiedReview: boolean;
  isFlaggedAsFraud: boolean;
  createdAt: string;
}

export interface Transaction {
  id: string;
  gigId: string;
  gigTitle: string;
  type: 'Escrow Lock' | 'Milestone Outflow' | 'Refund' | 'Admin Commission';
  amount: number;
  status: 'Pending' | 'Success' | 'Failed';
  senderName: string;
  receiverName: string;
  createdAt: string;
}

export interface Dispute {
  id: string;
  gigId: string;
  gigTitle: string;
  clientId: string;
  clientName: string;
  freelancerId: string;
  freelancerName: string;
  reason: string;
  amount: number;
  evidenceUrl?: string;
  evidenceText: string;
  status: 'Open' | 'Resolved (Paid Freelancer)' | 'Resolved (Refunded Client)';
  adminDecision?: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  text: string;
  type: 'info' | 'success' | 'warning' | 'payment';
  read: boolean;
  createdAt: string;
}

export interface Booking {
  id: string;
  freelancerId: string;
  clientId: string;
  clientName: string;
  slot: string;
  status: 'Pending' | 'Confirmed' | 'Declined';
  title: string;
  price: number;
  createdAt: string;
}

export interface SearchFilters {
  query: string;
  location: string;
  category: string;
  minBudget: number;
  maxBudget: number;
  skills: string[];
  minRating: number;
}
