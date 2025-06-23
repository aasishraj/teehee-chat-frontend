"use client";

import { Suspense, use } from "react";
import { useAuth } from "@/hooks/useAuth";
import { ChatSidebar } from "@/components/chat/ChatSidebar";
import { ChatInterface } from "@/components/chat/ChatInterface";
import { Skeleton } from "@/components/ui/skeleton";

interface ChatPageProps {
  params: Promise<{
    chatId: string;
  }>;
}

function ChatPageContent({ chatId }: { chatId: string }) {
  return (
    <div className="flex h-screen bg-background">
      <ChatSidebar />
      <main className="flex-1 flex flex-col">
        <ChatInterface chatId={chatId} />
      </main>
    </div>
  );
}

export default function ChatPage({ params }: ChatPageProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const { chatId } = use(params);

  if (isLoading) {
    return (
      <div className="flex h-screen">
        <div className="w-80 border-r p-4">
          <Skeleton className="h-8 w-32 mb-4" />
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-12 w-full mb-2" />
          ))}
        </div>
        <div className="flex-1 p-4">
          <Skeleton className="h-full w-full" />
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    window.location.href = "/";
    return null;
  }

  return (
    <Suspense fallback={
      <div className="flex h-screen">
        <div className="w-80 border-r p-4">
          <Skeleton className="h-8 w-32 mb-4" />
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-12 w-full mb-2" />
          ))}
        </div>
        <div className="flex-1 p-4">
          <Skeleton className="h-full w-full" />
        </div>
      </div>
    }>
      <ChatPageContent chatId={chatId} />
    </Suspense>
  );
} 