import { create } from "zustand";

interface AppState {
  // --- 1. GLOBAL LOADING STATE (For Preloader) ---
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;

  // --- 2. LENIS SCROLL STATE (For DOM Parallax) ---
  scrollProgress: number;
  setScrollProgress: (progress: number) => void;

  // --- 3. LAYOUT ENGINE STATE (For Hypnotic Gallery) ---
  activeLayout: string;
  previousLayout: string;
  activeProject: number;
  setActiveLayout: (layout: string) => void;
  setActiveProject: (index: number) => void;

  // --- 4. BROWSER PIPELINE STATE (The Air Traffic Controller) ---
  isScrollLocked: boolean;
  setScrollLocked: (locked: boolean) => void;
}

export const useStore = create<AppState>((set) => ({
  // 1. Loading
  isLoading: true,
  setIsLoading: (loading) => set({ isLoading: loading }),

  // 2. Scroll Progress
  scrollProgress: 0,
  setScrollProgress: (progress) => set({ scrollProgress: progress }),

  // 3. Layout Engine
  activeLayout: "layout-1-gallery",
  previousLayout: "layout-1-gallery",
  activeProject: 0,
  setActiveLayout: (layout) =>
    set((state) => ({
      previousLayout: state.activeLayout,
      activeLayout: layout,
    })),
  setActiveProject: (index) => set({ activeProject: index }),

  // 4. Scroll Lock
  isScrollLocked: false,
  setScrollLocked: (locked) => set({ isScrollLocked: locked }),
}));
