import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  auth, 
  googleProvider, 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  signInAnonymously,
  type User 
} from '../services/firebase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, pass: string) => Promise<void>;
  signUpWithEmail: (email: string, pass: string) => Promise<void>;
  signInAsGuest: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check local guest session
    const localGuest = sessionStorage.getItem('qrag_guest_user');
    if (localGuest) {
      try {
        setUser(JSON.parse(localGuest));
        setLoading(false);
      } catch {
        // ignore
      }
    }

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        sessionStorage.removeItem('qrag_guest_user');
      } else if (!sessionStorage.getItem('qrag_guest_user')) {
        setUser(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    sessionStorage.removeItem('qrag_guest_user');
    await signInWithPopup(auth, googleProvider);
  };

  const signInWithEmail = async (email: string, pass: string) => {
    sessionStorage.removeItem('qrag_guest_user');
    await signInWithEmailAndPassword(auth, email, pass);
  };

  const signUpWithEmail = async (email: string, pass: string) => {
    sessionStorage.removeItem('qrag_guest_user');
    await createUserWithEmailAndPassword(auth, email, pass);
  };

  const signInAsGuest = async () => {
    try {
      await signInAnonymously(auth);
    } catch {
      // Fallback guest user session if Anonymous auth is not yet toggled on in the Firebase console
      const guestObj = {
        uid: 'guest_' + Math.random().toString(36).substring(2, 9),
        email: 'guest.researcher@qrag.ai',
        displayName: 'Guest Researcher',
        isAnonymous: true
      } as unknown as User;
      sessionStorage.setItem('qrag_guest_user', JSON.stringify(guestObj));
      setUser(guestObj);
    }
  };

  const logout = async () => {
    sessionStorage.removeItem('qrag_guest_user');
    setUser(null);
    try {
      await signOut(auth);
    } catch {
      // ignore
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signInWithGoogle, signInWithEmail, signUpWithEmail, signInAsGuest, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
