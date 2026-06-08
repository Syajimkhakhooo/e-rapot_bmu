import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://dummy-url.supabase.co'
const supabaseServiceKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY || 'dummy-key-to-prevent-crash'

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

export const createUserProfile = async (email, password, name, role) => {
  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true
  })
  if (authError) throw authError
  
  const { error: dbError } = await supabaseAdmin.from('users').insert([{ id: authData.user.id, email, name, role }])
  if (dbError) throw dbError
  return authData.user
}

export const updateUserProfile = async (id, email, password, name, role) => {
  const updateData = { email }
  if (password && password.trim() !== '') {
    updateData.password = password
  }
  
  const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(id, updateData)
  if (authError) throw authError
  
  const { error: dbError } = await supabaseAdmin.from('users').update({ email, name, role }).eq('id', id)
  if (dbError) throw dbError
  return true
}

export const deleteUserProfile = async (id) => {
  const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(id)
  if (authError) throw authError
  
  // The 'users' table record will likely be deleted by cascade, but just in case:
  await supabaseAdmin.from('users').delete().eq('id', id)
  return true
}
