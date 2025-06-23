"use client";

import { useState, useEffect } from "react";
import { Key, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAuth } from "@/hooks/useAuth";
import { apiClient } from "@/lib/api";
import { ProviderKey, ProviderInfo } from "@/types/api";

interface ApiKeysDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ApiKeysDialog({ open, onOpenChange }: ApiKeysDialogProps) {
  const { isAuthenticated } = useAuth();
  const [providerKeys, setProviderKeys] = useState<ProviderKey[]>([]);
  const [providers, setProviders] = useState<ProviderInfo[]>([]);
  const [isAddKeyDialogOpen, setIsAddKeyDialogOpen] = useState(false);
  const [newKeyProvider, setNewKeyProvider] = useState("");
  const [newKeyValue, setNewKeyValue] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isAuthenticated && open) {
      loadData();
    }
  }, [isAuthenticated, open]);

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
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Key className="h-5 w-5" />
              <span>API Keys</span>
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* API Keys Section */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">Manage API Keys</CardTitle>
                    <CardDescription>
                      Manage your provider API keys to enable chat functionality
                    </CardDescription>
                  </div>
                  <Button size="sm" onClick={() => setIsAddKeyDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Key
                  </Button>
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
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Key Dialog */}
      <Dialog open={isAddKeyDialogOpen} onOpenChange={setIsAddKeyDialogOpen}>
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
    </>
  );
} 