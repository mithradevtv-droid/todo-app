# ◈ TASKR — Full Stack Todo App

A sleek, production-grade todo app with a React frontend and Node/Express + SQLite backend.

## Tech Stack
| Layer | Tech |
|---|---|
| Frontend | React 18, CSS Variables, Google Fonts |
| Backend | Node.js, Express 4 |
| Database | SQLite (via better-sqlite3) |

## Features
- ✅ Create, complete, delete, and **edit** (double-click) tasks
- 🎯 Priority levels: HIGH / MED / LOW (color-coded)
- 🔍 Filter: All / Active / Done
- 🧹 Clear all completed tasks
- 💾 Persisted to SQLite database
- ⌨️ Keyboard shortcuts (Enter to add, Escape to cancel edit)

## Project Structure
```
todo-app/
├── backend/
│   ├── server.js       # Express API
│   ├── todos.db        # SQLite database (auto-created)
│   └── package.json
└── frontend/
    ├── src/
    │   ├── App.js      # Main React component
    │   ├── App.css     # Styles
    │   └── index.js    # Entry point
    └── package.json
```

## Setup & Run

### 1. Start the Backend
```bash
cd backend
npm install
node server.js
# ✅ Server running on http://localhost:3001
```

### 2. Start the Frontend (new terminal)
```bash
cd frontend
npm install
npm start
# Opens http://localhost:3000
```

## API Endpoints
| Method | Route | Description |
|---|---|---|
| GET | `/api/todos` | Get all todos |
| POST | `/api/todos` | Create a todo `{ text, priority }` |
| PATCH | `/api/todos/:id` | Update todo `{ text?, completed?, priority? }` |
| DELETE | `/api/todos/:id` | Delete a todo |
| DELETE | `/api/todos/completed/all` | Delete all completed todos |
