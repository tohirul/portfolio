import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ProgressEvent } from '@/core/types';

interface AuditsState {
  progressEvents: ProgressEvent[];
  isAuditing: boolean;
}

const initialState: AuditsState = {
  progressEvents: [],
  isAuditing: false,
};

const auditsSlice = createSlice({
  name: 'audits',
  initialState,
  reducers: {
    startAudit: (state) => {
      state.isAuditing = true;
      state.progressEvents = []; // Clear previous events
    },
    addProgressEvent: (state, action: PayloadAction<ProgressEvent>) => {
      state.progressEvents.push(action.payload);
    },
    endAudit: (state) => {
      state.isAuditing = false;
    },
  },
});

export const { startAudit, addProgressEvent, endAudit } = auditsSlice.actions;

export default auditsSlice.reducer;
