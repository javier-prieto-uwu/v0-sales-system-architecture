import { createClient } from "@supabase/supabase-js"

const isDev = process.env.NODE_ENV !== "production"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || (isDev ? "https://placeholder.supabase.co" : "")
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || (isDev ? "placeholder-key" : "")

// No lanzar error en build/prerender; en producción, asegúrate de setear las env vars en Vercel
export const supabase = createClient(supabaseUrl, supabaseKey)