import { createSlice, configureStore, PayloadAction } from '@reduxjs/toolkit'

type avaliableMessages = "" | "reloadUsers" | "openModalSucess" | "openModalSucessMiddle"

interface MessagerState {
  signal: avaliableMessages;
  data: any;
}
const initialState: MessagerState = {
  signal: "",
  data: {}
}
export const messagerSlice = createSlice({
  name: 'messager',
  initialState,
  reducers: {

    resetSignal: (state) => {
      state.data = {};
      state.signal = "";
    },
    sendSignal: (state, action: PayloadAction<MessagerState>) => {
      state.data = action.payload.data;
      state.signal = action.payload.signal;
    },
  }
})

export const { sendSignal, resetSignal } = messagerSlice.actions

export const storeSignal = configureStore({
  reducer: messagerSlice.reducer
})

export type RootState = ReturnType<typeof storeSignal.getState>;