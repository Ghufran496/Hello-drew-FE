'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient()); // Ensure client persists between renders

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
