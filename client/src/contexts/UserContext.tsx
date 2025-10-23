import React, { createContext, useContext, useState, ReactNode } from 'react';
import { apiService } from '../services/api';
import { User } from '../types';

interface UserContextType {
  currentUser: User | null;
  users: User[];
  teamMembers: User[];
  login: (user: User) => void;
  logout: () => void;
  updateUser: (user: User) => Promise<void>;
  addUser: (user: Omit<User, 'id'>) => void;
  loadUsers: () => Promise<void>;
  loadCurrentUser: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);


export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Persist currentUser in localStorage to avoid resetting on every reload
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const stored = localStorage.getItem('currentUser');
    return stored ? JSON.parse(stored) : null;
  });
  const [users, setUsers] = useState<User[]>([]);
  const [teamMembers, setTeamMembers] = useState<User[]>([]);

  React.useEffect(() => {
    loadUsers();
    loadCurrentUser();
  }, []);

  // Just set the user on login
  const login = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem('currentUser', JSON.stringify(user));
    if (user.id) {
      localStorage.setItem('currentUserId', user.id);
    }
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
    localStorage.removeItem('currentUserId');
    apiService.logout();
  };

  // Update user preferences in DB and state
  const updateUser = async (updatedUser: User) => {
    try {
      const savedUser = await apiService.updateProfile({
        name: updatedUser.name,
        email: updatedUser.email,
        workingHours: updatedUser.workingHours
      });
      setUsers(prev => prev.map(user => user.id === savedUser.id ? savedUser : user));
      if (currentUser && savedUser.id === currentUser.id) {
        setCurrentUser(savedUser);
        localStorage.setItem('currentUser', JSON.stringify(savedUser));
        localStorage.setItem('currentUserId', savedUser.id);
      }
    } catch (error) {
      console.error('Failed to update user:', error);
    }
  };

  const addUser = (userData: Omit<User, 'id'>) => {
    const newUser: User = {
      ...userData,
      id: Date.now().toString()
    };
    setUsers(prev => [...prev, newUser]);
  };

  const loadUsers = async () => {
    try {
      const fetchedUsers = await apiService.getUsers();
      setUsers(fetchedUsers);
    } catch (error) {
      if (error instanceof Error && error.message === 'Access token required') {
        console.error('Access token is missing or invalid. Please log in again.');
      } else {
        console.error('Failed to load users:', error);
      }
    }
  };

  // Load current user profile from backend
  const loadCurrentUser = async () => {
    try {
      // Try to get user profile from backend
      const profile = await apiService.getProfile();
      if (profile && profile.id) {
        setCurrentUser(profile);
        localStorage.setItem('currentUser', JSON.stringify(profile));
        localStorage.setItem('currentUserId', profile.id);
      }
    } catch (error) {
      if (error instanceof Error && error.message === 'Access token required') {
        console.error('Access token is missing or invalid. Please log in again.');
      } else {
        console.error('Failed to load current user:', error);
      }
    }
  };

  return (
    <UserContext.Provider value={{
      currentUser,
      users,
      teamMembers,
      login,
      logout,
      updateUser,
      addUser,
      loadUsers,
      loadCurrentUser,
    }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};