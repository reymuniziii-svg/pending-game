# Pending | A Life in the System

## Overview

Pending is an interactive life simulation game that reveals the US immigration system through lived experience. Players navigate the complexities, waiting periods, bureaucratic challenges, and emotional weight of the American immigration process by playing as one of several characters with different immigration statuses (DACA recipient, H-1B worker, asylum seeker, or undocumented immigrant).

The game is a single-page React application with a documentary-style aesthetic, featuring event-driven narrative gameplay, time progression mechanics, and branching story paths based on player choices.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 19 with TypeScript, built using Vite
- **Styling**: Tailwind CSS with custom design tokens for a documentary aesthetic (muted, restrained colors)
- **UI Components**: Custom component library built on Radix UI primitives (Dialog, Progress, Tabs, etc.)
- **Animations**: Lottie-react for procedural animations representing bureaucratic processes

### State Management
- **Pattern**: Zustand stores with domain separation
- **Stores**:
  - `useGameStore`: Meta game state, screen navigation, game lifecycle
  - `useCharacterStore`: Player profile, immigration status, stats, flags, documents
  - `useTimeStore`: Time flow system with pause/speed controls, deadline tracking
  - `useFinanceStore`: Bank balance, income, expenses, immigration costs
  - `useEventStore`: Event queue, current event, choice history, interrupt system
  - `useFormStore`: Immigration applications, processing status, RFE handling
  - `useRelationshipStore`: NPC relationships (spouse, employer, family)
  - `useSaveStore`: Persistent save/load with local storage

### Game Systems

**Time Flow System**: 
- Day-based time progression with 100ms tick rate
- Tracks currentDay/currentMonth/currentYear and totalDaysElapsed
- Configurable speed (1x, 2x, 4x)
- Auto-pause on important events
- Quiet period handling for time skips
- Deadline pressure tracking
- daysSinceLastEvent ensures events occur at least every 30 days

**Event Engine**:
- Condition-based event triggering (status, flags, stats, dates)
- Random event eligibility uses totalDaysElapsed (earliestMonth/latestMonth converted to days)
- Scheduled events use absolute month/year dates via addMonths utility
- Event chains for multi-part storylines (4-8 events deep)
- Interrupt priority system (critical, important, normal, ambient)
- Weighted random selection for variety

**Immigration Simulation**:
- Real USCIS form data (fees, processing times)
- Policy traps based on actual immigration law quirks
- Status transitions with realistic constraints

### Screen Flow
1. Title Screen → Content Warning → Character Select
2. Opening Sequence (character backstory)
3. Main Game Loop (events, choices, time progression)
4. Ending Screen (outcome summary)

### Character Profiles
Four playable characters with distinct immigration pathways:
- Maria (DACA recipient)
- David (H-1B worker)
- Fatima (Asylum seeker)
- Elena (Undocumented)

Each has unique event chains, starting conditions, and possible endings.

## External Dependencies

### UI Libraries
- **Radix UI**: Accessible primitives (Dialog, Progress, Tabs, Dropdown, Alert Dialog)
- **Lucide React**: Icon system
- **class-variance-authority**: Component variant management
- **tailwind-merge + clsx**: Class name utilities

### Animation
- **lottie-react**: JSON-based animations for loading states and visual feedback

### Utilities
- **uuid**: Unique ID generation for events, applications, transactions
- **zustand**: State management with persistence middleware

### Build Tools
- **Vite**: Development server and build tool
- **TypeScript**: Type safety throughout
- **PostCSS + Autoprefixer**: CSS processing

### Fonts (External)
- IBM Plex Mono (monospace/system text)
- Inter (body text)
- Source Serif Pro (headings/narrative)

No backend, database, or external APIs are currently integrated. The game runs entirely client-side with local storage for save data.