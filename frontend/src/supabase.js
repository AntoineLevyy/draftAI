import { createClient } from '@supabase/supabase-js'

// Supabase project configuration
const supabaseUrl = 'https://imylrnmsbiewyagaoxno.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlteWxybm1zYmlld3lhZ2FveG5vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIzMjMyOTQsImV4cCI6MjA2Nzg5OTI5NH0.IwO3BC7srcJ68R_Nt1F169S1qiZMjGm56wg0_q1EswY'

export const supabase = createClient(supabaseUrl, supabaseAnonKey) 