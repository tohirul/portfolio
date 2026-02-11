import { useStore } from 'react-redux';
import type { AppStore } from '@/lib/redux/store';

export const useAppStore = () => useStore<AppStore>();
