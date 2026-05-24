# Devpost Submission Checklist & Package 🏆

This document outlines the final copy and metadata package for the Devpost submission of GrantAI.

---

## 1. Submission Details

### Submission Title
> **GrantAI — AI-Powered Grant Discovery & Writing**

### Tagline
> **Find, match, and win grants faster with AI-powered semantic discovery, stream letter writing, and mock panel simulations.**

---

## 2. Devpost Narrative Copy

### 💡 The Inspiration (Problem)
Millions of dollars in research and nonprofit funding go unclaimed or are wasted in slow, manual, administrative writing cycles. Academic researchers, non-profit directors, and early-stage startup founders spend up to 40% of their operational hours searching through thousands of disjointed databases, checking complex eligibility requirements, drafting cover letters, and preparing for defense committee panels.

We built **GrantAI** to streamline this entire lifecycle, moving candidates from scan to shortlist to application in under 10 seconds.

### 🛠️ What it Does (Solution)
GrantAI is a comprehensive monorepo command center that automates the end-to-end grant lifecycle:
1. **Semantic Discovery**: Analyzes candidate research profiles and matches them to thousands of live funding opportunities with ranked suitability scores and clear logical explanations.
2. **Interactive Pipeline Tracker**: A drag-and-drop Kanban board designed to track applications, outline aggregates (won vs. applied totals), and calculate deadline urgencies.
3. **AI Writing Assistant**: An interactive letter editor that streams custom, professional cover letters using Server-Sent Events (SSE) based on custom tone and emphasis.
4. **Interview Prep Room**: An AI-powered mock defense simulator that asks tailored technical and impact questions, captures answers, and delivers structured scores & advice.

### 🧱 How We Built It (Tech Stack)
- **Frontend Panel**: Next.js 14 App Router, TypeScript, Tailwind CSS, Framer Motion, Zustand state management, and `react-window` for list virtualization.
- **Spring Boot Backend**: Spring Boot 3 (Java 21), Spring Data JPA, and Spring Security (JWT session handlers).
- **AI Core Service**: FastAPI (Python 3.12) running LangChain for RAG pipelines.
- **Database & Cache**: PostgreSQL 16 + pgvector database for vector search embeddings alongside Redis 7 caching.
- **Guided Demo Mode**: A client-side interceptor built directly in `frontend/lib/api.ts` that acts as a local browser database, bypassing all backend cold starts or credentials during evaluations.

### 🚀 Challenges We Overcame
- **Server-Sent Events Streaming**: Implementing reliable SSE streams that render chunk-by-chunk in real-time, complete with responsive animations.
- **Performance at Scale**: Adding `react-window` virtualization to prevent DOM memory leaks when rendering large sets of live search results.
- **Evaluation Accessibility**: Creating the zero-dependency **Guided Demo Mode** to allow hackathon judges to interact with the full product instantly on Vercel without experiencing server cold starts.

### 🌟 Accomplishments That We're Proud Of
- A beautiful, cohesive glassmorphic design system that handles light and dark themes seamlessly.
- Responsive design adapting fluidly from large monitors down to a minimum 375px mobile screen.
- A fully functional simulated local database allowing real drag-and-drop state modifications, letter generations, and interview prep in Demo Mode.

### 🔮 What's Next for GrantAI
- Real-time notification integrations (email and Slack) for impending deadline alerts.
- Support for collaborative multi-user editing for team-based grant submissions.
- Deep integration with federal portals (grants.gov) to support direct-submit workflows.

---

## 3. Submission Links

- **GitHub Repository**: [Suthankan1/grantai](https://github.com/Suthankan1/grantai)
- **Interactive Vercel Demo**: [https://grantai-demo.vercel.app](https://grantai-demo.vercel.app)

---

## 4. Screenshot Placements

When uploading to Devpost, place these screenshots in order:
1. **`01_landing_page.png`**: The hero landing page showing the judges' floating alert banner and theme toggles.
2. **`02_guided_portal.png`**: The `/demo` gateway showcasing the Stanford PhD research profile vectors.
3. **`03_dashboard.png`**: The command dashboard showing suitability trends, funnel progression, and deadline timelines.
4. **`04_grant_finder.png`**: The Grant Finder grid with bottom-sheet filters on mobile screen.
5. **`05_kanban_tracker.png`**: Drag-and-drop Kanban board showing won vs. applied aggregate totals.
6. **`06_letter_writer.png`**: The AI Cover Letter editor simulating stream generation with word animations.
7. **`07_interview_prep.png`**: The Mock Interview prep Hub and scoring audit logs.
