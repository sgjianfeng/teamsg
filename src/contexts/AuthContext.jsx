import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  async function signup(email, password) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    if (error) throw error;
    return data;
  }

  async function verifyOtp(email, token, type = 'email') {
    console.log('Attempting to verify OTP for:', email, 'with type:', type);
    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: type
    });
    if (error) {
      console.error('OTP verification error:', error);
      throw error;
    }
    console.log('OTP verification successful:', data);
    return data;
  }

  async function login(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    if (error) {
      console.error('Login error:', error);
      throw error;
    }
    return data;
  }

  async function logout() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setCurrentUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setCurrentUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  async function resetPassword(email) {
    console.log('Requesting password reset for:', email);
    const { data, error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) {
      console.error('Password reset error:', error);
      throw error;
    }
    console.log('Password reset email sent:', data);
    return data;
  }

  const value = {
    currentUser,
    signup,
    verifyOtp,
    login,
    logout,
    resetPassword
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
