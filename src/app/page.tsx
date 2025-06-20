import GoogleSignInButton from "@/components/auth/GoogleSignInButton";

export default function Home() {
  return (
    <div className="flex items-center justify-center min-h-screen p-8 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-8 items-center text-center max-w-md">
        <div>
          <h1 className="text-4xl font-bold mb-4">Welcome to Teehee Chat</h1>
          <p className="text-xl text-gray-600 mb-8">Sign in with your Google account to get started</p>
        </div>
        
        <GoogleSignInButton />
      </main>
    </div>
  );
}
