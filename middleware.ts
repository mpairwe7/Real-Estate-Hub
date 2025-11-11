import createMiddleware from 'next-intl/middleware'
import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"
import { locales, defaultLocale } from '@/lib/i18n-config'

// Create the next-intl middleware
const intlMiddleware = createMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'always' // Always show locale in URL for clarity
})

export async function middleware(request: NextRequest) {
  // Handle root path explicitly - redirect to default locale
  if (request.nextUrl.pathname === '/') {
    const url = request.nextUrl.clone()
    url.pathname = `/${defaultLocale}`
    return NextResponse.redirect(url)
  }

  // First handle internationalization
  const intlResponse = intlMiddleware(request)
  
  // Then handle Supabase session with the intl response
  let supabaseResponse = NextResponse.next({
    request: {
      headers: intlResponse.headers,
    },
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
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request: {
              headers: intlResponse.headers,
            },
          })
          cookiesToSet.forEach(({ name, value, options }) => 
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    },
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Get the locale from the pathname
  const pathnameLocale = request.nextUrl.pathname.split('/')[1]
  const currentLocale = locales.includes(pathnameLocale as any) ? pathnameLocale : defaultLocale

  // Protected routes - redirect to login if not authenticated
  if (
    !user &&
    !request.nextUrl.pathname.startsWith(`/${currentLocale}/auth`) &&
    !request.nextUrl.pathname.startsWith(`/${currentLocale}/api`) &&
    request.nextUrl.pathname !== '/' &&
    request.nextUrl.pathname !== `/${currentLocale}` &&
    !request.nextUrl.pathname.startsWith('/_next')
  ) {
    const url = request.nextUrl.clone()
    url.pathname = `/${currentLocale}/auth/login`
    return NextResponse.redirect(url)
  }

  // Copy intl headers to supabase response
  intlResponse.headers.forEach((value, key) => {
    supabaseResponse.headers.set(key, value)
  })

  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images - .svg, .png, .jpg, .jpeg, .gif, .webp
     * Feel free to modify this pattern to include more paths.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
