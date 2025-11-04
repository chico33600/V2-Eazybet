# EasyBet - Sports Betting PWA

## Overview

EasyBet is a fictional sports betting Progressive Web Application built with Next.js 13. The application simulates a sports betting platform with a gamified tap-to-earn system, using mock data and local state management. Users can place virtual bets on sports matches using two virtual currencies: coins (💰) and diamonds (💎). The app features a dark, modern UI inspired by betting platforms like Winamax, with a focus on mobile-first design and engaging interactions.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework**: Next.js 13 with App Router
- Server and client components pattern
- TypeScript for type safety
- Client-side rendering for interactive features

**UI Component Library**: shadcn/ui
- Radix UI primitives for accessible components
- Tailwind CSS for styling with custom design tokens
- Framer Motion for animations and interactions

**State Management**: Zustand with Persistence
- Multiple stores for different concerns (user, bets, match status)
- `zustand/middleware` for local storage persistence
- Client-side state without backend dependency

**Styling Approach**:
- Dark theme as default with custom CSS variables
- Gradient backgrounds and glassmorphism effects
- Mobile-first responsive design
- Custom color palette (EasyBet red #C1322B, gold #F5C144, blue #2A84FF)

**Key Design Patterns**:
- Component composition with separation of concerns
- Shared layout pattern: AppLayout wrapper provides consistent header, navigation, and modals across all pages
- Custom hooks pattern (though currently minimal)
- Store-based architecture for cross-component state
- Mock data simulation for matches and results

### Core Features & Components

**Navigation Structure**:
- Shared AppLayout component wraps all pages with persistent UI elements
- Bottom tab navigation with 4 main sections: Home, Classement (Leaderboard), Airdrop, Profil (Profile)
- Fixed header (HeaderCoins) with clickable elements:
  - Avatar button (top-left): navigates to /profil with hover scale effect
  - Coin button: opens tap-to-earn modal (existing functionality)
  - Diamond button (top-right): navigates to /airdrop with hover border glow
  - All navigation uses Next.js router for SPA-style transitions
  - Aria-labels for accessibility compliance
- Floating action button with conditional visibility:
  - Only shows on Home page's "À venir" tab
  - Automatically hides when bet slip opens or when user has active selections
  - Visibility persists correctly across page navigations using store-based state
  - Hydration-safe rendering prevents SSR flash issues
- Centralized TapToEarnModal state management in AppLayout
- SPA-style navigation with smooth transitions between sections

**Betting System**:
- Three bet types per match: home win (1), draw (N), away win (2)
- Simple bets (single match) and combo bets (multiple matches)
- Bet slip component for managing selections
- Two currency options: coins or diamonds
- Dynamic odds calculation for potential winnings
- Bonus diamonds earned (1% of profit) when betting with coins

**Match Display**:
- Three match status categories: upcoming, played, finished
- Horizontal scrollable match cards grouped by league
- Match card with background image, team names, and odds buttons
- Real-time match status updates via simulation

**Tap-to-Earn System**:
- Modal-based coin earning mechanism
- Limited to 3 simultaneous taps
- Animated coin collection with flying effects
- Visual feedback with floating "+1" indicators

**Match Simulation**:
- Automatic match result simulation (15-second intervals by default)
- Random outcome generation for pending bets
- Automatic bet settlement with winning/losing status
- Automatic currency distribution for won bets

### Data Flow & State Management

**User Store** (`useUserStore`):
- Manages coins and diamonds balances
- Methods: `addCoins`, `addDiamonds`, `deductCoins`, `deductDiamonds`
- Persisted to local storage

**Bet Store** (`useBetStore`):
- Manages current bet slip selections
- Methods: `addSelection`, `removeSelection`, `clearSelections`, `toggleSelection`
- Ephemeral (not persisted)

**User Bets Store** (`useUserBetsStore`):
- Tracks all placed bets with their status
- Methods: `addBet`, `updateBetStatus`, `clearAllBets`
- Persisted to local storage

**Match Status Store** (`useMatchStatusStore`):
- Overrides default match statuses from mock data
- Methods: `setMatchStatus`, `getMatchStatus`, `clearAllStatuses`
- Persisted to local storage

**Bet Slip UI Store** (`useBetSlipUIStore`):
- Manages the expanded/collapsed state of the bet slip
- Methods: `setIsExpanded`
- Persisted to local storage to maintain state across page navigations

**Navigation Store** (`useNavigationStore`):
- Tracks the active tab on the Home page (upcoming/played/finished)
- Methods: `setActiveHomeTab`
- Persisted to local storage to remember user's last tab selection

### Mock Data Structure

**Match Object**:
- Unique ID, league, datetime, teams, odds (home/draw/away)
- Status: upcoming, played, or finished
- Optional scores and image URL
- Static mock data in `lib/mock-data.ts`

**League Groups**:
- Matches organized by league for display
- Currently includes Ligue 1 (France), Premier League (England), La Liga (Spain), Serie A (Italy), Bundesliga (Germany)

### Simulation Logic

**Match Simulator** (`lib/match-simulator.ts`):
- Runs on intervals to randomly resolve pending bets
- Selects random bet from pending list
- Generates random outcome for each match in the bet
- Updates match status to "finished"
- Settles bet and distributes winnings if won
- Can be started/stopped programmatically

### Layout Architecture

**AppLayout Component** (`components/app-layout.tsx`):
- Wrapper component that provides consistent UI across all pages
- Manages tap-to-earn modal state at the app level
- Renders HeaderCoins, BottomNav, FloatingButton, and TapToEarnModal
- Provides proper spacing (pt-20 pb-24) for fixed header/footer
- Eliminates code duplication across individual pages

### Page Structure

All pages are wrapped by AppLayout and render only their content:
- **Home (`/`)**: Match listings with tabs and bet slip
- **Classement (`/classement`)**: Leaderboard with top players (mock data)
- **Airdrop (`/airdrop`)**: Information about future crypto token airdrop eligibility
- **Profil (`/profil`)**: User statistics, achievements, and reset functionality

## External Dependencies

**Core Framework**:
- Next.js 13 (App Router)
- React 18
- TypeScript

**UI Libraries**:
- @radix-ui/* (multiple component primitives)
- Tailwind CSS with autoprefixer
- Framer Motion for animations
- class-variance-authority and clsx for conditional styling

**State Management**:
- Zustand with persist middleware

**Form Handling** (installed but not actively used):
- react-hook-form
- @hookform/resolvers

**Date Utilities**:
- date-fns

**Carousel**:
- embla-carousel-react

**Backend/Database**:
- @supabase/supabase-js (installed but not currently integrated)
- No active database connection; all data is mock/local

**Icons**:
- lucide-react

**Note**: The application currently operates entirely client-side with mock data and local storage. No backend configured yet.