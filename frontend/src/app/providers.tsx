'use client';

import { ReactNode } from 'react';
import { AuthProvider } from '@/context/AuthContext';
import { SportsProvider } from '@/context/SportsContext';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <SportsProvider>
        {children}
      </SportsProvider>
    </AuthProvider>
  );
}
