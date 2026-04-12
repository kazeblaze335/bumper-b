import { create } from "zustand";

interface AppState {
  // 1. GLOBAL LOADING STATE
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;

  // 2. LENIS SCROLL STATE
  scrollProgress: number;
  setScrollProgress: (progress: number) => void;

  // 3. GLOBAL PROJECT TRACKING
  activeProject: number;
  setActiveProject: (index: number) => void;

  // 4. HOMEPAGE HORIZONTAL PARALLAX STATE
  horizontalGlProgress: number;
  horizontalGlY: number;
  isHorizontalGalleryActive: boolean;
  setHorizontalGlProgress: (progress: number) => void;
  setHorizontalGlY: (y: number) => void;
  setHorizontalGalleryActive: (active: boolean) => void;

  // 5. BROWSER PIPELINE STATE
  isScrollLocked: boolean;
  setScrollLocked: (locked: boolean) => void;
}

export const useStore = create<AppState>((set) => ({
  isLoading: true,
  setIsLoading: (loading) => set({ isLoading: loading }),

  scrollProgress: 0,
  setScrollProgress: (progress) => set({ scrollProgress: progress }),

  activeProject: 0,
  setActiveProject: (index) => set({ activeProject: index }),

  horizontalGlProgress: 0,
  horizontalGlY: 0,
  isHorizontalGalleryActive: false,
  setHorizontalGlProgress: (progress) =>
    set({ horizontalGlProgress: progress }),
  setHorizontalGlY: (y) => set({ horizontalGlY: y }),
  setHorizontalGalleryActive: (active) =>
    set({ isHorizontalGalleryActive: active }),

  isScrollLocked: false,
  setScrollLocked: (locked) => set({ isScrollLocked: locked }),
}));
