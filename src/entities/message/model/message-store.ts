import { create } from "zustand";

import type { Message } from "./types";

interface MessageStoreState {
  messages: Message[];
  addMessage: (message: Message) => void;
  resetMessages: () => void;
}

export const useMessageStore = create<MessageStoreState>((set) => ({
  messages: [],
  addMessage: (message) =>
    set((state) => ({ messages: [...state.messages, message] })),
  resetMessages: () => set({ messages: [] }),
}));
