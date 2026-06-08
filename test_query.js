import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://dummy-url.supabase.co'
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || 'dummy-key-to-prevent-crash'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function test() {
  const { data, error } = await supabase
    .from('reports')
    .select('*')
    .limit(1)
  
  if (error) {
    console.error("QUERY ERROR:", error)
  } else {
    console.log("QUERY SUCCESS, columns:", data[0] ? Object.keys(data[0]) : "No data")
  }
}

test()
