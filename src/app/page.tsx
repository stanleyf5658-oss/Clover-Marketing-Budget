import { redirect } from "next/navigation";

// The root route redirects to the planner.
// Middleware will intercept unauthenticated users and send them to /sign-in.
export default function RootPage() {
  redirect("/planner");
}
