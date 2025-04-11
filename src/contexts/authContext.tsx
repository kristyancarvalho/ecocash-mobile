import React, { createContext, useState, useEffect, useContext } from 'react';
import { auth } from '@/firebase/config';
import { onAuthStateChanged, User } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getUserById } from '@/firebase/firestore';
import { router } from 'expo-router';

type AuthContextType = {
  currentUser: User | null;
  userData: any | null;
  isLoading: boolean;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  userData: null,
  isLoading: true,
  logout: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      
      if (user) {
        try {
          const userDoc = await getUserById(user.uid);
          setUserData(userDoc);
          
          await AsyncStorage.setItem('userLoggedIn', 'true');
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      } else {
        setUserData(null);

        const userLoggedIn = await AsyncStorage.getItem('userLoggedIn');
        if (!userLoggedIn) {
          router.replace('/login');
        }
      }
      
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const logout = async () => {
    try {
      await auth.signOut();
      await AsyncStorage.removeItem('userLoggedIn');
      router.replace('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const value = {
    currentUser,
    userData,
    isLoading,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};