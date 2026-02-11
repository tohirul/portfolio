'use client';
import { type ReactNode, useState } from 'react';
import { Provider } from 'react-redux';

import { makeStore } from '@/lib/redux/store';

interface StoreProviderProps {
  readonly children: ReactNode;
}

export const StoreProvider = ({ children }: StoreProviderProps) => {
  const [store] = useState(() => makeStore());

  return <Provider store={store}>{children}</Provider>;
};
