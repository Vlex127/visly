import create from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { auth } from '../services/firebaseService';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth';

interface User {
  uid: string;
  email: string;
  displayName?: string;
}

interface AuthStore {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  initializeAuth: () => Promise<void>;
  signup: (email: string, password: string, displayName: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,

  initializeAuth: async () => {
    try {
      set({ isLoading: true });
      const storedUser = await SecureStore.getItemAsync('user');
      if (storedUser) {
        set({ user: JSON.parse(storedUser), isAuthenticated: true });
      }
    } catch (err) {
      set({ error: 'Failed to initialize auth' });
    } finally {
      set({ isLoading: false });
    }
  },

  signup: async (email: string, password: string, displayName: string) => {
    try {
      set({ isLoading: true, error: null });
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user: User = {
        uid: userCredential.user.uid,
        email: userCredential.user.email || email,
        displayName,
      };
      await SecureStore.setItemAsync('user', JSON.stringify(user));
      set({ user, isAuthenticated: true });
    } catch (err: any) {
      set({ error: err.message });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  login: async (email: string, password: string) => {
    try {
      set({ isLoading: true, error: null });
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user: User = {
        uid: userCredential.user.uid,
        email: userCredential.user.email || email,
      };
      await SecureStore.setItemAsync('user', JSON.stringify(user));
      set({ user, isAuthenticated: true });
    } catch (err: any) {
      set({ error: err.message });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  logout: async () => {
    try {
      set({ isLoading: true });
      await signOut(auth);
      await SecureStore.deleteItemAsync('user');
      set({ user: null, isAuthenticated: false });
    } catch (err: any) {
      set({ error: err.message });
    } finally {
      set({ isLoading: false });
    }
  },

  clearError: () => set({ error: null }),
}));
