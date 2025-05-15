import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

let isInitialized = false;

export function middleware(request: NextRequest) {
  // Redirect root path to dashboard
  if (request.nextUrl.pathname === "/") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (!isInitialized) {
    console.log("🚀 Triggering cron initialization...");
    // Call the init API route
    fetch(`${request.nextUrl.origin}/api/cron/init`)
      .then(() => {
        isInitialized = true;
        console.log("✅ Cron initialization triggered");
      })
      .catch((error) => {
        console.error("❌ Failed to trigger cron init:", error);
      });

    fetch(`${request.nextUrl.origin}/api/cron/lead`)
      .then(() => {
        isInitialized = true;
        console.log("✅ Cron initialization triggered");
      })
      .catch((error) => {
        console.error("❌ Failed to trigger cron init:", error);
      });
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/",
};