import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
    let supabaseResponse = NextResponse.next({
        request,
    });

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll();
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) =>
                        request.cookies.set(name, value)
                    );
                    supabaseResponse = NextResponse.next({
                        request,
                    });
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    );
                },
            },
        }
    );

    // This is the important part: it refreshes the auth token if it's expired
    // so the user doesn't get logged out while using the app.
    const {
        data: { user },
    } = await supabase.auth.getUser();

    // ----------------------------------------------------------------
    // BOUNDARY CHECK: Protecting specific pages
    // ----------------------------------------------------------------
    const url = request.nextUrl.clone();

    // Sensitive routes that require strict authentication redirect
    const protectedPaths = ["/admin"];
    const isProtectedPath = protectedPaths.some((path) => url.pathname.startsWith(path));

    if (!user && isProtectedPath) {
        // We let the client-side handle the "Access Denied" UI for specific interactive flows,
        // but for deep links, we redirect them to home (which shows the hero + sign in).
        url.pathname = "/";
        return NextResponse.redirect(url);
    }

    return supabaseResponse;
}
