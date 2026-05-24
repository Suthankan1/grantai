# GrantAI 🚀

**AI-Powered Grant Discovery & Writing Platform**

> Find, match, and win grants faster. GrantAI analyzes thousands of funding opportunities and writes compelling applications tailored to your organization.

---

## Monorepo Structure

```
grantai/
├── frontend/          ← Next.js 14 (App Router) · TypeScript · Tailwind CSS
├── backend/           ← Spring Boot 3 · Java 21 · PostgreSQL · Redis
├── ai-engine/         ← FastAPI · Python 3.12 · LangChain · pgvector
├── docker-compose.yml ← Full local dev stack
├── .gitignore
├── LICENSE
└── README.md
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | Next.js 14 (App Router), TypeScript, Tailwind CSS, Framer Motion, shadcn/ui |
| **Backend** | Spring Boot 3, Java 21, Spring Security (JWT), Spring Data JPA |
| **AI Engine** | FastAPI, Python 3.12, LangChain, OpenAI GPT-4, pgvector |
| **Database** | PostgreSQL 16 + pgvector extension |
| **Cache** | Redis 7 |
| **Auth** | JWT + Spring Security |
| **Infra** | Docker, Docker Compose |

---

## Getting Started

### Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) ≥ 4.x
- [Node.js](https://nodejs.org/) ≥ 20 (for frontend development)
- [Java 21](https://adoptium.net/) (for backend development)
- [Python 3.12](https://www.python.org/) (for AI engine development)

### 1. Clone & configure

```bash
git clone https://github.com/your-org/grantai.git
cd grantai
cp .env.example .env      # fill in your API keys
```

### 2. Run the full stack

```bash
docker compose up --build
```

| Service | URL |
|---|---|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:8080 |
| AI Engine | http://localhost:8000 |
| API Docs (Swagger) | http://localhost:8080/swagger-ui.html |
| AI Engine Docs | http://localhost:8000/docs |

### 3. Run services individually

**Frontend (Next.js)**
```bash
cd frontend
npm install
npm run dev          # http://localhost:3000
```

**Backend (Spring Boot)**
```bash
cd backend
./mvnw spring-boot:run   # http://localhost:8080
```

**AI Engine (FastAPI)**
```bash
cd ai-engine
pip install uv
uv venv && source .venv/bin/activate
uv pip install -r requirements.txt
uvicorn app.main:app --reload   # http://localhost:8000
```

---

## Environment Variables

Create a `.env` file at the repo root (see `.env.example`):

```env
# Database
POSTGRES_PASSWORD=your_secure_password

# JWT
JWT_SECRET=your_jwt_secret_min_32_chars

# AI
OPENAI_API_KEY=sk-...
PINECONE_API_KEY=your_pinecone_key   # optional
```

---

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feat/your-feature`
3. Commit with conventional commits: `feat: add grant matching algorithm`
4. Open a pull request

---

## License

[MIT](./LICENSE) © 2026 GrantAI
