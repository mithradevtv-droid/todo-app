const express = require("express");
const cors = require("cors");
const Database = require("better-sqlite3");
const path = require("path");

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// Init SQLite DB
const db = new Database(path.join(__dirname, "todos.db"));
db.exec(`
  CREATE TABLE IF NOT EXISTS todos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    text TEXT NOT NULL,
    completed BOOLEAN DEFAULT 0,
    priority TEXT DEFAULT 'medium',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// GET all todos
app.get("/api/todos", (req, res) => {
  const todos = db.prepare("SELECT * FROM todos ORDER BY created_at DESC").all();
  res.json(todos);
});

// POST create todo
app.post("/api/todos", (req, res) => {
  const { text, priority = "medium" } = req.body;
  if (!text?.trim()) return res.status(400).json({ error: "Text required" });
  const stmt = db.prepare("INSERT INTO todos (text, priority) VALUES (?, ?)");
  const result = stmt.run(text.trim(), priority);
  const todo = db.prepare("SELECT * FROM todos WHERE id = ?").get(result.lastInsertRowid);
  res.status(201).json(todo);
});

// PATCH update todo
app.patch("/api/todos/:id", (req, res) => {
  const { id } = req.params;
  const { text, completed, priority } = req.body;
  const todo = db.prepare("SELECT * FROM todos WHERE id = ?").get(id);
  if (!todo) return res.status(404).json({ error: "Not found" });

  const updated = db
    .prepare("UPDATE todos SET text = ?, completed = ?, priority = ? WHERE id = ?")
    .run(
      text ?? todo.text,
      completed !== undefined ? (completed ? 1 : 0) : todo.completed,
      priority ?? todo.priority,
      id
    );

  const result = db.prepare("SELECT * FROM todos WHERE id = ?").get(id);
  res.json(result);
});

// DELETE todo
app.delete("/api/todos/:id", (req, res) => {
  const { id } = req.params;
  db.prepare("DELETE FROM todos WHERE id = ?").run(id);
  res.json({ success: true });
});

// DELETE all completed
app.delete("/api/todos/completed/all", (req, res) => {
  db.prepare("DELETE FROM todos WHERE completed = 1").run();
  res.json({ success: true });
});

app.listen(PORT, () => console.log(`✅ Server running on http://localhost:${PORT}`));
