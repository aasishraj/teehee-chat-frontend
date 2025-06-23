"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import GoogleSignInButton from "@/components/auth/GoogleSignInButton";
import { useAuth } from "@/hooks/useAuth";
import { ChatSidebar } from "@/components/chat/ChatSidebar";
import { Bot } from "lucide-react";

export default function Home() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (isAuthenticated) {
    return (
      <div className="flex h-screen bg-background">
        <ChatSidebar />
        <main className="flex-1 flex flex-col items-center justify-center">
          <div className="text-center">
            <Bot className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h1 className="text-2xl font-bold mb-4">Welcome to Teehee Chat</h1>
            <p className="text-muted-foreground mb-8">Select a chat from the sidebar or create a new one to get started.</p>
          </div>
        </main>
      </div>
    );
  }

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
