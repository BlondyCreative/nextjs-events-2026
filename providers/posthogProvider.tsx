'use client';

import { useEffect, useState } from 'react';
import type { PostHog } from 'posthog-js';
import { PostHogProvider } from 'posthog-js/react';

export function PHProvider({ children }: { children: React.ReactNode }) {
  const [client, setClient] = useState<PostHog | null>(null);

  useEffect(() => {
    let mounted = true;
    import('posthog-js').then((ph) => {
      if (!mounted) return;
      ph.default.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
        api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
        capture_pageview: false,
      });
      setClient(ph.default);
    });
    return () => {
      mounted = false;
    };
  }, []);

  if (!client) return <>{children}</>;
  return <PostHogProvider client={client}>{children}</PostHogProvider>;
}

