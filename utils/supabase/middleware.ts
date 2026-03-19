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

  // Protect all routes by default except for specific public routes
  const isAuthPage = request.nextUrl.pathname.startsWith('/login') || request.nextUrl.pathname.startsWith('/update-password');
  const isApiRoute = request.nextUrl.pathname.startsWith('/api');
  
  // Exclude static files and Next.js internal paths from redirects
  const isStaticFilePattern = request.nextUrl.pathname.match(/\.(.*)$/);
  
  // Optimization: Skip auth check in middleware for API routes and static files.
  // API routes handle their own authentication, and static files don't need it.
  if (isStaticFilePattern || isApiRoute) {
      return supabaseResponse;
  }

  // Lightweight check: Redirect to login only if NO Supabase session cookie exists.
  // This bypasses the heavy getUser() call which was taking 15s+ and causing 504s.
  // Strict auth validation now happens at the Page/API level which has a higher timeout.
  const allCookies = request.cookies.getAll();
  const hasSessionCookie = allCookies.some(c => c.name.startsWith('sb-') && c.name.endsWith('-auth-token'));

  if (!hasSessionCookie && !isAuthPage && !isApiRoute && !isStaticFilePattern) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}
