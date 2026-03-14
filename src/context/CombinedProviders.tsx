import React from 'react';
import { PokeProvider } from './PokeContext';
import { WalletProvider } from './WalletContext';
import { NotificationsProvider } from './NotificationsContext';

interface CombinedProvidersProps {
  children: React.ReactNode;
}

export const CombinedProviders: React.FC<CombinedProvidersProps> = ({ children }) => {
  return (
    <PokeProvider>
      <WalletProvider>
        <NotificationsProvider>
          {children}
        </NotificationsProvider>
      </WalletProvider>
    </PokeProvider>
  );
};
