# Redux Toolkit and RTK Query Setup

This document provides an overview of the Redux Toolkit and RTK Query setup in this project.

## Directory Structure

The `src/lib/redux` directory is structured as follows:

- `apis/`: Contains the base API slice and any other API slices that extend it.
- `features/`: Contains all the feature slices.
- `store.ts`: The Redux store configuration.
- `StoreProvider.tsx`: The provider that wraps the application and provides the Redux store.

The `src/lib/hooks` directory contains the typed hooks for `useDispatch`, `useSelector`, and `useStore`. You can import all the hooks from `src/lib/hooks`.

## How to Use

### Creating a new feature slice

1.  Create a new file in the `features/` directory (e.g., `src/lib/redux/features/myFeature/myFeatureSlice.ts`).
2.  Define the slice using `createSlice` from `@reduxjs/toolkit`.
3.  Add the reducer to the store in `src/lib/redux/store.ts`.

### Creating a new API slice

1.  Create a new file in the `apis/` directory (e.g., `src/lib/redux/apis/myApi.ts`).
2.  Extend the `baseApi` slice from `src/lib/redux/apis/baseApi.ts`.
3.  Add the endpoints to the new API slice.

### Using the store in a component

1.  Import the typed hooks from `src/lib/hooks`.
2.  Use `useAppSelector` to select data from the store.
3.  Use `useAppDispatch` to dispatch actions.


