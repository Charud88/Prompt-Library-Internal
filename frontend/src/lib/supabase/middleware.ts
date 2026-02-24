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

    // If there is no user and they are trying to go to /submit or /admin or /library
    if (
        !user &&
        (url.pathname.startsWith("/submit") ||
            url.pathname.startsWith("/admin") ||
            url.pathname.startsWith("/library"))
    ) {
        url.pathname = "/"; // Send them home (or eventually to a login page)
        return NextResponse.redirect(url);
    }

    return supabaseResponse;
}
