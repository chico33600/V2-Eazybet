import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Match } from './mock-data';

interface UserState {
  coins: number;
  diamonds: number;
  addCoins: (amount: number) => void;
  addDiamonds: (amount: number) => void;
  deductCoins: (amount: number) => void;
  deductDiamonds: (amount: number) => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      coins: 1000.0,
      diamonds: 0,
      addCoins: (amount) => set((state) => ({ coins: state.coins + amount })),
      addDiamonds: (amount) => set((state) => ({ diamonds: state.diamonds + amount })),
      deductCoins: (amount) => set((state) => ({ coins: Math.max(0, state.coins - amount) })),
      deductDiamonds: (amount) => set((state) => ({ diamonds: Math.max(0, state.diamonds - amount) })),
    }),
    {
      name: 'easybet-user-storage',
    }
  )
);

export type BetType = 'home' | 'draw' | 'away';

export interface BetSelection {
  match: Match;
  betType: BetType;
  odds: number;
}

interface BetState {
  selections: BetSelection[];
  addSelection: (selection: BetSelection) => void;
  removeSelection: (matchId: string) => void;
  clearSelections: () => void;
  toggleSelection: (selection: BetSelection) => void;
}

export const useBetStore = create<BetState>((set, get) => ({
  selections: [],

  addSelection: (selection) => set((state) => {
    const existingIndex = state.selections.findIndex(s => s.match.id === selection.match.id);
    if (existingIndex !== -1) {
      const newSelections = [...state.selections];
      newSelections[existingIndex] = selection;
      return { selections: newSelections };
    }
    return { selections: [...state.selections, selection] };
  }),

  removeSelection: (matchId) => set((state) => ({
    selections: state.selections.filter(s => s.match.id !== matchId)
  })),

  clearSelections: () => set({ selections: [] }),

  toggleSelection: (selection) => {
    const state = get();
    const existing = state.selections.find(
      s => s.match.id === selection.match.id && s.betType === selection.betType
    );

    if (existing) {
      state.removeSelection(selection.match.id);
    } else {
      state.addSelection(selection);
    }
  },
}));

export type BetStatus = 'pending' | 'won' | 'lost';

export interface BetSelectionData {
  match: Match;
  betType: BetType;
  odds: number;
}

export interface UserBet {
  id: string;
  type: 'simple' | 'combo';
  selections: BetSelectionData[];
  totalOdds: number;
  amount: number;
  currency: 'coins' | 'diamonds';
  potentialWin: number;
  potentialDiamonds: number;
  status: BetStatus;
  placedAt: number;
}

interface UserBetsState {
  bets: UserBet[];
  addBet: (bet: UserBet) => void;
  updateBetStatus: (betId: string, status: BetStatus) => void;
  getBetsByStatus: (status: BetStatus) => UserBet[];
  getAllBets: () => UserBet[];
  clearAllBets: () => void;
}

export const useUserBetsStore = create<UserBetsState>()(
  persist(
    (set, get) => ({
      bets: [],

      addBet: (bet) => set((state) => ({
        bets: [...state.bets, bet]
      })),

      updateBetStatus: (betId, status) => set((state) => ({
        bets: state.bets.map(bet =>
          bet.id === betId ? { ...bet, status } : bet
        )
      })),

      getBetsByStatus: (status) => {
        const bets = get().bets || [];
        return bets.filter(bet => bet && bet.status === status && bet.selections && Array.isArray(bet.selections));
      },

      getAllBets: () => {
        return get().bets;
      },

      clearAllBets: () => set({ bets: [] }),
    }),
    {
      name: 'easybet-user-bets-storage',
    }
  )
);

interface MatchStatusState {
  matchStatuses: Record<string, Match['status']>;
  setMatchStatus: (matchId: string, status: Match['status']) => void;
  getMatchStatus: (matchId: string) => Match['status'] | undefined;
  clearAllStatuses: () => void;
}

export const useMatchStatusStore = create<MatchStatusState>()(
  persist(
    (set, get) => ({
      matchStatuses: {},

      setMatchStatus: (matchId, status) => set((state) => ({
        matchStatuses: { ...state.matchStatuses, [matchId]: status }
      })),

      getMatchStatus: (matchId) => {
        return get().matchStatuses[matchId];
      },

      clearAllStatuses: () => set({ matchStatuses: {} }),
    }),
    {
      name: 'easybet-match-status-storage',
    }
  )
);

interface BetSlipUIState {
  isExpanded: boolean;
  setIsExpanded: (isExpanded: boolean) => void;
}

export const useBetSlipUIStore = create<BetSlipUIState>((set) => ({
  isExpanded: false,
  setIsExpanded: (isExpanded) => set({ isExpanded }),
}));

type HomeTab = 'upcoming' | 'played' | 'finished';

interface NavigationState {
  activeHomeTab: HomeTab;
  setActiveHomeTab: (tab: HomeTab) => void;
}

export const useNavigationStore = create<NavigationState>()(
  persist(
    (set) => ({
      activeHomeTab: 'upcoming',
      setActiveHomeTab: (tab) => set({ activeHomeTab: tab }),
    }),
    {
      name: 'easybet-navigation-storage',
    }
  )
);

interface BadgeState {
  hasNewBet: boolean;
  setHasNewBet: (value: boolean) => void;
}

export const useBadgeStore = create<BadgeState>()(
  persist(
    (set) => ({
      hasNewBet: false,
      setHasNewBet: (value) => set({ hasNewBet: value }),
    }),
    {
      name: 'easybet-badge-storage',
    }
  )
);
