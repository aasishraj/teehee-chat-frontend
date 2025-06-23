"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Send, Bot, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiClient } from "@/lib/api";
import { ModelInfo, ProviderInfo } from "@/types/api";

export function NewChatInterface() {
  const router = useRouter();
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [models, setModels] = useState<ModelInfo[]>([]);
  const [providers, setProviders] = useState<ProviderInfo[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>("");
  const [selectedProvider, setSelectedProvider] = useState<string>("");

  useEffect(() => {
    loadModelsAndProviders();
  }, []);

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

  const createChatAndSendMessage = async () => {
    if (!input.trim() || !selectedModel || !selectedProvider) return;

    const userMessage = input.trim();
    setIsLoading(true);

    try {
      // Create a new chat session
      const newSession = await apiClient.createChatSession({
        name: null, // Let the system generate a name based on the first message
      });

      // Add user message to the new chat
      const newUserMessage = await apiClient.createMessage(newSession.id, {
        role: "user",
        content: userMessage,
      });

      // Create assistant message and start streaming
      const assistantMessage = await apiClient.createMessage(newSession.id, {
        role: "assistant",
        content: "",
        parent_message_id: newUserMessage.id,
      });

      // Start streaming response
      await apiClient.continueMessageStream(assistantMessage.id, {
        model: selectedModel,
        provider: selectedProvider,
        parent_message_id: newUserMessage.id,
      });

      // Navigate to the new chat
      router.push(`/${newSession.id}`);

    } catch (error) {
      console.error("Error creating chat and sending message:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      createChatAndSendMessage();
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8">
      <div className="w-full max-w-2xl space-y-8">
        {/* Header */}
        <div className="text-center">
          <Bot className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <h1 className="text-3xl font-bold mb-2">Welcome to Teehee Chat</h1>
          <p className="text-muted-foreground text-lg">
            Start a conversation with AI. Type your message below to begin.
          </p>
        </div>

        {/* Model and Provider Selection */}
        <div className="flex items-center justify-center space-x-4">
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium">Provider:</label>
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
          </div>
          
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium">Model:</label>
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

        {/* Input Section */}
        <div className="space-y-4">
          <div className="flex space-x-2">
            <Textarea
              placeholder="Ask me anything..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1 min-h-[100px] text-base"
              disabled={isLoading}
            />
            <Button
              onClick={createChatAndSendMessage}
              disabled={!input.trim() || isLoading || !selectedModel}
              size="icon"
              className="h-[100px] w-[60px]"
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Send className="h-5 w-5" />
              )}
            </Button>
          </div>
          
          {!selectedModel && (
            <p className="text-sm text-muted-foreground text-center">
              Please select a model to start chatting
            </p>
          )}
          
          <p className="text-xs text-muted-foreground text-center">
            Press Enter to send your message and start a new chat
          </p>
        </div>

        {/* Quick Start Examples */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-center">Try asking:</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              "Explain quantum computing in simple terms",
              "Write a poem about artificial intelligence",
              "Help me plan a weekend trip to Paris",
              "What are the benefits of renewable energy?"
            ].map((example, index) => (
              <Button
                key={index}
                variant="outline"
                className="text-left justify-start h-auto p-3 whitespace-normal"
                onClick={() => setInput(example)}
                disabled={isLoading}
              >
                {example}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 