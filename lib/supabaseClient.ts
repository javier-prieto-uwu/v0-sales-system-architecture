import { createClient } from "@supabase/supabase-js"

// Usar fallback seguro SIEMPRE para evitar fallos en build/prerender
const FALLBACK_URL = "https://placeholder.supabase.co"
const FALLBACK_KEY = "placeholder-key"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || FALLBACK_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || FALLBACK_KEY

export const SUPABASE_IS_CONFIGURED =
  supabaseUrl !== FALLBACK_URL && supabaseKey !== FALLBACK_KEY

export const supabase = createClient(supabaseUrl, supabaseKey)