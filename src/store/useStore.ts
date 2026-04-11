import { create } from "zustand";

interface AppState {
  // 1. GLOBAL LOADING STATE
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;

  // 2. LENIS SCROLL STATE
  scrollProgress: number;
  setScrollProgress: (progress: number) => void;

  // 3. ARCHIVE LAYOUT ENGINE STATE
  activeLayout: string;
  previousLayout: string;
  activeProject: number;
  galleryProgress: number; // Restored for HorizontalLensGallery
  setActiveLayout: (layout: string) => void;
  setActiveProject: (index: number) => void;
  setGalleryProgress: (progress: number) => void;

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

  activeLayout: "layout-1-gallery",
  previousLayout: "layout-1-gallery",
  activeProject: 0,
  galleryProgress: 0, // Restored
  setActiveLayout: (layout) =>
    set((state) => ({
      previousLayout: state.activeLayout,
      activeLayout: layout,
    })),
  setActiveProject: (index) => set({ activeProject: index }),
  setGalleryProgress: (progress) => set({ galleryProgress: progress }),

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
