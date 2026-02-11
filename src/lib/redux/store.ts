import { configureStore } from '@reduxjs/toolkit';
import { apiSlice } from './apis/baseApi';
import { auditsApi } from './apis/auditsApi';
import auditsReducer from './features/auditsSlice';

export const makeStore = () => {
  return configureStore({
    reducer: {
      [apiSlice.reducerPath]: apiSlice.reducer,
      [auditsApi.reducerPath]: auditsApi.reducer,
      audits: auditsReducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(apiSlice.middleware, auditsApi.middleware),
  });
};

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];


