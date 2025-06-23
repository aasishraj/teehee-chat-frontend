"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Key, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useAuth } from "@/hooks/useAuth";
import { apiClient } from "@/lib/api";
import { ProviderKey, ProviderInfo } from "@/types/api";

export default function SettingsPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [providerKeys, setProviderKeys] = useState<ProviderKey[]>([]);
  const [providers, setProviders] = useState<ProviderInfo[]>([]);
  const [isAddKeyDialogOpen, setIsAddKeyDialogOpen] = useState(false);
  const [newKeyProvider, setNewKeyProvider] = useState("");
  const [newKeyValue, setNewKeyValue] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    }
  }, [isAuthenticated]);

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!isAuthenticated) {
    router.push("/");
    return null;
  }

  const loadData = async () => {
    try {
      const [keysData, providersData] = await Promise.all([
        apiClient.listProviderKeys(),
        apiClient.listProviders(),
      ]);
      setProviderKeys(keysData);
      setProviders(providersData);
    } catch (error) {
      console.error("Error loading data:", error);
    }
  };

  const addProviderKey = async () => {
    if (!newKeyProvider || !newKeyValue.trim()) return;

    setIsSubmitting(true);
    try {
      const newKey = await apiClient.addProviderKey({
        provider_name: newKeyProvider,
        api_key: newKeyValue.trim(),
      });
      setProviderKeys([...providerKeys, newKey]);
      setNewKeyProvider("");
      setNewKeyValue("");
      setIsAddKeyDialogOpen(false);
    } catch (error) {
      console.error("Error adding provider key:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteProviderKey = async (keyId: string) => {
    try {
      await apiClient.deleteProviderKey(keyId);
      setProviderKeys(providerKeys.filter(key => key.id !== keyId));
    } catch (error) {
      console.error("Error deleting provider key:", error);
    }
  };

  const getAvailableProviders = () => {
    const existingProviders = new Set(providerKeys.map(key => key.provider_name));
    return providers.filter(provider => !existingProviders.has(provider.name));
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center space-x-4 mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Settings</h1>
            <p className="text-muted-foreground">
              Manage your API keys and preferences
            </p>
          </div>
        </div>

        <div className="space-y-6">
          {/* API Keys Section */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center space-x-2">
                    <Key className="h-5 w-5" />
                    <span>API Keys</span>
                  </CardTitle>
                  <CardDescription>
                    Manage your provider API keys to enable chat functionality
                  </CardDescription>
                </div>
                <Dialog open={isAddKeyDialogOpen} onOpenChange={setIsAddKeyDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Key
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add API Key</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium">Provider</label>
                        <Select value={newKeyProvider} onValueChange={setNewKeyProvider}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a provider" />
                          </SelectTrigger>
                          <SelectContent>
                            {getAvailableProviders().map((provider) => (
                              <SelectItem key={provider.name} value={provider.name}>
                                <div>
                                  <div className="font-medium">{provider.name}</div>
                                  <div className="text-xs text-muted-foreground">
                                    {provider.description}
                                  </div>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="text-sm font-medium">API Key</label>
                        <Input
                          type="password"
                          placeholder="Enter your API key"
                          value={newKeyValue}
                          onChange={(e) => setNewKeyValue(e.target.value)}
                        />
                      </div>
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="outline"
                          onClick={() => setIsAddKeyDialogOpen(false)}
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={addProviderKey}
                          disabled={!newKeyProvider || !newKeyValue.trim() || isSubmitting}
                        >
                          {isSubmitting ? "Adding..." : "Add Key"}
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {providerKeys.length === 0 ? (
                <div className="text-center py-8">
                  <Key className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-muted-foreground">No API keys configured</p>
                  <p className="text-sm text-muted-foreground">
                    Add your first API key to start using the chat
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {providerKeys.map((key) => {
                    const provider = providers.find(p => p.name === key.provider_name);
                    return (
                      <Card key={key.id} className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <Key className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <div className="font-medium">{key.provider_name}</div>
                              <div className="text-sm text-muted-foreground">
                                Added {new Date(key.created_at).toLocaleDateString()}
                              </div>
                              {provider && (
                                <div className="text-xs text-muted-foreground mt-1">
                                  Models: {provider.models.join(", ")}
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteProviderKey(key.id)}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Available Providers Section */}
          <Card>
            <CardHeader>
              <CardTitle>Available Providers</CardTitle>
              <CardDescription>
                Supported AI providers and their models
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {providers.map((provider) => (
                  <Card key={provider.name} className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="font-medium">{provider.name}</div>
                        <div className="text-sm text-muted-foreground mt-1">
                          {provider.description}
                        </div>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {provider.models.map((model) => (
                            <span
                              key={model}
                              className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-muted text-muted-foreground"
                            >
                              {model}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="ml-4">
                        {providerKeys.some(key => key.provider_name === provider.name) ? (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                            Configured
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-800">
                            Not configured
                          </span>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 