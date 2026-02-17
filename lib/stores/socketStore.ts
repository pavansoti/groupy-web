import { create } from "zustand"

interface SocketState {
    isConnected: boolean
    setConnected: (value: boolean) => void
}

export const useSocketStore = create<SocketState>((set) => ({
    isConnected: false,
    setConnected: (value) => set({ isConnected: value }),
}))