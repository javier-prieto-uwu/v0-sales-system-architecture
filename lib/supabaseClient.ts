import { createClient } from "@supabase/supabase-js"

const isDev = process.env.NODE_ENV !== "production"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || (isDev ? "https://placeholder.supabase.co" : "")
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || (isDev ? "placeholder-key" : "")

if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    "Variables de entorno de Supabase faltantes. Configura NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY."
  )
}

export const supabase = createClient(supabaseUrl, supabaseKey)