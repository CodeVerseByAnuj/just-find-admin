import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

interface CompilerState {
  outputHistory: string[]
  stdinHistory: string[]
  addOutput: (output: string) => void
  addStdinInput: (input: string) => void
  clearHistory: () => void
  getFormattedOutput: () => string
  getFormattedStdin: () => string
}

export const useCompilerStore = create<CompilerState>()(
  persist(
    (set, get) => ({
      outputHistory: [],
      stdinHistory: [],
      
      addOutput: (output: string) => 
        set((state) => ({
          outputHistory: [...state.outputHistory, output]
        })),
      
      addStdinInput: (input: string) =>
        set((state) => ({
          stdinHistory: [...state.stdinHistory, input]
        })),
      
      clearHistory: () =>
        set(() => ({
          outputHistory: [],
          stdinHistory: []
        })),
      
      getFormattedOutput: () => {
        const state = get()
        return state.outputHistory.join('\n')
      },
      
      getFormattedStdin: () => {
        const state = get()
        return state.stdinHistory.join('\n')
      }
    }),
    {
      name: 'compiler-store', // unique name for localStorage
      storage: createJSONStorage(() => localStorage), // persist to localStorage
      partialize: (state) => ({
        outputHistory: state.outputHistory,
        stdinHistory: state.stdinHistory
      })
    }
  )
)