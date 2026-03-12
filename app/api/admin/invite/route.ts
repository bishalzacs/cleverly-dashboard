import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'

export async function POST(request: Request) {
  try {
    const supabaseUserClient = await createClient();
    
    // 1. Verify caller is authenticated
    const { data: { user }, error: authError } = await supabaseUserClient.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 2. Verify caller is an admin
    const { data: profile, error: profileError } = await supabaseUserClient
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profileError || profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden: Admins Only' }, { status: 403 })
    }

    // 3. Parse request
    const { email } = await request.json()
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    // 4. Create Service Role Client to perform admin action
    const supabaseAdmin = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // 5. Send Invite
    const { data: inviteData, error: inviteError } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
      data: { role: 'user' },
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/update-password`
    })

    if (inviteError) {
      console.error("Invite Error:", inviteError.message)
      // Check for user already exists error
      if (inviteError.message.includes('already been registered')) {
        return NextResponse.json({ error: 'This user has already been registered.' }, { status: 400 })
      }
      return NextResponse.json({ error: inviteError.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, user: inviteData.user })

  } catch (error: any) {
    console.error("Admin Invite Route Error:", error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
