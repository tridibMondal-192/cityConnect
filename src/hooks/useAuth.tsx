import { createContext, useContext, useEffect, useState } from 'react';
import {
  User as FirebaseUser,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  updateProfile as firebaseUpdateProfile
} from 'firebase/auth';
import { auth } from '@/integrations/firebase/config';
import { profileService } from '@/integrations/firebase/services';
import { Profile } from '@/integrations/firebase/types';
import { toast } from '@/hooks/use-toast';

interface AuthContextType {
  user: FirebaseUser | null;
  profile: Profile | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string, role?: 'citizen' | 'government') => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      
      if (user) {
        // Fetch user profile
        try {
          const userProfile = await profileService.getProfile(user.uid);
          setProfile(userProfile);
        } catch (error) {
          console.error('Error fetching profile:', error);
          setProfile(null);
        }
      } else {
        setProfile(null);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signUp = async (
    email: string,
    password: string,
    fullName: string,
    role: 'citizen' | 'government' = 'citizen'
  ) => {
    try {
      // Create user with Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Update display name
      await firebaseUpdateProfile(user, {
        displayName: fullName
      });

      // Create user profile in Firestore
      const profileData = {
        userId: user.uid,
        fullName,
        role,
        ...(user.photoURL && { avatarUrl: user.photoURL }),
        ...(role === 'government' && { department: 'General' })
      };
      
      await profileService.createProfile(profileData);

      toast({
        title: 'Account created successfully',
        description: `Welcome, ${fullName}!`,
      });

      return { error: null };
    } catch (error: any) {
      console.error('Sign up error:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      
      let errorMessage = 'An error occurred during sign up';
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'An account with this email already exists';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Password should be at least 6 characters';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Please enter a valid email address';
      } else if (error.code === 'auth/network-request-failed') {
        errorMessage = 'Network error. Please check your internet connection';
      } else if (error.code === 'permission-denied') {
        errorMessage = 'Permission denied. Please contact support';
      }

      toast({
        title: 'Sign up failed',
        description: errorMessage,
        variant: 'destructive',
      });

      return { error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      
      toast({
        title: 'Signed in successfully',
        description: 'Welcome back!',
      });

      return { error: null };
    } catch (error: any) {
      console.error('Sign in error:', error);
      
      let errorMessage = 'An error occurred during sign in';
      if (error.code === 'auth/user-not-found') {
        errorMessage = 'No account found with this email';
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = 'Incorrect password';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Please enter a valid email address';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Too many failed attempts. Please try again later';
      }

      toast({
        title: 'Sign in failed',
        description: errorMessage,
        variant: 'destructive',
      });

      return { error };
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      
      toast({
        title: 'Signed out successfully',
        description: 'Come back soon!',
      });
    } catch (error) {
      console.error('Sign out error:', error);
      
      toast({
        title: 'Sign out failed',
        description: 'An error occurred while signing out',
        variant: 'destructive',
      });
    }
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) {
      throw new Error('No user logged in');
    }

    try {
      await profileService.updateProfile(user.uid, updates);
      
      // Update local profile state
      setProfile(prev => prev ? { ...prev, ...updates } : null);
      
      toast({
        title: 'Profile updated',
        description: 'Your profile has been updated successfully!',
      });
    } catch (error) {
      console.error('Profile update error:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      profile,
      loading,
      signUp: signUp,
      signIn: signIn,
      signOut: signOut,
      updateProfile: updateProfile,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}