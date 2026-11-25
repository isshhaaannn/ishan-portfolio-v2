import { create } from 'zustand';
import { Project } from '@/components/3d/HelixCanvas';

export type ViewMode = 'spiral' | 'list';

interface UIState {
  viewMode: ViewMode;
  isMenuOpen: boolean;
  activeProjectId: string | null;
  hoveredProject: Project | null;
  isAudioPlaying: boolean;
  /** Buyer category the helix is filtered to; null shows everything. */
  filter: string | null;
  /** Brief builder (pre-booking) panel. */
  isBriefOpen: boolean;
  /** Wallpaper freebie, unlocked by typing the secret word. */
  isFreebieOpen: boolean;
  /** Project lifted out of the helix into the flat inspect view. */
  inspectId: string | null;
  /** Pointer is over the helix stage (drives the cursor label). */
  isOverStage: boolean;
  setViewMode: (mode: ViewMode) => void;
  toggleMenu: () => void;
  closeMenu: () => void;
  setActiveProject: (id: string | null) => void;
  setHoveredProject: (project: Project | null) => void;
  toggleAudio: () => void;
  setAudioPlaying: (playing: boolean) => void;
  setFilter: (filter: string | null) => void;
  openBrief: () => void;
  closeBrief: () => void;
  setFreebieOpen: (open: boolean) => void;
  setOverStage: (over: boolean) => void;
  setInspect: (id: string | null) => void;
}

export const useUIStore = create<UIState>((set) => ({
  viewMode: 'spiral',
  isMenuOpen: false,
  activeProjectId: null,
  hoveredProject: null,
  isAudioPlaying: true,
  filter: null,
  isBriefOpen: false,
  isFreebieOpen: false,
  isOverStage: false,
  inspectId: null,
  setViewMode: (mode) => set({ viewMode: mode }),
  toggleMenu: () => set((state) => ({ isMenuOpen: !state.isMenuOpen })),
  closeMenu: () => set({ isMenuOpen: false }),
  setActiveProject: (id) => set({ activeProjectId: id }),
  setHoveredProject: (project) => set({ hoveredProject: project }),
  toggleAudio: () => set((state) => {
    const next = !state.isAudioPlaying;
    try { localStorage.setItem('sound', next ? 'on' : 'off'); } catch {}
    return { isAudioPlaying: next };
  }),
  setAudioPlaying: (playing) => set({ isAudioPlaying: playing }),
  setFilter: (filter) => set({ filter }),
  openBrief: () => set({ isBriefOpen: true, isMenuOpen: false }),
  closeBrief: () => set({ isBriefOpen: false }),
  setFreebieOpen: (open) => set({ isFreebieOpen: open }),
  setOverStage: (over) => set({ isOverStage: over }),
  setInspect: (id) => set({ inspectId: id }),
}));
