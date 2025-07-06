import { User as FirebaseUser } from 'firebase/auth';

export interface Profile {
  id: string;
  userId: string;
  fullName: string;
  role: 'citizen' | 'government';
  avatarUrl?: string;
  department?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Issue {
  id: string;
  title: string;
  description: string;
  category: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  location: string;
  userId: string;
  userName: string;
  userRole: 'citizen' | 'government';
  createdAt: Date;
  updatedAt: Date;
  resolvedAt?: Date;
  assignedTo?: string;
  images?: string[];
}

export interface Comment {
  id: string;
  issueId: string;
  content: string;
  userId: string;
  userName: string;
  userRole: 'citizen' | 'government';
  createdAt: Date;
}

export interface CommunityChat {
  id: string;
  content: string;
  userId: string;
  userName: string;
  createdAt: Date;
}

export interface CommunityPoll {
  id: string;
  question: string;
  options: string[];
  createdBy: string;
  createdAt: Date;
}

export interface CommunityPollVote {
  id: string;
  pollId: string;
  userId: string;
  optionIndex: number;
  createdAt: Date;
}

export interface CommunitySurvey {
  id: string;
  title: string;
  questions: string[];
  createdBy: string;
  createdAt: Date;
}

export interface CommunitySurveyResponse {
  id: string;
  surveyId: string;
  userId: string;
  answers: string[];
  createdAt: Date;
}

export interface CommunityEvent {
  id: string;
  name: string;
  date: Date;
  description: string;
  createdBy: string;
  createdAt: Date;
}

export interface CommunityEventSignup {
  id: string;
  eventId: string;
  userId: string;
  createdAt: Date;
}

export interface EmergencyAlert {
  id: string;
  title: string;
  message: string;
  userId: string;
  createdAt: Date;
}

// Firebase Auth User with custom claims
export interface AuthUser extends FirebaseUser {
  role?: 'citizen' | 'government';
  fullName?: string;
} 