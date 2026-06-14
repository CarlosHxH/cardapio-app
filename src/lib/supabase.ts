import { createClient } from '@supabase/supabase-js'

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_ANON_KEY: string
}

declare global {
  interface ImportMeta {
    readonly env: ImportMetaEnv
  }
}

const supabaseUrl  = import.meta.env.VITE_SUPABASE_URL  as string
const supabaseAnon = import.meta.env.VITE_SUPABASE_ANON_KEY as string

if (!supabaseUrl || !supabaseAnon) {
  throw new Error(
    'Variáveis VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY não encontradas.\n' +
    'Copie .env.example para .env e preencha com suas credenciais do Supabase.'
  )
}

export const supabase = createClient(supabaseUrl, supabaseAnon, {
  realtime: { params: { eventsPerSecond: 10 } },
})
