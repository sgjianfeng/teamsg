import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

export const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  async function signup(email, password) {
    try {
      // First create the auth account
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });
      if (error) throw error;

      // Then create the user profile in our users table
      const { error: profileError } = await supabase
        .from('users')
        .insert([{
          id: data.user.id,
          email: data.user.email,
          created_at: new Date().toISOString()
        }]);
      
      if (profileError) throw profileError;

      return data;
    } catch (error) {
      throw error;
    }
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

    // Check if user profile exists, if not create it
    const { data: profile } = await supabase
      .from('users')
      .select('id')
      .eq('id', data.user.id)
      .single();

    if (!profile) {
      const { error: profileError } = await supabase
        .from('users')
        .insert([{
          id: data.user.id,
          email: data.user.email,
          created_at: new Date().toISOString()
        }]);
      
      if (profileError) {
        console.error('Profile creation error:', profileError);
        throw profileError;
      }
    }

    return data;
  }

  async function logout() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }

  useEffect(() => {
    // Get initial session and ensure user profile exists
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        // Check if user profile exists
        const { data: profile } = await supabase
          .from('users')
          .select('id')
          .eq('id', session.user.id)
          .single();

        if (!profile) {
          // Create profile if it doesn't exist
          await supabase
            .from('users')
            .insert([{
              id: session.user.id,
              email: session.user.email,
              created_at: new Date().toISOString()
            }]);
        }
      }
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
