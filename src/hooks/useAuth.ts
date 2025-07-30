"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api";
import { User } from "@/types/api";

export function useAuth() {
  const { data: session, status } = useSession();
  const [backendUser, setBackendUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const authenticateWithBackend = async () => {
      if (session?.idToken) {
        try {
          setIsLoading(true);
          setError(null);
          
          // Authenticate with backend and get token
          const tokenResponse = await apiClient.googleSSO({
            token: session.idToken,
          });
          
          // Set token in API client
          apiClient.setToken(tokenResponse.access_token);
          
          // Get user session
          const user = await apiClient.getSession();
          setBackendUser(user);
          
        } catch (error) {
          console.error("Error authenticating with backend:", error);
          setError(error instanceof Error ? error.message : "Authentication failed");
        } finally {
          setIsLoading(false);
        }
      } else if (status !== "loading") {
        setIsLoading(false);
      }
    };

    authenticateWithBackend();
  }, [session?.idToken, status]);

  const isAuthenticated = !!session && !!backendUser;

  return {
    session,
    backendUser,
    isAuthenticated,
    isLoading: status === "loading" || isLoading,
    error,
  };
} 