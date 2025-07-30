"use client";

import { useState, useEffect, useRef } from "react";
import { Send, Bot, User, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiClient } from "@/lib/api";
import { Message, ModelInfo, ProviderInfo } from "@/types/api";

interface ChatInterfaceProps {
  chatId: string | null;
}

export function ChatInterface({ chatId }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [models, setModels] = useState<ModelInfo[]>([]);
  const [providers, setProviders] = useState<ProviderInfo[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>("");
  const [selectedProvider, setSelectedProvider] = useState<string>("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadModelsAndProviders();
  }, []);

  useEffect(() => {
    if (chatId) {
      loadChatMessages();
    } else {
      setMessages([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chatId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadModelsAndProviders = async () => {
    try {
      const [modelsData, providersData] = await Promise.all([
        apiClient.listModels(),
        apiClient.listProviders(),
      ]);
      setModels(modelsData);
      setProviders(providersData);
      
      // Set default selections
      if (modelsData.length > 0) {
        setSelectedModel(modelsData[0].name);
        setSelectedProvider(modelsData[0].provider);
      }
    } catch (error) {
      console.error("Error loading models and providers:", error);
    }
  };

  const loadChatMessages = async () => {
    if (!chatId) return;
    
    try {
      const chatSession = await apiClient.getChatSession(chatId);
      setMessages(chatSession.messages || []);
    } catch (error) {
      console.error("Error loading chat messages:", error);
    }
  };

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || !chatId || !selectedModel || !selectedProvider) return;

    const userMessage = input.trim();
    setInput("");
    setIsLoading(true);

    try {
      // Add user message
      const newUserMessage = await apiClient.createMessage(chatId, {
        role: "user",
        content: userMessage,
      });
      
      setMessages(prev => [...prev, newUserMessage]);

      // Create assistant message and start streaming
      const assistantMessage = await apiClient.createMessage(chatId, {
        role: "assistant",
        content: "",
        parent_message_id: newUserMessage.id,
      });

      setMessages(prev => [...prev, assistantMessage]);

      // Start streaming response
      await apiClient.continueMessageStream(assistantMessage.id, {
        model: selectedModel,
        provider: selectedProvider,
        parent_message_id: newUserMessage.id,
      });

      // In a real implementation, you'd handle the streaming response here
      // For now, we'll just reload the messages
      setTimeout(() => {
        loadChatMessages();
      }, 1000);

    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!chatId) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <Bot className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">Welcome to Teehee Chat</h3>
          <p className="text-muted-foreground">
            Select a chat from the sidebar or create a new one to get started.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      {/* Header */}
      <div className="border-b p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h3 className="font-semibold">Chat</h3>
            <div className="flex items-center space-x-2">
              <Select value={selectedProvider} onValueChange={setSelectedProvider}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Provider" />
                </SelectTrigger>
                <SelectContent>
                  {providers.map((provider) => (
                    <SelectItem key={provider.name} value={provider.name}>
                      {provider.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedModel} onValueChange={setSelectedModel}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Model" />
                </SelectTrigger>
                <SelectContent>
                  {models
                    .filter(model => model.provider === selectedProvider)
                    .map((model) => (
                      <SelectItem key={model.name} value={model.name}>
                        {model.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        <div className="space-y-4">
          {messages.length === 0 ? (
            <div className="text-center py-8">
              <Bot className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-muted-foreground">No messages yet. Start the conversation!</p>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <Card className={`max-w-[70%] p-4 ${
                  message.role === "user" 
                    ? "bg-primary text-primary-foreground" 
                    : "bg-muted"
                }`}>
                  <div className="flex items-start space-x-2">
                    <div className="flex-shrink-0">
                      {message.role === "user" ? (
                        <User className="h-4 w-4 mt-0.5" />
                      ) : (
                        <Bot className="h-4 w-4 mt-0.5" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="text-sm whitespace-pre-wrap">
                        {typeof message.content === 'string' 
                          ? message.content 
                          : JSON.stringify(message.content)
                        }
                      </div>
                      <div className="text-xs opacity-70 mt-2">
                        {new Date(message.timestamp).toLocaleTimeString()}
                        {message.model && message.provider && (
                          <span className="ml-2">
                            • {message.provider}/{message.model}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            ))
          )}
          {isLoading && (
            <div className="flex justify-start">
              <Card className="max-w-[70%] p-4 bg-muted">
                <div className="flex items-center space-x-2">
                  <Bot className="h-4 w-4" />
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm">Thinking...</span>
                </div>
              </Card>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="border-t p-4">
        <div className="flex space-x-2">
          <Textarea
            placeholder="Type your message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 min-h-[60px] max-h-[120px]"
            disabled={isLoading}
          />
          <Button
            onClick={sendMessage}
            disabled={!input.trim() || isLoading || !selectedModel}
            size="icon"
            className="h-[60px] w-[60px]"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
        {!selectedModel && (
          <p className="text-sm text-muted-foreground mt-2">
            Please select a model to start chatting
          </p>
        )}
      </div>
    </div>
  );
} 