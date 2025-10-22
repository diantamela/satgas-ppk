import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://abdmnifnprgcamkdovjx.supabase.co'
const supabaseKey = process.env.SUPABASE_KEY || process.env.SUPABASE_ANON_KEY || ''

export const supabase = createClient(supabaseUrl, supabaseKey)

// For server-side operations with service role key
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)