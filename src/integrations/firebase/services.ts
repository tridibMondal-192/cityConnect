import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  onSnapshot,
  Timestamp
} from 'firebase/firestore';
import { db } from './config';
import {
  Profile,
  Issue,
  Comment,
  CommunityChat,
  CommunityPoll,
  CommunityPollVote,
  CommunitySurvey,
  CommunitySurveyResponse,
  CommunityEvent,
  CommunityEventSignup,
  EmergencyAlert
} from './types';

// Helper function to convert Firestore timestamp to Date
const convertTimestamp = (timestamp: any): Date => {
  if (!timestamp) {
    return new Date(); // Return current date if timestamp is null/undefined
  }
  if (timestamp instanceof Timestamp) {
    return timestamp.toDate();
  }
  if (timestamp instanceof Date) {
    return timestamp;
  }
  // Try to create a Date from the timestamp
  try {
    return new Date(timestamp);
  } catch (error) {
    console.warn('Invalid timestamp, using current date:', timestamp);
    return new Date();
  }
};

// Helper function to convert Date to Firestore timestamp
const toTimestamp = (date: Date) => Timestamp.fromDate(date);

// Profile services
export const profileService = {
  async getProfile(userId: string): Promise<Profile | null> {
    try {
      const docRef = doc(db, 'profiles', userId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          userId: data.userId,
          fullName: data.fullName,
          role: data.role,
          avatarUrl: data.avatarUrl,
          department: data.department,
          createdAt: convertTimestamp(data.createdAt),
          updatedAt: convertTimestamp(data.updatedAt)
        };
      }
      return null;
    } catch (error) {
      console.error('Error getting profile:', error);
      return null;
    }
  },

  async createProfile(profile: Omit<Profile, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      // Use the userId as the document ID to ensure consistency
      const docRef = doc(db, 'profiles', profile.userId);
      
      // Filter out undefined values to prevent Firestore errors
      const cleanProfile = Object.fromEntries(
        Object.entries(profile).filter(([_, value]) => value !== undefined)
      );
      
      const profileData = {
        ...cleanProfile,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      
      await setDoc(docRef, profileData);
      return profile.userId;
    } catch (error) {
      console.error('Profile service: Error creating profile:', error);
      throw error;
    }
  },

  async updateProfile(userId: string, updates: Partial<Profile>): Promise<void> {
    try {
      const docRef = doc(db, 'profiles', userId);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  }
};

// Issue services
export const issueService = {
  async getIssues(): Promise<Issue[]> {
    try {
      const q = query(collection(db, 'issues'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          title: data.title,
          description: data.description,
          category: data.category,
          status: data.status,
          priority: data.priority,
          location: data.location,
          userId: data.userId,
          userName: data.userName,
          userRole: data.userRole,
          createdAt: convertTimestamp(data.createdAt),
          updatedAt: convertTimestamp(data.updatedAt),
          resolvedAt: data.resolvedAt ? convertTimestamp(data.resolvedAt) : undefined,
          assignedTo: data.assignedTo,
          images: data.images || []
        };
      });
    } catch (error) {
      console.error('Error getting issues:', error);
      return [];
    }
  },

  async getIssue(id: string): Promise<Issue | null> {
    try {
      const docRef = doc(db, 'issues', id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          title: data.title,
          description: data.description,
          category: data.category,
          status: data.status,
          priority: data.priority,
          location: data.location,
          userId: data.userId,
          userName: data.userName,
          userRole: data.userRole,
          createdAt: convertTimestamp(data.createdAt),
          updatedAt: convertTimestamp(data.updatedAt),
          resolvedAt: data.resolvedAt ? convertTimestamp(data.resolvedAt) : undefined,
          assignedTo: data.assignedTo,
          images: data.images || []
        };
      }
      return null;
    } catch (error) {
      console.error('Error getting issue:', error);
      return null;
    }
  },

  async createIssue(issue: Omit<Issue, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, 'issues'), {
        ...issue,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating issue:', error);
      throw error;
    }
  },

  async updateIssue(id: string, updates: Partial<Issue>): Promise<void> {
    try {
      const docRef = doc(db, 'issues', id);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating issue:', error);
      throw error;
    }
  },

  async deleteIssue(id: string): Promise<void> {
    try {
      const docRef = doc(db, 'issues', id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error deleting issue:', error);
      throw error;
    }
  }
};

// Comment services
export const commentService = {
  async getComments(issueId: string): Promise<Comment[]> {
    try {
      const q = query(
        collection(db, 'comments'),
        where('issueId', '==', issueId),
        orderBy('createdAt', 'asc')
      );
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          issueId: data.issueId,
          content: data.content,
          userId: data.userId,
          userName: data.userName,
          userRole: data.userRole,
          createdAt: convertTimestamp(data.createdAt)
        };
      });
    } catch (error) {
      console.error('Error getting comments:', error);
      return [];
    }
  },

  async createComment(comment: Omit<Comment, 'id' | 'createdAt'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, 'comments'), {
        ...comment,
        createdAt: serverTimestamp()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating comment:', error);
      throw error;
    }
  }
};

// Community services
export const communityService = {
  // Chat
  async getChatMessages(): Promise<CommunityChat[]> {
    try {
      const q = query(collection(db, 'community_chat'), orderBy('createdAt', 'desc'), limit(50));
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          content: data.content,
          userId: data.userId,
          userName: data.userName,
          createdAt: convertTimestamp(data.createdAt)
        };
      }).reverse(); // Show newest at bottom
    } catch (error) {
      console.error('Error getting chat messages:', error);
      return [];
    }
  },

  async createChatMessage(message: Omit<CommunityChat, 'id' | 'createdAt'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, 'community_chat'), {
        ...message,
        createdAt: serverTimestamp()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating chat message:', error);
      throw error;
    }
  },

  // Emergency Alerts
  async getEmergencyAlerts(): Promise<EmergencyAlert[]> {
    try {
      const q = query(collection(db, 'emergency_alerts'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          title: data.title,
          message: data.message,
          userId: data.userId,
          createdAt: convertTimestamp(data.createdAt)
        };
      });
    } catch (error) {
      console.error('Error getting emergency alerts:', error);
      return [];
    }
  },

  async createEmergencyAlert(alert: Omit<EmergencyAlert, 'id' | 'createdAt'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, 'emergency_alerts'), {
        ...alert,
        createdAt: serverTimestamp()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating emergency alert:', error);
      throw error;
    }
  },

  // Polls
  async getPolls(): Promise<CommunityPoll[]> {
    try {
      const q = query(collection(db, 'community_polls'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          question: data.question,
          options: data.options,
          createdBy: data.createdBy,
          createdAt: convertTimestamp(data.createdAt)
        };
      });
    } catch (error) {
      console.error('Error getting polls:', error);
      return [];
    }
  },

  async createPoll(poll: Omit<CommunityPoll, 'id' | 'createdAt'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, 'community_polls'), {
        ...poll,
        createdAt: serverTimestamp()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating poll:', error);
      throw error;
    }
  },

  async getPollVotes(pollId: string): Promise<CommunityPollVote[]> {
    try {
      const q = query(
        collection(db, 'community_poll_votes'),
        where('pollId', '==', pollId)
      );
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          pollId: data.pollId,
          userId: data.userId,
          optionIndex: data.optionIndex,
          createdAt: convertTimestamp(data.createdAt)
        };
      });
    } catch (error) {
      console.error('Error getting poll votes:', error);
      return [];
    }
  },

  async voteInPoll(vote: Omit<CommunityPollVote, 'id' | 'createdAt'>): Promise<string> {
    try {
      // Check if user already voted
      const existingVote = await this.getUserPollVote(vote.pollId, vote.userId);
      if (existingVote) {
        // Check if vote can still be changed (within 15 minutes)
        const voteTime = new Date(existingVote.createdAt);
        const currentTime = new Date();
        const timeDifference = currentTime.getTime() - voteTime.getTime();
        const fifteenMinutes = 15 * 60 * 1000; // 15 minutes in milliseconds
        
        if (timeDifference > fifteenMinutes) {
          throw new Error('Vote cannot be changed after 15 minutes');
        }
        
        // Update existing vote
        const docRef = doc(db, 'community_poll_votes', existingVote.id);
        await updateDoc(docRef, {
          optionIndex: vote.optionIndex,
          createdAt: serverTimestamp()
        });
        return existingVote.id;
      } else {
        // Create new vote
        const docRef = await addDoc(collection(db, 'community_poll_votes'), {
          ...vote,
          createdAt: serverTimestamp()
        });
        return docRef.id;
      }
    } catch (error) {
      console.error('Error voting in poll:', error);
      throw error;
    }
  },

  async getUserPollVote(pollId: string, userId: string): Promise<CommunityPollVote | null> {
    try {
      const q = query(
        collection(db, 'community_poll_votes'),
        where('pollId', '==', pollId),
        where('userId', '==', userId)
      );
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.docs.length > 0) {
        const data = querySnapshot.docs[0].data();
        return {
          id: querySnapshot.docs[0].id,
          pollId: data.pollId,
          userId: data.userId,
          optionIndex: data.optionIndex,
          createdAt: convertTimestamp(data.createdAt)
        };
      }
      return null;
    } catch (error) {
      console.error('Error getting user poll vote:', error);
      return null;
    }
  },

  // Surveys
  async getSurveys(): Promise<CommunitySurvey[]> {
    try {
      const q = query(collection(db, 'community_surveys'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          title: data.title,
          questions: data.questions,
          createdBy: data.createdBy,
          createdAt: convertTimestamp(data.createdAt)
        };
      });
    } catch (error) {
      console.error('Error getting surveys:', error);
      return [];
    }
  },

  async createSurvey(survey: Omit<CommunitySurvey, 'id' | 'createdAt'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, 'community_surveys'), {
        ...survey,
        createdAt: serverTimestamp()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating survey:', error);
      throw error;
    }
  },

  async submitSurveyResponse(response: Omit<CommunitySurveyResponse, 'id' | 'createdAt'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, 'community_survey_responses'), {
        ...response,
        createdAt: serverTimestamp()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error submitting survey response:', error);
      throw error;
    }
  },

  async getSurveyResponses(surveyId: string): Promise<CommunitySurveyResponse[]> {
    try {
      const q = query(
        collection(db, 'community_survey_responses'),
        where('surveyId', '==', surveyId)
      );
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          surveyId: data.surveyId,
          userId: data.userId,
          answers: data.answers,
          createdAt: convertTimestamp(data.createdAt)
        };
      });
    } catch (error) {
      console.error('Error getting survey responses:', error);
      return [];
    }
  },

  // Events
  async getEvents(): Promise<CommunityEvent[]> {
    try {
      const q = query(collection(db, 'community_events'), orderBy('date', 'asc'));
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data.name,
          date: convertTimestamp(data.date),
          description: data.description,
          createdBy: data.createdBy,
          createdAt: convertTimestamp(data.createdAt)
        };
      });
    } catch (error) {
      console.error('Error getting events:', error);
      return [];
    }
  },

  async createEvent(event: Omit<CommunityEvent, 'id' | 'createdAt'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, 'community_events'), {
        ...event,
        date: toTimestamp(event.date),
        createdAt: serverTimestamp()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating event:', error);
      throw error;
    }
  },

  async signupForEvent(signup: Omit<CommunityEventSignup, 'id' | 'createdAt'>): Promise<string> {
    try {
      // Check if user already signed up
      const existingSignup = await this.getUserEventSignup(signup.eventId, signup.userId);
      if (existingSignup) {
        throw new Error('User already signed up for this event');
      }
      
      const docRef = await addDoc(collection(db, 'community_event_signups'), {
        ...signup,
        createdAt: serverTimestamp()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error signing up for event:', error);
      throw error;
    }
  },

  async getUserEventSignup(eventId: string, userId: string): Promise<CommunityEventSignup | null> {
    try {
      const q = query(
        collection(db, 'community_event_signups'),
        where('eventId', '==', eventId),
        where('userId', '==', userId)
      );
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.docs.length > 0) {
        const data = querySnapshot.docs[0].data();
        return {
          id: querySnapshot.docs[0].id,
          eventId: data.eventId,
          userId: data.userId,
          createdAt: convertTimestamp(data.createdAt)
        };
      }
      return null;
    } catch (error) {
      console.error('Error getting user event signup:', error);
      return null;
    }
  },

  async getEventSignups(eventId: string): Promise<CommunityEventSignup[]> {
    try {
      const q = query(
        collection(db, 'community_event_signups'),
        where('eventId', '==', eventId)
      );
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          eventId: data.eventId,
          userId: data.userId,
          createdAt: convertTimestamp(data.createdAt)
        };
      });
    } catch (error) {
      console.error('Error getting event signups:', error);
      return [];
    }
  }
};

// Real-time listeners
export const realtimeService = {
  onIssuesChange(callback: (issues: Issue[]) => void) {
    const q = query(collection(db, 'issues'), orderBy('createdAt', 'desc'));
    return onSnapshot(q, (querySnapshot) => {
      const issues = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          title: data.title,
          description: data.description,
          category: data.category,
          status: data.status,
          priority: data.priority,
          location: data.location,
          userId: data.userId,
          userName: data.userName,
          userRole: data.userRole,
          createdAt: convertTimestamp(data.createdAt),
          updatedAt: convertTimestamp(data.updatedAt),
          resolvedAt: data.resolvedAt ? convertTimestamp(data.resolvedAt) : undefined,
          assignedTo: data.assignedTo,
          images: data.images || []
        };
      });
      callback(issues);
    });
  },

  onChatMessagesChange(callback: (messages: CommunityChat[]) => void) {
    const q = query(collection(db, 'community_chat'), orderBy('createdAt', 'desc'), limit(50));
    return onSnapshot(q, (querySnapshot) => {
      const messages = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          content: data.content,
          userId: data.userId,
          userName: data.userName,
          createdAt: convertTimestamp(data.createdAt)
        };
      }).reverse();
      callback(messages);
    });
  },

  onEmergencyAlertsChange(callback: (alerts: EmergencyAlert[]) => void) {
    const q = query(collection(db, 'emergency_alerts'), orderBy('createdAt', 'desc'));
    return onSnapshot(q, (querySnapshot) => {
      const alerts = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          title: data.title,
          message: data.message,
          userId: data.userId,
          createdAt: convertTimestamp(data.createdAt)
        };
      });
      callback(alerts);
    });
  },

  onPollsChange(callback: (polls: CommunityPoll[]) => void) {
    const q = query(collection(db, 'community_polls'), orderBy('createdAt', 'desc'));
    return onSnapshot(q, (querySnapshot) => {
      const polls = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          question: data.question,
          options: data.options,
          createdBy: data.createdBy,
          createdAt: convertTimestamp(data.createdAt)
        };
      });
      callback(polls);
    });
  },

  onSurveysChange(callback: (surveys: CommunitySurvey[]) => void) {
    const q = query(collection(db, 'community_surveys'), orderBy('createdAt', 'desc'));
    return onSnapshot(q, (querySnapshot) => {
      const surveys = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          title: data.title,
          questions: data.questions,
          createdBy: data.createdBy,
          createdAt: convertTimestamp(data.createdAt)
        };
      });
      callback(surveys);
    });
  },

  onEventsChange(callback: (events: CommunityEvent[]) => void) {
    const q = query(collection(db, 'community_events'), orderBy('date', 'asc'));
    return onSnapshot(q, (querySnapshot) => {
      const events = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data.name,
          date: convertTimestamp(data.date),
          description: data.description,
          createdBy: data.createdBy,
          createdAt: convertTimestamp(data.createdAt)
        };
      });
      callback(events);
    });
  },

  onPollVotesChange(pollId: string, callback: (votes: CommunityPollVote[]) => void) {
    const q = query(
      collection(db, 'community_poll_votes'),
      where('pollId', '==', pollId)
    );
    return onSnapshot(q, (querySnapshot) => {
      const votes = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          pollId: data.pollId,
          userId: data.userId,
          optionIndex: data.optionIndex,
          createdAt: convertTimestamp(data.createdAt)
        };
      });
      callback(votes);
    });
  },

  onSurveyResponsesChange(surveyId: string, callback: (responses: CommunitySurveyResponse[]) => void) {
    const q = query(
      collection(db, 'community_survey_responses'),
      where('surveyId', '==', surveyId)
    );
    return onSnapshot(q, (querySnapshot) => {
      const responses = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          surveyId: data.surveyId,
          userId: data.userId,
          answers: data.answers,
          createdAt: convertTimestamp(data.createdAt)
        };
      });
      callback(responses);
    });
  },

  onEventSignupsChange(eventId: string, callback: (signups: CommunityEventSignup[]) => void) {
    const q = query(
      collection(db, 'community_event_signups'),
      where('eventId', '==', eventId)
    );
    return onSnapshot(q, (querySnapshot) => {
      const signups = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          eventId: data.eventId,
          userId: data.userId,
          createdAt: convertTimestamp(data.createdAt)
        };
      });
      callback(signups);
    });
  }
}; 