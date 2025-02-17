import { supabase } from '../../supabaseClient'

/**
 * Migration to create teams table
 */
export async function createTeamsTable() {
  try {
    // Try to access the teams table to check if it exists
    const { error: checkError } = await supabase
      .from('teams')
      .select('id')
      .limit(1);

    // If table doesn't exist, redirect to setup page
    if (checkError?.code === '42P01' || checkError?.message?.includes('relation "teams" does not exist')) {
      console.log('Please visit the Database Setup page (/database-setup) for setup instructions.');
      window.location.href = '/database-setup';
      return;
    }

    console.log('Database schema already exists');
  } catch (error) {
    console.error('Error checking database:', error);
    console.log('Please visit the Database Setup page (/database-setup) for setup instructions.');
    window.location.href = '/database-setup';
  }
}
