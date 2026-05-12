import { create } from "zustand";

export type AppView =
  | 'home'
  | 'events'
  | 'about'
  | 'contact'
  | 'auth'
  | 'dashboard'
  | 'dashboard-events'
  | 'dashboard-event-detail';

interface NavigationState {
  currentView: AppView;
  viewParams: Record<string, string>;
  history: AppView[];
  navigate: (view: AppView, params?: Record<string, string>) => void;
  goBack: () => void;
}

export const useNavigation = create<NavigationState>((set) => ({
  currentView: "home",
  viewParams: {},
  history: [],
  navigate: (view, params = {}) =>
    set((state) => ({
      currentView: view,
      viewParams: params,
      history: [...state.history, state.currentView],
    })),
  goBack: () =>
    set((state) => {
      const newHistory = [...state.history];
      const prevView = newHistory.pop() || "home";
      return {
        currentView: prevView,
        history: newHistory,
        viewParams: {},
      };
    }),
}));
