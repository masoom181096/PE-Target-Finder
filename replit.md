# PE Target Finder

A Private Equity Target Finder demo featuring a multi-phase conversational workflow guided by a finite state machine.

## Overview

This application guides PE analysts through a structured process to identify and evaluate acquisition targets, featuring:
- Multi-phase conversational workflow
- Live "Agent Thinking" panel showing step-by-step reasoning
- 10 customizable scoring weights (totaling 100%)
- Investment threshold configuration
- Automated company scoring and ranking
- Detailed investment memo generation

## Architecture

### Frontend (React + TypeScript)
- `client/src/pages/home.tsx` - Main page with three-column layout
- `client/src/components/` - UI components for each phase
  - `chat-window.tsx` - Main conversation interface
  - `thinking-panel.tsx` - Live reasoning display
  - `phase-progress.tsx` - Sidebar progress indicator
  - `fund-mandate-form.tsx` - Fund criteria input
  - `weights-form.tsx` - Scoring weight configuration
  - `thresholds-form.tsx` - Investment threshold setup
  - `country-screening-card.tsx` - Country filter display
  - `shortlist-card.tsx` - Candidate summary
  - `recommendations-table.tsx` - Detailed company comparison
  - `report-view.tsx` - Investment memo display

### Backend (Express + TypeScript)
- `server/logic/stateMachine.ts` - Phase transition logic
- `server/logic/scoring.ts` - Company scoring algorithms
- `server/logic/report.ts` - Memo generation templates
- `server/logic/companyData.ts` - Static company database

### Shared Types
- `shared/schema.ts` - All TypeScript types and Zod schemas

## Phase Flow

1. **welcome** - Initial greeting
2. **fundMandate** - Collect fund investment criteria
3. **countryScreening** - Filter by target countries (India/Singapore)
4. **weights** - Configure 10 scoring parameters (must sum to 100)
5. **thresholds** - Set investment requirements
6. **shortlist** - Display ranked candidates
7. **comparison** - Detailed review with "Generate Report" option
8. **reportChosen** - Display comprehensive investment memo

## Running the Application

```bash
npm run dev
```

The application runs on port 5000 with hot reloading enabled.

## Technical Notes

- State machine requires explicit phase transitions
- Session state persisted via localStorage (sessionId)
- Companies: Mantla Platform (HR SaaS), Instaworks (WorkTech), Disprztech (Enterprise Training)
- Design follows Material Design 3 adapted for financial services
