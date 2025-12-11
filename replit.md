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
- Session save/load with full state persistence
- PDF export of investment memos
- Side-by-side company comparison with bar/radar charts
- Customizable report templates (Growth, Buyout, Venture)
- Data visualization with scoring radar charts and financial metrics

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
  - `company-comparison.tsx` - Bar/Radar chart comparison with toggle
  - `report-view.tsx` - Investment memo with template selection, scoring radar, financial metrics charts
  - `session-manager.tsx` - Save/load session UI

### Backend (Express + TypeScript)
- `server/logic/stateMachine.ts` - Phase transition logic
- `server/logic/scoring.ts` - Company scoring algorithms
- `server/logic/reports.ts` - Memo generation with template support
- `server/data/companies.ts` - Static company database
- `server/storage.ts` - PostgreSQL session persistence via Drizzle ORM
- `server/routes.ts` - API endpoints for chat, sessions, reports, company data

### Database
- PostgreSQL with Drizzle ORM
- `sessions` table stores complete workflow state including messages, thinking steps, and report data

### Shared Types
- `shared/schema.ts` - All TypeScript types, Zod schemas, ReportTemplate type

## Phase Flow

1. **welcome** - Initial greeting
2. **fundMandate** - Collect fund investment criteria
3. **countryScreening** - Filter by target countries (India/Singapore)
4. **weights** - Configure 10 scoring parameters (must sum to 100)
5. **thresholds** - Set investment requirements
6. **shortlist** - Display ranked candidates
7. **comparison** - Detailed review with chart comparison and "Generate Report" option
8. **reportChosen** - Display comprehensive investment memo with visualizations

## Features

### Session Management
- Save current session with name to PostgreSQL
- Load previous sessions with full state restoration
- Sessions preserve messages, thinking steps, and report data

### PDF Export
- Export investment memos to PDF with proper text wrapping
- Professional formatting with headers, sections, and tables

### Company Comparison
- Bar chart view showing 10 scoring dimensions
- Radar chart overlay view for multi-company comparison
- Toggle between bar and radar visualizations

### Report Templates
- PE Growth: Emphasizes revenue growth, market expansion, scalability
- Buyout: Emphasizes operational improvements, cash flow, quality of earnings
- Venture: Emphasizes market opportunity, differentiation, exit potential

### Data Visualization
- Scoring radar chart comparing company scores vs benchmarks
- Financial metrics bar chart with threshold comparison
- higherIsBetter logic for proper threshold display (Min/Max labels)

## API Endpoints

- `POST /api/chat/next` - Advance conversation state
- `GET /api/sessions` - List saved sessions
- `POST /api/sessions` - Save current session
- `GET /api/sessions/:id` - Load specific session
- `GET /api/report/:companyId?templateType=growth|buyout|venture` - Generate investment memo
- `GET /api/companies/scores?ids=x,y,z` - Get scoring dimensions
- `GET /api/companies/:id/details` - Get full company metrics

## Running the Application

```bash
npm run dev
```

The application runs on port 5000 with hot reloading enabled.

## Technical Notes

- State machine requires explicit phase transitions
- Session state persisted to PostgreSQL via Drizzle ORM
- Companies: Mantla Platform (CPaaS, India), Instaworks (CPaaS, India), Disprztech (LXP, Singapore)
- Design follows Material Design 3 adapted for financial services
- All scoring dimensions: Quality of Earnings, Financial Performance, Industry Attractiveness, Competitive Positioning, Management/Governance, Operational Efficiency, Customer/Market Dynamics, Product Strength, Exit Feasibility, Scalability Potential
