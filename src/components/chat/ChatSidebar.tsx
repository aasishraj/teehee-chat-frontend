"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { 
  Plus, 
  MessageSquare, 
  Settings, 
  LogOut, 
  Trash2,
  MoreVertical,
  User
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useAuth } from "@/hooks/useAuth";
import { apiClient } from "@/lib/api";
import { ChatSession } from "@/types/api";

export function ChatSidebar() {
  const { backendUser } = useAuth();
  const router = useRouter();
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newChatName, setNewChatName] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  useEffect(() => {
    loadChatSessions();
  }, []);

  const loadChatSessions = async () => {
    try {
      setIsLoading(true);
      const sessions = await apiClient.listChatSessions();
      setChatSessions(sessions);
    } catch (error) {
      console.error("Error loading chat sessions:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const createNewChat = async () => {
    try {
      const newSession = await apiClient.createChatSession({
        name: newChatName.trim() || null,
      });
      setChatSessions([newSession, ...chatSessions]);
      setNewChatName("");
      setIsCreateDialogOpen(false);
      router.push(`/${newSession.id}`);
    } catch (error) {
      console.error("Error creating chat session:", error);
    }
  };

  const deleteChat = async (chatId: string) => {
    try {
      await apiClient.deleteChatSession(chatId);
      setChatSessions(chatSessions.filter(chat => chat.id !== chatId));
    } catch (error) {
      console.error("Error deleting chat session:", error);
    }
  };

  const handleSignOut = async () => {
    try {
      await apiClient.logout();
    } catch (error) {
      console.error("Error logging out from backend:", error);
    } finally {
      signOut({ callbackUrl: "/" });
    }
  };

  return (
    <div className="w-80 border-r bg-muted/30 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Teehee Chat</h2>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="h-8 w-8 p-0">
                <Plus className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Chat</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Input
                  placeholder="Chat name (optional)"
                  value={newChatName}
                  onChange={(e) => setNewChatName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && createNewChat()}
                />
                <div className="flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => setIsCreateDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button onClick={createNewChat}>Create</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Chat Sessions */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-2">
          {isLoading ? (
            [...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-muted rounded animate-pulse" />
            ))
          ) : chatSessions.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No chats yet</p>
              <p className="text-sm">Create your first chat to get started</p>
            </div>
          ) : (
            chatSessions.map((session) => (
              <Card
                key={session.id}
                className="p-3 cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => router.push(`/${session.id}`)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 min-w-0">
                    <MessageSquare className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <span className="text-sm truncate">
                      {session.name || "Untitled Chat"}
                    </span>
                  </div>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreVertical className="h-3 w-3" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-40 p-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start text-destructive hover:text-destructive"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteChat(session.id);
                        }}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </Button>
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {new Date(session.created_at).toLocaleDateString()}
                </div>
              </Card>
            ))
          )}
        </div>
      </ScrollArea>

      <Separator />

      {/* User Section */}
      <div className="p-4 space-y-2">
        <Button
          variant="ghost"
          className="w-full justify-start"
          onClick={() => router.push("/settings")}
        >
          <Settings className="h-4 w-4 mr-2" />
          Settings
        </Button>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 min-w-0">
            <User className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <span className="text-sm truncate">
              {backendUser?.email}
            </span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={handleSignOut}
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
} 