import { type CookieOptions, createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });

  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL as string,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
            for (const { name, value } of cookiesToSet) {
              request.cookies.set(name, value);
            }
            response = NextResponse.next({ request });
            for (const { name, value, options } of cookiesToSet) {
              response.cookies.set(name, value, options);
            }
          },
        },
      }
    );

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const isAuthenticated = Boolean(user);
    const pathname = request.nextUrl.pathname;

    const protectedPrefixes = [
      "/dashboard",
      "/inquiries",
      "/profile",
      "/jobs",
      "/schedule",
      "/inventory",
      "/sales",
      "/reports",
      "/staff",
      "/settings",
      "/more",
      "/account",
    ];
    const isProtected = protectedPrefixes.some((prefix) => pathname.startsWith(prefix));

    if (isProtected && !isAuthenticated) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    if (pathname === "/login" && isAuthenticated) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  } catch (error) {
    // If Supabase auth throws in the Edge Runtime (network error, invalid cookie,
    // transient service issue), fail open and let the request through.
    // The layout-level auth guard is the real protection gate.
    console.error("[middleware] Supabase auth error:", error);
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
