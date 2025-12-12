# PE Target Finder

A Private Equity Target Finder demo featuring a multi-phase conversational workflow guided by a finite state machine.

## Overview

This application guides PE analysts through a structured process to identify and evaluate acquisition targets, featuring:
- Multi-phase conversational workflow with 11 phases including restrictions assessment and task completion
- Live "Agent Thinking" panel with typewriter-style streaming animation
- Macro/Micro/Fund restrictions step with mandate compatibility analysis
- 10 customizable scoring weights (totaling 100%) with 50+ sub-parameters
- Investment threshold configuration with preference levels (auto/hardFilter/high/medium/low/ignore)
- Forced company ranking: Mantla (rank 1), Instaworks (rank 2), Disprztech (rank 3)
- Multi-company selection for due diligence (minimum 2 companies required)
- Contract risk assessment with 11 risk buckets and 24 subclauses
- Detailed investment memo generation with risk analysis
- Session save/load with full state persistence
- PDF export of investment memos
- Side-by-side company comparison with bar/radar charts
- Customizable report templates (Growth, Buyout, Venture)
- Data visualization with scoring radar charts and financial metrics
- Final preferred company selection with success confirmation

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
  - `due-diligence-reports.tsx` - Tabbed reports for multi-company due diligence with risk comparison strip
  - `contract-risk-section.tsx` - Contract risk breakdown with 11 buckets and grading
  - `task-completed.tsx` - Success screen for final company selection
  - `session-manager.tsx` - Save/load session UI

### Backend (Express + TypeScript)
- `server/logic/stateMachine.ts` - Phase transition logic
- `server/logic/scoring.ts` - Company scoring algorithms
- `server/logic/reports.ts` - Memo generation with template support
- `server/logic/riskCalculation.ts` - Contract risk scoring with normalization and grading
- `server/data/companies.ts` - Static company database
- `server/data/riskModel.ts` - Risk buckets, subclauses, and company risk scores
- `server/storage.ts` - PostgreSQL session persistence via Drizzle ORM
- `server/routes.ts` - API endpoints for chat, sessions, reports, company data

### Database
- PostgreSQL with Drizzle ORM
- `sessions` table stores complete workflow state including messages, thinking steps, and report data

### Shared Types
- `shared/schema.ts` - All TypeScript types, Zod schemas, ReportTemplate type

## Phase Flow

1. **welcome** - Initial greeting
2. **fundMandate** - Collect fund investment criteria (11 categories with checkbox/radio + "Other" patterns)
3. **restrictions** - Macro/Micro/Fund restrictions input (e.g., "Avoid US sanctioned countries")
4. **countryScreening** - Filter by target countries (India/Singapore), includes macro/micro analysis
5. **weights** - Configure 10 scoring parameters (must sum to 100)
6. **thresholds** - Set investment requirements with 50+ sub-parameters
7. **shortlist** - Display ranked candidates (forced ranking: Mantla > Instaworks > Disprztech)
8. **comparison** - Detailed review with chart comparison and "Generate Report" option
9. **dueDiligence** - Tabbed investment memos with risk comparison for selected companies
10. **reportChosen** - Display comprehensive investment memo with visualizations
11. **taskCompleted** - Final selection confirmation with next steps summary

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

### Contract Risk Assessment
- 11 risk buckets: Liability (25%), Termination (20%), Confidentiality (20%), Non-Compete (10%), Intellectual Property (10%), Indemnities (10%), Step-In (7%), Non-Solicitation (5%), Personnel (5%), Penalty (5%), Payment Terms (5%)
- 24 subclauses with configurable risk scores per company
- Risk normalization: rawTotal/72*100 = normalized percent
- Risk grading: Low (≤35%), Medium (35-65%), High (>65%)
- Top 3 key contributors identification
- Risk comparison strip for multi-company comparison

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
- Forced ranking ensures demo consistency: Mantla > Instaworks > Disprztech with scores 90/87/84
- ThinkingPanel uses typewriter animation at 15ms per character interval
- Restrictions phase captures macro/micro constraints before country screening
- 50+ sub-parameters defined in SUB_PARAMETERS constant for detailed threshold configuration
- Contract risk assessment calculates normalized score as rawTotal/72*100, assigns grade based on thresholds, identifies top 3 contributing buckets
- Multi-company selection requires minimum 2 companies to proceed to due diligence phase
- DueDiligence phase shows tabbed reports with embedded ReportView components and risk comparison strip
- TaskCompleted phase displays success confirmation with next steps for investment committee
