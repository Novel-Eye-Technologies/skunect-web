'use client';

import { useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useAppleOAuth } from '@/lib/hooks/use-auth';

const APPLE_CLIENT_ID = process.env.NEXT_PUBLIC_APPLE_CLIENT_ID;
const APPLE_REDIRECT_URI = process.env.NEXT_PUBLIC_APPLE_REDIRECT_URI;

declare global {
  interface Window {
    AppleID?: {
      auth: {
        init: (config: Record<string, unknown>) => void;
        signIn: () => Promise<{
          authorization: {
            id_token: string;
            code: string;
          };
          user?: {
            name?: {
              firstName?: string;
              lastName?: string;
            };
          };
        }>;
      };
    };
  }
}

export function AppleOAuthButton() {
  const appleOAuth = useAppleOAuth();
  const initializedRef = useRef(false);

  useEffect(() => {
    if (!APPLE_CLIENT_ID || APPLE_CLIENT_ID === 'placeholder') return;
    if (initializedRef.current) return;
    initializedRef.current = true;

    const script = document.createElement('script');
    script.src =
      'https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/en_US/appleid.auth.js';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      window.AppleID?.auth.init({
        clientId: APPLE_CLIENT_ID,
        scope: 'name email',
        redirectURI: APPLE_REDIRECT_URI || window.location.origin,
        usePopup: true,
      });
    };
    document.head.appendChild(script);
  }, []);

  const handleSignIn = useCallback(async () => {
    if (!APPLE_CLIENT_ID || APPLE_CLIENT_ID === 'placeholder') {
      toast.info(
        'Apple Sign In is not configured yet. Please use email or phone login.',
      );
      return;
    }

    try {
      const response = await window.AppleID!.auth.signIn();
      appleOAuth.mutate(
        {
          identityToken: response.authorization.id_token,
          authorizationCode: response.authorization.code,
          fullName: {
            firstName: response.user?.name?.firstName,
            lastName: response.user?.name?.lastName,
          },
        },
        {
          onError: () => {
            toast.error('Apple sign-in failed. Please try again.');
          },
        },
      );
    } catch {
      // User cancelled or Apple SDK error
      toast.error('Apple sign-in was cancelled or failed.');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Button
      type="button"
      variant="outline"
      className="w-full h-11 gap-3 text-sm font-medium bg-black text-white hover:bg-black/90 hover:text-white border-black"
      onClick={handleSignIn}
      disabled={appleOAuth.isPending}
    >
      <AppleIcon />
      Sign in with Apple
    </Button>
  );
}

function AppleIcon() {
  return (
    <svg
      className="w-5 h-5"
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
    </svg>
  );
}
