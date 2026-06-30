import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
dotenv.config()

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY
const supabase = createClient(supabaseUrl, supabaseKey)

async function test() {
  const { data: report, error } = await supabase.from('reports').select('*').limit(1).single()
  console.log('Report:', report)
  console.log('student_id type:', typeof report.student_id)
  
  const { data: student } = await supabase.from('students').select('*').eq('id', report.student_id).single()
  console.log('Student:', student)
}

test()
