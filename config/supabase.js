/**
 * Supabase client configuration.
 * Reads credentials from environment variables (see .env.example).
 */
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.warn(
    '[Supabase] Missing SUPABASE_URL or SUPABASE_ANON_KEY. ' +
    'Copy .env.example to .env and fill in your project credentials.'
  );
}

const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = supabase;
