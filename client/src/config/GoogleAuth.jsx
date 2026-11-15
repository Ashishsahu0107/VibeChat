import { useEffect, useState } from "react";

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

let isGoogleInitialized = false;
let isScriptAppended = false;
let globalCredentialHandler = null;

// Custom hook for Google Authentication
export const useGoogleAuth = () => {
  const [isLoading, setIsLoading] = useState(!isGoogleInitialized);
  const [error, setError] = useState(null);
  const [isInitialized, setIsInitialized] = useState(isGoogleInitialized);

  useEffect(() => {
    // Check if Client ID is available
    if (!GOOGLE_CLIENT_ID) {
      setError("Google Client ID not configured");
      setIsLoading(false);
      return;
    }

    // If already initialized once across the app session, reuse it
    if (isGoogleInitialized && window.google?.accounts?.id) {
      setIsInitialized(true);
      setIsLoading(false);
      return;
    }

    const initializeGoogleAuth = () => {
      try {
        if (!isGoogleInitialized && window.google?.accounts?.id) {
          window.google.accounts.id.initialize({
            client_id: GOOGLE_CLIENT_ID,
            callback: (response) => {
              if (globalCredentialHandler) {
                globalCredentialHandler(response);
              }
            },
            auto_select: false,
            cancel_on_tap_outside: true,
          });

          isGoogleInitialized = true;
          console.log("Google Identity Services initialized successfully");
        }

        setIsInitialized(true);
        setIsLoading(false);
      } catch (error) {
        console.error("Google Identity Services initialization failed:", error);
        setError("Failed to initialize Google Auth");
        setIsLoading(false);
      }
    };

    const loadGoogleIdentityServices = () => {
      return new Promise((resolve, reject) => {
        if (typeof window === "undefined") {
          reject(new Error("Google Auth only works in the browser."));
          return;
        }

        // Check if Google Identity Services is already available
        if (window.google?.accounts?.id) {
          initializeGoogleAuth();
          resolve();
          return;
        }

        // If script is already in document, wait for it to load
        const existingScript = document.querySelector(
          'script[src="https://accounts.google.com/gsi/client"]'
        );
        if (existingScript || isScriptAppended) {
          const checkInterval = setInterval(() => {
            if (window.google?.accounts?.id) {
              clearInterval(checkInterval);
              initializeGoogleAuth();
              resolve();
            }
          }, 100);
          setTimeout(() => clearInterval(checkInterval), 10000);
          return;
        }

        // Load Google Identity Services script once
        isScriptAppended = true;
        const script = document.createElement("script");
        script.src = "https://accounts.google.com/gsi/client";
        script.async = true;
        script.defer = true;

        script.onload = () => {
          initializeGoogleAuth();
          resolve();
        };

        script.onerror = (error) => {
          isScriptAppended = false;
          console.error(
            "Failed to load Google Identity Services script:",
            error
          );
          setError("Failed to load Google Identity Services");
          setIsLoading(false);
          reject(error);
        };

        document.head.appendChild(script);
      });
    };

    loadGoogleIdentityServices().catch((error) => {
      console.error("Google Auth setup failed:", error);
      setError("Google Auth setup failed");
      setIsLoading(false);
    });
  }, []);

  const signInWithGoogle = (onSuccess, onFailure) => {
    if (!window.google?.accounts?.id || !isInitialized) {
      console.log("Google Identity Services not ready");
      setError("Google Auth not ready");
      onFailure?.({ message: "Google Auth not ready" });
      return;
    }

    try {
      // Set up the callback for this specific sign-in attempt
      const handleCredentialResponse = (response) => {
        try {
          // Decode the JWT token to get user info
          const payload = JSON.parse(atob(response.credential.split(".")[1]));

          const userData = {
            id: payload.sub,
            name: payload.name,
            email: payload.email,
            imageUrl: payload.picture,
            idToken: response.credential,
          };

          console.log("Google sign-in successful:", userData);
          onSuccess?.(userData);
        } catch (error) {
          console.error("Error processing Google credential:", error);
          setError("Failed to process Google credential");
          onFailure?.(error);
        }
      };

      // Set the global handler instead of re-initializing
      globalCredentialHandler = handleCredentialResponse;

      // Clear any previous errors
      setError(null);

      // Create a permanent hidden container for the Google button
      let tempDiv = document.getElementById("temp-google-button");
      if (!tempDiv) {
        tempDiv = document.createElement("div");
        tempDiv.style.position = "absolute";
        tempDiv.style.top = "-9999px";
        tempDiv.style.left = "-9999px";
        tempDiv.id = "temp-google-button";
        document.body.appendChild(tempDiv);
      } else {
        tempDiv.innerHTML = ""; // Clear previous button if any
      }

      // Render Google button in the temporary div
      window.google.accounts.id.renderButton(tempDiv, {
        theme: "outline",
        size: "large",
        width: 300,
        text: "continue_with",
      });

      // Find the actual Google button and click it
      setTimeout(() => {
        const googleButton = tempDiv.querySelector('div[role="button"]');
        if (googleButton) {
          googleButton.click();
        } else {
          setError("Could not trigger Google sign-in");
          onFailure?.({ message: "Could not trigger Google sign-in" });
        }
      }, 100);
    } catch (error) {
      console.error("Google sign-in error:", error);
      setError("Google sign-in failed");
      onFailure?.(error);
    }
  };

  return {
    isLoading,
    error,
    isInitialized,
    signInWithGoogle,
  };
};
