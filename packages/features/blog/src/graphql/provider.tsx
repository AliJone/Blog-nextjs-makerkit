'use client';

import { ApolloProvider } from '@apollo/client';
import { ReactNode } from 'react';
import { getApolloClientInstance } from './client';

export function BlogApolloProvider({ children }: { children: ReactNode }) {
  const client = getApolloClientInstance();
  
  return (
    <ApolloProvider client={client}>
      {children}
    </ApolloProvider>
  );
}