import { supabase } from '../supabaseClient'

export async function execSql(sql) {
  try {
    // Try direct SQL execution first
    const { data, error: execError } = await supabase.rpc('exec_sql', { sql });
    if (!execError) return { data };

    // If exec_sql RPC doesn't exist, create it
    const createRpc = `
      CREATE OR REPLACE FUNCTION exec_sql(sql text)
      RETURNS void
      LANGUAGE plpgsql
      SECURITY DEFINER
      AS $$
      BEGIN
        EXECUTE sql;
      END;
      $$;
    `;

    const { error: createError } = await supabase.rpc('exec_sql', { sql: createRpc });
    if (createError) throw createError;

    // Try executing the SQL again
    const { error: retryError } = await supabase.rpc('exec_sql', { sql });
    if (retryError) throw retryError;

    return { success: true };
  } catch (error) {
    console.error('Error executing SQL:', error);
    return { error: error.message };
  }
}
