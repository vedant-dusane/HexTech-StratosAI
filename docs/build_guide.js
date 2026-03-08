const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  HeadingLevel, AlignmentType, BorderStyle, WidthType, ShadingType, PageBreak
} = require("docx");
const fs = require("fs");

// ── Helpers ────────────────────────────────────────────────────────────────

function h1(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 560, after: 200 },
    children: [new TextRun({ text, bold: true, size: 40, color: "1A2744", font: "Georgia" })],
    border: { bottom: { style: BorderStyle.THICK, size: 6, color: "F0C060" } },
  });
}

function h2(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 360, after: 120 },
    children: [new TextRun({ text, bold: true, size: 28, color: "1A2744" })],
  });
}

function h3(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_3,
    spacing: { before: 240, after: 80 },
    children: [new TextRun({ text, bold: true, size: 22, color: "2A3A5C" })],
  });
}

function p(text, opts = {}) {
  return new Paragraph({
    spacing: { before: 60, after: 100 },
    children: [new TextRun({ text, size: 20, color: "333333", ...opts })],
  });
}

function note(text, color = "B8922A") {
  return new Paragraph({
    spacing: { before: 100, after: 100 },
    indent: { left: 360 },
    border: { left: { style: BorderStyle.THICK, size: 14, color } },
    shading: { type: ShadingType.SOLID, color: "FFFBF0" },
    children: [new TextRun({ text, size: 19, color: "665522", italics: true })],
  });
}

function warn(text) {
  return note(text, "CC3333");
}

function bullet(text, level = 0) {
  return new Paragraph({
    bullet: { level },
    spacing: { before: 40, after: 40 },
    indent: { left: 360 + level * 360 },
    children: [new TextRun({ text, size: 20, color: "333333" })],
  });
}

function code(text) {
  return new Paragraph({
    spacing: { before: 40, after: 40 },
    shading: { type: ShadingType.SOLID, color: "0D1117" },
    indent: { left: 180, right: 180 },
    children: [new TextRun({ text, size: 18, color: "F0C060", font: "Courier New" })],
  });
}

function codeBlock(lines) {
  return lines.map(code);
}

function sep() {
  return new Paragraph({
    spacing: { before: 300, after: 300 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 2, color: "DDDDDD" } },
    children: [],
  });
}

function pgBreak() {
  return new Paragraph({ children: [new PageBreak()] });
}

function table2col(rows) {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: rows.map(([a, b]) => new TableRow({
      children: [
        new TableCell({
          width: { size: 32, type: WidthType.PERCENTAGE },
          shading: { type: ShadingType.SOLID, color: "F7F4EC" },
          margins: { top: 120, bottom: 120, left: 150, right: 150 },
          children: [new Paragraph({ children: [new TextRun({ text: a, bold: true, size: 19, color: "1A2744" })] })],
        }),
        new TableCell({
          width: { size: 68, type: WidthType.PERCENTAGE },
          margins: { top: 120, bottom: 120, left: 150, right: 150 },
          children: [new Paragraph({ children: [new TextRun({ text: b, size: 19, color: "444444" })] })],
        }),
      ],
    })),
  });
}

function stepBlock(num, title, desc) {
  return [
    new Paragraph({
      spacing: { before: 200, after: 80 },
      children: [
        new TextRun({ text: `${num}. `, bold: true, size: 22, color: "F0C060" }),
        new TextRun({ text: title, bold: true, size: 22, color: "1A2744" }),
      ],
    }),
    p(desc),
  ];
}

// ── Document ───────────────────────────────────────────────────────────────

const children = [

  // ── COVER PAGE ─────────────────────────────────────────────────────────
  new Paragraph({
    spacing: { before: 1800, after: 240 },
    alignment: AlignmentType.CENTER,
    children: [new TextRun({ text: "StratosAI", bold: true, size: 88, color: "1A2744", font: "Georgia" })],
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 160 },
    children: [new TextRun({ text: "Business Decision Intelligence Platform", size: 28, color: "7A8AA0", italics: true, font: "Georgia" })],
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 0 },
    border: { bottom: { style: BorderStyle.THICK, size: 10, color: "F0C060" } },
    children: [new TextRun({ text: "", size: 8 })],
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 640, after: 160 },
    children: [new TextRun({ text: "Complete Setup & GitHub Desktop Guide", bold: true, size: 40, color: "1A2744" })],
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 160 },
    children: [new TextRun({ text: "React 18 + TypeScript + FastAPI + Claude API · Team HexTech", size: 22, color: "7A8AA0" })],
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 3000 },
    children: [new TextRun({ text: "Local Development · GitHub Sync · CI/CD · Production Ready", size: 20, color: "9AABBF", italics: true })],
  }),

  pgBreak(),

  // ── 1. OVERVIEW ────────────────────────────────────────────────────────
  h1("1.  Project Overview"),
  p("StratosAI is a full-stack AI application where 6 specialized agents analyze every strategic business decision — Scout, Devil, Oracle, Quant, Diplomat, and Strategist — and deliver a ranked recommendation with confidence score in real time via Server-Sent Events."),
  new Paragraph({ spacing: { before: 200, after: 120 }, children: [] }),
  table2col([
    ["Frontend",   "React 18 · TypeScript · Vite · Tailwind CSS · Framer Motion"],
    ["State",      "Zustand (global) · TanStack React Query (server state)"],
    ["Backend",    "FastAPI · Python 3.11 · SQLAlchemy async · Pydantic v2"],
    ["Database",   "SQLite (dev, zero config) → PostgreSQL (prod)"],
    ["AI Engine",  "Anthropic Claude claude-sonnet-4 · 6-agent pipeline · SSE streaming"],
    ["Resilience", "tenacity retry logic · structlog structured logging"],
    ["CI/CD",      "GitHub Actions — lint, type-check, test on every push"],
    ["Repo Sync",  "Git + GitHub Desktop — one-click commit/push workflow"],
  ]),

  pgBreak(),

  // ── 2. PREREQUISITES ───────────────────────────────────────────────────
  h1("2.  Prerequisites"),
  p("Install all four tools below before starting. They are all free."),

  h2("2.1  Node.js (for the Frontend)"),
  ...stepBlock(1, "Download", "Go to https://nodejs.org and download the LTS version (v20 or higher). Run the installer with all defaults checked."),
  ...stepBlock(2, "Verify", "Open Terminal (Mac/Linux) or Command Prompt (Windows) and run:"),
  code("node --version    # should show v20.x.x or higher"),
  code("npm --version     # should show 10.x.x or higher"),

  sep(),

  h2("2.2  Python 3.11+ (for the Backend)"),
  ...stepBlock(1, "Mac — install via Homebrew",
    "If you don't have Homebrew, install it at https://brew.sh first. Then:"),
  code("brew install python@3.11"),
  ...stepBlock(1, "Windows — download installer",
    "Go to https://python.org/downloads and download Python 3.11 or 3.12. IMPORTANT: during installation, tick the checkbox that says 'Add Python to PATH'."),
  ...stepBlock(2, "Verify", ""),
  code("python3 --version    # Mac/Linux → Python 3.11.x"),
  code("python --version     # Windows   → Python 3.11.x"),

  sep(),

  h2("2.3  Git"),
  ...stepBlock(1, "Mac",
    "Git is usually pre-installed on Mac. Check with: git --version. If missing: brew install git"),
  ...stepBlock(1, "Windows",
    "Download Git from https://git-scm.com/download/windows. Accept all default settings in the installer."),

  sep(),

  h2("2.4  GitHub Desktop"),
  ...stepBlock(1, "Download", "Go to https://desktop.github.com and download GitHub Desktop for your operating system."),
  ...stepBlock(2, "Sign in", "Open GitHub Desktop → File → Options (Win) or GitHub Desktop → Preferences (Mac) → Accounts → Sign In. If you don't have a GitHub account, create one free at https://github.com"),

  sep(),

  h2("2.5  Anthropic API Key"),
  ...stepBlock(1, "Create account", "Go to https://console.anthropic.com and sign up."),
  ...stepBlock(2, "Generate key", "Profile → API Keys → Create Key. Name it 'stratosai-local'. Copy it immediately — you only see it once."),
  note("⚠  Keep your API key secret. The app reads it from a .env file which is excluded from Git by .gitignore. Never paste it into any code file."),

  pgBreak(),

  // ── 3. GITHUB REPO SETUP ───────────────────────────────────────────────
  h1("3.  GitHub Repository Setup"),

  h2("3.1  Create a New GitHub Repository"),
  ...stepBlock(1, "Go to GitHub", "Open https://github.com and sign in. Click + in the top right → New repository."),
  ...stepBlock(2, "Fill in the form", "Use these settings:"),
  table2col([
    ["Repository name", "stratosai"],
    ["Description",     "Business Decision Intelligence Platform"],
    ["Visibility",      "Private (recommended — keeps your API key context safe)"],
    ["Initialize repo", "NO — leave all checkboxes unchecked, we provide our own files"],
  ]),
  ...stepBlock(3, "Create", "Click the green 'Create repository' button. GitHub shows you an empty repo page. Keep this tab open."),

  sep(),

  h2("3.2  Add the Project to GitHub Desktop"),
  p("Option A — If you already have the project folder locally:"),
  bullet("Open GitHub Desktop"),
  bullet("File → Add Local Repository"),
  bullet("Browse to your stratosai project folder"),
  bullet("Click 'Add Repository'"),
  p(""),
  p("Option B — Clone from GitHub URL (fresh setup):"),
  bullet("File → Clone Repository → URL tab"),
  bullet("Paste: https://github.com/YOUR_USERNAME/stratosai"),
  bullet("Choose local path (e.g. ~/Projects/stratosai)"),
  bullet("Click Clone"),

  sep(),

  h2("3.3  Publish the Repository to GitHub"),
  ...stepBlock(1, "Publish", "After adding the local repository, click 'Publish repository' in the top bar of GitHub Desktop."),
  ...stepBlock(2, "Settings", "Choose your account, keep the repo name, and check 'Keep this code private' if you want it private."),
  ...stepBlock(3, "Done", "Click 'Publish Repository'. GitHub Desktop uploads everything. Your code is now online at github.com/YOUR_USERNAME/stratosai."),

  sep(),

  h2("3.4  Configure the .env File  (critical — never commit this file)"),
  warn("The .env file contains your secret Anthropic API key. It is listed in .gitignore which means Git will automatically skip it and never upload it to GitHub. This is intentional and essential."),
  p("Create .env by copying the example template:"),
  code("# Mac / Linux (run in the backend folder):"),
  code("cp .env.example .env"),
  code(""),
  code("# Windows (Command Prompt):"),
  code("copy .env.example .env"),
  p("Open the .env file in any text editor and fill in your key:"),
  code("ANTHROPIC_API_KEY=sk-ant-api03-your-actual-key-here"),
  p("Save. That is the only required change. All other settings have sensible defaults."),

  pgBreak(),

  // ── 4. BACKEND SETUP ───────────────────────────────────────────────────
  h1("4.  Backend Setup  (FastAPI)"),

  h2("4.1  Create a Python Virtual Environment"),
  p("A virtual environment isolates project packages from your system Python. Always use one."),
  code("# Navigate into the backend folder"),
  code("cd path/to/stratosai/backend"),
  code(""),
  code("# Create the virtual environment"),
  code("python3 -m venv venv          # Mac / Linux"),
  code("python -m venv venv           # Windows"),
  p("Activate it — you must do this every time you open a new terminal window:"),
  code("source venv/bin/activate      # Mac / Linux  →  prompt shows (venv)"),
  code("venv\\Scripts\\activate         # Windows"),

  sep(),

  h2("4.2  Install Python Dependencies"),
  code("pip install -r requirements.txt"),
  p("Installs FastAPI, SQLAlchemy, the Anthropic SDK, structlog, tenacity, and test tools. Takes 60-90 seconds."),

  sep(),

  h2("4.3  Run the Backend Server"),
  code("uvicorn app.main:app --reload --port 8000"),
  p("Expected output:"),
  code("INFO:     Uvicorn running on http://127.0.0.1:8000"),
  code("INFO:     Application startup complete."),
  p("The SQLite database file (stratosai.db) is created automatically on first run. The --reload flag auto-restarts on every Python file save."),
  note("Leave this terminal running while you develop. Open a second terminal for the frontend."),

  sep(),

  h2("4.4  Verify the Backend Works"),
  bullet("Open http://localhost:8000/health — should return: {\"status\": \"ok\"}"),
  bullet("Open http://localhost:8000/docs — interactive API documentation (Swagger UI)"),
  bullet("Try any endpoint in the docs: click it → 'Try it out' → Execute"),

  pgBreak(),

  // ── 5. FRONTEND SETUP ──────────────────────────────────────────────────
  h1("5.  Frontend Setup  (React + Vite)"),

  h2("5.1  Install Node Dependencies"),
  p("Open a NEW terminal window (keep the backend running in the first one)."),
  code("cd path/to/stratosai/frontend"),
  code("npm install"),
  p("Reads package.json and installs React, Vite, Tailwind, Framer Motion, and all other packages into node_modules/. Takes 30-60 seconds."),

  sep(),

  h2("5.2  Start the Frontend Dev Server"),
  code("npm run dev"),
  p("Expected output:"),
  code("  VITE v5.x  ready in 300 ms"),
  code("  ➜  Local:   http://localhost:5173/"),
  p("Open http://localhost:5173 in your browser. You should see the StratosAI application."),
  note("The frontend automatically proxies all /api requests to the backend on port 8000. This is configured in vite.config.ts — no changes needed."),

  sep(),

  h2("5.3  Verify End-to-End"),
  bullet("Open http://localhost:5173 in your browser"),
  bullet("Click 'New Decision' tab"),
  bullet("Click any of the example decisions to load sample data"),
  bullet("Click 'Analyze Decision'"),
  bullet("Watch 6 agents run in the left panel and results stream in live"),
  bullet("With ANTHROPIC_API_KEY set: real Claude responses from the API"),
  bullet("Without a key: intelligent mock responses (perfect for offline testing)"),

  pgBreak(),

  // ── 6. GITHUB DESKTOP WORKFLOW ─────────────────────────────────────────
  h1("6.  Daily GitHub Desktop Workflow"),
  p("This is the routine you follow every time you make changes."),

  h2("6.1  The Core Loop: Pull → Code → Commit → Push"),

  h3("Step 1: Pull before you start (every session)"),
  p("Always pull the latest changes from GitHub before coding:"),
  bullet("Open GitHub Desktop"),
  bullet("Click 'Fetch origin' in the top bar to check for remote changes"),
  bullet("If there are changes, click 'Pull origin' to download them"),
  note("This is most important when collaborating, but also good practice solo — edits made on GitHub.com (e.g. via the web editor) need to be pulled."),

  h3("Step 2: Make changes in your code editor"),
  p("Edit files normally. Frontend changes hot-reload instantly. Backend changes auto-reload too (--reload flag)."),

  h3("Step 3: Review your changes in GitHub Desktop"),
  bullet("Switch to GitHub Desktop — changed files appear in the left sidebar"),
  bullet("Click any file to see a precise line-by-line diff (green = added, red = removed)"),
  bullet("Uncheck any files you don't want in this particular commit"),

  h3("Step 4: Write a commit message and commit"),
  p("In the bottom-left panel:"),
  bullet("Summary field: write a clear, specific message describing what changed"),
  bullet("Description field (optional): more detail if needed"),
  bullet("Click the blue 'Commit to main' button"),
  p("Good commit message examples:"),
  code("Add confidence score bar to AnalysisOutput component"),
  code("Fix SSE stream not closing after pipeline_complete event"),
  code("Update EU expansion example with GDPR context"),
  p("Bad examples to avoid: 'fix', 'update', 'changes', 'wip'"),

  h3("Step 5: Push to GitHub"),
  bullet("Click 'Push origin' in the top bar (or Cmd/Ctrl+P)"),
  bullet("Code is now backed up on GitHub.com"),
  bullet("GitHub Actions CI will automatically run your tests"),

  sep(),

  h2("6.2  Feature Branches (for larger changes)"),
  p("For significant new features, use a branch to avoid breaking main:"),
  ...stepBlock(1, "Create branch", "GitHub Desktop: Branch → New Branch → name it feature/your-feature-name"),
  ...stepBlock(2, "Work on branch", "Commits go to your branch, not main. Safe to experiment."),
  ...stepBlock(3, "Merge when ready", "Branch → Merge into Current Branch → select main"),
  ...stepBlock(4, "Delete branch", "Branch → Delete after merging"),

  sep(),

  h2("6.3  GitHub Desktop Reference"),
  table2col([
    ["Changes tab",    "All modified files since last commit"],
    ["History tab",    "Full log of every commit ever made"],
    ["Fetch origin",   "Check if GitHub has new commits to download"],
    ["Pull origin",    "Download and apply new commits to local machine"],
    ["Push origin",    "Upload your local commits to GitHub"],
    ["Discard changes","Undo all edits to a specific file (right-click the file)"],
    ["Stash changes",  "Temporarily shelve work-in-progress (Branch → Stash Changes)"],
  ]),

  pgBreak(),

  // ── 7. CI/CD ───────────────────────────────────────────────────────────
  h1("7.  GitHub Actions CI/CD"),
  p("The file .github/workflows/ci.yml runs automatically on every push to GitHub. It runs two jobs in parallel:"),
  table2col([
    ["Backend job",  "ruff lint → black format check → pytest test suite"],
    ["Frontend job", "TypeScript type check → ESLint → Vite production build"],
  ]),
  p("To see results:"),
  bullet("Go to your repo on github.com"),
  bullet("Click the 'Actions' tab"),
  bullet("Green ✓ = passing. Red ✗ = something broke. Click the job to see details."),
  note("CI failures don't break your running local app. They flag issues in code quality or tests. Fix them to keep main green."),

  pgBreak(),

  // ── 8. COMMANDS REFERENCE ──────────────────────────────────────────────
  h1("8.  Quick Commands Reference"),

  h2("Backend"),
  table2col([
    ["Start server",         "uvicorn app.main:app --reload --port 8000"],
    ["Run all tests",        "pytest tests/ -v"],
    ["Lint code",            "ruff check app/"],
    ["Format code",          "black app/"],
    ["Activate venv (Mac)",  "source venv/bin/activate"],
    ["Activate venv (Win)",  "venv\\Scripts\\activate"],
    ["Install new package",  "pip install pkg-name && pip freeze > requirements.txt"],
  ]),

  h2("Frontend"),
  table2col([
    ["Start dev server",   "npm run dev"],
    ["Production build",   "npm run build"],
    ["TypeScript check",   "npm run type-check"],
    ["Lint",               "npm run lint"],
    ["Fix lint",           "npm run lint:fix"],
    ["Format code",        "npm run format"],
    ["Install package",    "npm install pkg-name"],
  ]),

  h2("Git (terminal alternative to GitHub Desktop)"),
  table2col([
    ["See changed files",   "git status"],
    ["See file diff",       "git diff"],
    ["Stage everything",    "git add ."],
    ["Commit",              "git commit -m \"your message\""],
    ["Push",                "git push"],
    ["Pull",                "git pull"],
    ["View history",        "git log --oneline"],
    ["Create branch",       "git checkout -b feature/name"],
    ["Switch branch",       "git checkout main"],
  ]),

  pgBreak(),

  // ── 9. TROUBLESHOOTING ─────────────────────────────────────────────────
  h1("9.  Troubleshooting"),

  h2("Backend Issues"),

  h3("\"ModuleNotFoundError: No module named 'fastapi'\""),
  p("Your virtual environment is not activated. Run:"),
  code("source venv/bin/activate   # Mac/Linux"),
  code("venv\\Scripts\\activate      # Windows"),
  p("The (venv) prefix in your terminal prompt confirms it is active."),

  sep(),

  h3("\"[Errno 98] Address already in use\" — port 8000"),
  p("Something else is running on port 8000. Either stop that process, or use a different port:"),
  code("uvicorn app.main:app --reload --port 8001"),
  p("Then update frontend/vite.config.ts: change the proxy target from 8000 to 8001."),

  sep(),

  h3("Agents return mock responses instead of live AI output"),
  p("This is expected when ANTHROPIC_API_KEY is missing or empty. The app works fully with smart mock responses. To enable live responses: open backend/.env, paste your Claude API key, then restart the backend server."),

  sep(),

  h2("Frontend Issues"),

  h3("\"npm: command not found\""),
  p("Node.js is not installed or not in PATH. Re-install from https://nodejs.org and restart your terminal completely."),

  sep(),

  h3("Frontend loads but API calls fail (network error)"),
  p("Ensure the backend is running. Check:"),
  bullet("Backend terminal shows 'Uvicorn running on http://127.0.0.1:8000'"),
  bullet("http://localhost:8000/health returns {\"status\": \"ok\"} in your browser"),
  bullet("Frontend dev server is on port 5173 (not a different port)"),

  sep(),

  h3("TypeScript errors in the editor"),
  p("TypeScript errors in the editor are caught at build time and don't prevent the dev server from running. Run npm run type-check to see all errors. Fix them before committing to keep CI green."),

  sep(),

  h2("GitHub Desktop Issues"),

  h3("\"Authentication failed\" when pushing"),
  p("Re-authenticate: GitHub Desktop → Preferences → Accounts → sign out → sign back in with your GitHub credentials."),

  sep(),

  h3("Merge conflict when pulling"),
  p("Happens when the same file was edited both locally and on GitHub. GitHub Desktop highlights conflicted files in red. Open them in your editor, look for <<<< ==== >>>> markers, manually choose which version to keep, save, then stage and commit the resolved file."),

  pgBreak(),

  // ── 10. FILE REFERENCE ─────────────────────────────────────────────────
  h1("10.  Complete File Reference"),

  h2("Backend Files"),
  table2col([
    ["app/main.py",                   "FastAPI app factory — middleware, routers, lifecycle"],
    ["app/core/config.py",            "All settings via Pydantic Settings — reads .env"],
    ["app/core/database.py",          "Async SQLAlchemy engine + session factory"],
    ["app/core/logging.py",           "Structured logging via structlog"],
    ["app/models/decision.py",        "SQLAlchemy ORM: Decision, AgentRun, ActivityLog"],
    ["app/schemas/decision.py",       "Pydantic v2 validation + SSEEvent serialization"],
    ["app/agents/orchestrator.py",    "6-agent AI pipeline — the core intelligence engine"],
    ["app/services/decision_service.py", "Business logic — DB operations + pipeline orchestration"],
    ["app/api/v1/decisions.py",       "HTTP route handlers (thin layer over service)"],
    ["tests/test_decisions.py",       "Integration tests for all API endpoints"],
    [".env.example",                  "Template for .env — safe to commit, no secrets"],
    ["requirements.txt",              "Python package dependencies"],
    ["pyproject.toml",                "Tool config: ruff, black, pytest"],
  ]),

  h2("Frontend Files"),
  table2col([
    ["src/main.tsx",                  "React entry point — providers, router, toaster"],
    ["src/index.css",                 "Global styles + Tailwind directives + CSS variables"],
    ["src/types/index.ts",            "All TypeScript interfaces, AGENT_DEFS, examples"],
    ["src/lib/api.ts",                "Typed Axios client — all HTTP and SSE calls"],
    ["src/lib/utils.ts",              "cn(), timeAgo(), status colors, verdict helpers"],
    ["src/stores/useAppStore.ts",     "Zustand: agent states, live log, progress, running flag"],
    ["src/hooks/useDecisions.ts",     "React Query hooks — list, get, create, delete, stats"],
    ["src/hooks/useAnalysisStream.ts","SSE streaming hook — EventSource lifecycle"],
    ["src/pages/WorkspacePage.tsx",   "Main 3-column workspace: pipeline + output + history"],
    ["src/pages/NewDecisionPage.tsx", "Decision submission form page"],
    ["src/pages/HistoryPage.tsx",     "Decision archive page"],
    ["src/components/layout/Header.tsx",              "Sticky nav header with live status"],
    ["src/components/decisions/AgentPipeline.tsx",    "6-agent live status panel"],
    ["src/components/decisions/AnalysisOutput.tsx",   "Streaming results + recommendation banner"],
    ["src/components/decisions/ActivityLog.tsx",      "Terminal-style activity log"],
    ["src/components/decisions/NewDecisionForm.tsx",  "Decision form + example loader"],
    ["src/components/decisions/DecisionHistory.tsx",  "Sidebar history list with delete"],
    ["src/components/dashboard/StatsBar.tsx",         "Platform metrics strip"],
    ["tailwind.config.ts",            "Custom design tokens: colors, fonts, animations"],
    ["vite.config.ts",                "Vite config + /api proxy to backend"],
    ["tsconfig.json",                 "TypeScript compiler options"],
  ]),

  pgBreak(),

  // ── 11. NEXT STEPS ─────────────────────────────────────────────────────
  h1("11.  Next Steps"),

  h3("Production Deployment"),
  bullet("Frontend: connect your GitHub repo to Vercel (vercel.com) — free tier, auto-deploys on every push to main"),
  bullet("Backend: deploy to Railway (railway.app) or Render (render.com) — both have free tiers"),
  bullet("Database: upgrade to Supabase (supabase.com) — hosted PostgreSQL, free tier available"),
  bullet("Secrets: set ANTHROPIC_API_KEY as an environment variable in your hosting platform — never in code"),

  h3("Feature Extensions"),
  bullet("Add user authentication — the DB schema supports a users table, JWT auth skeleton is ready"),
  bullet("Add web search to Oracle agent for real-time market data (Anthropic tool use)"),
  bullet("PDF export of full analysis report"),
  bullet("Email / Slack notification when analysis completes"),
  bullet("Side-by-side comparison view for multiple decisions"),

  h3("AI Improvements"),
  bullet("Fine-tune agent system prompts for your specific industry domain"),
  bullet("Add streaming token output (character-by-character) instead of full-message SSE"),
  bullet("Build a feedback loop where verdict ratings improve future prompts"),

  sep(),

  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 480 },
    children: [
      new TextRun({ text: "HexTech  ·  StratosAI  ·  Hackanova 5.0", size: 18, color: "7A8AA0" }),
    ],
  }),
];

// ── Build & write ──────────────────────────────────────────────────────────

const doc = new Document({
  title: "StratosAI — Complete Setup & GitHub Desktop Guide",
  creator: "StratosAI",
  styles: {
    default: {
      document: {
        run: { font: "Calibri", size: 20, color: "333333" },
        paragraph: { spacing: { line: 280 } },
      },
    },
  },
  sections: [{
    properties: {
      page: {
        size: { width: 12240, height: 15840 },
        margin: { top: 1080, bottom: 1080, left: 1080, right: 1080 },
      },
    },
    children,
  }],
});

Packer.toBuffer(doc).then((buf) => {
  fs.writeFileSync("/mnt/user-data/outputs/StratosAI_Setup_Guide.docx", buf);
  console.log("✓ StratosAI_Setup_Guide.docx written");
});
