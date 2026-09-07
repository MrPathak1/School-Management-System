import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://bfvbeapjqrkolmzgnbfx.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJmdmJlYXBqcXJrb2xtemduYmZ4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEyNzI4NDMsImV4cCI6MjA5Njg0ODg0M30.WR4CGJ4kXL38SKRAUmLwQr78vk5ezYIatRK9GQXByJs';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testConnection() {
  console.log('Testing Supabase connection...');
  try {
    const { data, error } = await supabase.from('users').select('*').limit(1);
    if (error) {
      console.error('Connection failed:', error.message);
      process.exit(1);
    }
    console.log('Connection successful! Data:', data);
  } catch (err) {
    console.error('Unexpected error:', err);
    process.exit(1);
  }
}

testConnection();
