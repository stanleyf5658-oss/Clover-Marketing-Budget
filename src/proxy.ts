import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isPublicRoute = createRouteMatcher(["/sign-in(.*)", "/sign-up(.*)"]);
const isAdminRoute = createRouteMatcher(["/admin(.*)"]);

export default clerkMiddleware(async (auth, request) => {
  // All non-public routes require authentication
  if (!isPublicRoute(request)) {
    await auth.protect();
  }

  // Admin routes additionally require org:admin role
  if (isAdminRoute(request)) {
    const { userId, orgRole } = await auth();
    if (!userId) {
      return NextResponse.redirect(new URL("/sign-in", request.url));
    }
    // If the user has an org but is not an admin, redirect to planner
    if (orgRole && orgRole !== "org:admin") {
      return NextResponse.redirect(new URL("/planner", request.url));
    }
    // If user has no org membership yet, allow access (setup phase)
    // The page itself shows a lock screen for non-admins as a second layer
  }
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
