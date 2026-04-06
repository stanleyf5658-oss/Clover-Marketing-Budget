import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 bg-[#f8faf5]">
      <SignIn />
    </main>
  );
}
