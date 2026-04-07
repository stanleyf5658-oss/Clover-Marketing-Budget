import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isPublicRoute = createRouteMatcher([
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/unauthorized",
]);
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
    // If the user has an org but is not an admin, show the unauthorized page
    if (orgRole && orgRole !== "org:admin") {
      return NextResponse.redirect(new URL("/unauthorized", request.url));
    }
    // If user has no org membership yet, allow through — page shows lock screen
  }
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
