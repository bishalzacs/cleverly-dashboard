import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Fetch the current user to trigger token refresh if needed
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Protect all routes by default except for specific public routes
  const isAuthPage = request.nextUrl.pathname.startsWith('/login') || request.nextUrl.pathname.startsWith('/update-password');
  const isApiRoute = request.nextUrl.pathname.startsWith('/api');
  
  // Exclude static files and Next.js internal paths from redirects
  const isStaticFilePattern = request.nextUrl.pathname.match(/\.(.*)$/);
  
  if (!isStaticFilePattern && !isApiRoute) {
      if (!user && !isAuthPage) {
        // no user, potentially respond by redirecting the user to the login page
        const url = request.nextUrl.clone()
        url.pathname = '/login'
        return NextResponse.redirect(url)
      }
      
      if (user && isAuthPage) {
        // user is already logged in, redirect them away from auth pages
        const url = request.nextUrl.clone()
        url.pathname = '/'
        return NextResponse.redirect(url)
      }
  }

  return supabaseResponse
}
