import { useState, useEffect, useCallback } from "react";
import "./App.css";

const API = "https://todo-app-be23.onrender.com/api/todos";

const PRIORITY_CONFIG = {
  high:   { label: "HIGH",   color: "#ff4444", dot: "#ff4444" },
  medium: { label: "MED",    color: "#ffaa00", dot: "#ffaa00" },
  low:    { label: "LOW",    color: "#44cc88", dot: "#44cc88" },
};

function TodoItem({ todo, onToggle, onDelete, onEdit }) {
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState(todo.text);
  const p = PRIORITY_CONFIG[todo.priority];

  const submit = () => {
    if (editText.trim()) onEdit(todo.id, editText.trim());
    setEditing(false);
  };

  return (
    <div className={`todo-item ${todo.completed ? "done" : ""}`} style={{ "--p-color": p.color }}>
      <button className="check-btn" onClick={() => onToggle(todo.id, !todo.completed)}>
        <span className="check-inner">{todo.completed && "✓"}</span>
      </button>

      <div className="todo-body">
        {editing ? (
          <input
            className="edit-input"
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            onBlur={submit}
            onKeyDown={(e) => { if (e.key === "Enter") submit(); if (e.key === "Escape") setEditing(false); }}
            autoFocus
          />
        ) : (
          <span className="todo-text" onDoubleClick={() => !todo.completed && setEditing(true)}>
            {todo.text}
          </span>
        )}
        <span className="priority-badge">{p.label}</span>
      </div>

      <button className="del-btn" onClick={() => onDelete(todo.id)}>×</button>
    </div>
  );
}

export default function App() {
  const [todos, setTodos] = useState([]);
  const [input, setInput] = useState("");
  const [priority, setPriority] = useState("medium");
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  const fetchTodos = useCallback(async () => {
    try {
      const res = await fetch(API);
      const data = await res.json();
      setTodos(data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchTodos(); }, [fetchTodos]);

  const addTodo = async () => {
    if (!input.trim()) return;
    const res = await fetch(API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: input, priority }),
    });
    const todo = await res.json();
    setTodos((prev) => [todo, ...prev]);
    setInput("");
  };

  const toggleTodo = async (id, completed) => {
    const res = await fetch(`${API}/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ completed }),
    });
    const updated = await res.json();
    setTodos((prev) => prev.map((t) => (t.id === id ? updated : t)));
  };

  const deleteTodo = async (id) => {
    await fetch(`${API}/${id}`, { method: "DELETE" });
    setTodos((prev) => prev.filter((t) => t.id !== id));
  };

  const editTodo = async (id, text) => {
    const res = await fetch(`${API}/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });
    const updated = await res.json();
    setTodos((prev) => prev.map((t) => (t.id === id ? updated : t)));
  };

  const clearCompleted = async () => {
    await fetch(`${API}/completed/all`, { method: "DELETE" });
    setTodos((prev) => prev.filter((t) => !t.completed));
  };

  const filtered = todos.filter((t) => {
    if (filter === "active") return !t.completed;
    if (filter === "done") return t.completed;
    return true;
  });

  const activeCount = todos.filter((t) => !t.completed).length;
  const doneCount = todos.filter((t) => t.completed).length;

  return (
    <div className="app">
      <div className="bg-grid" />

      <header className="header">
        <div className="logo">
          <span className="logo-mark">◈</span>
          <h1>TASKR</h1>
        </div>
        <div className="stats">
          <span className="stat"><b>{activeCount}</b> pending</span>
          <span className="stat-divider">·</span>
          <span className="stat"><b>{doneCount}</b> done</span>
        </div>
      </header>

      <main className="main">
        {/* Add todo */}
        <div className="add-section">
          <div className="priority-pills">
            {Object.entries(PRIORITY_CONFIG).map(([key, cfg]) => (
              <button
                key={key}
                className={`pill ${priority === key ? "active" : ""}`}
                style={{ "--p": cfg.color }}
                onClick={() => setPriority(key)}
              >
                <span className="pill-dot" />
                {cfg.label}
              </button>
            ))}
          </div>
          <div className="input-row">
            <input
              className="main-input"
              placeholder="What needs to be done?"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addTodo()}
            />
            <button className="add-btn" onClick={addTodo}>
              <span>ADD</span>
            </button>
          </div>
        </div>

        {/* Filter tabs */}
        <div className="filter-tabs">
          {["all", "active", "done"].map((f) => (
            <button
              key={f}
              className={`tab ${filter === f ? "active" : ""}`}
              onClick={() => setFilter(f)}
            >
              {f.toUpperCase()}
            </button>
          ))}
          {doneCount > 0 && (
            <button className="clear-btn" onClick={clearCompleted}>
              CLEAR DONE
            </button>
          )}
        </div>

        {/* Todo list */}
        <div className="todo-list">
          {loading && <div className="empty">Loading...</div>}
          {!loading && filtered.length === 0 && (
            <div className="empty">
              {filter === "all" ? "No tasks yet. Add one above." : `No ${filter} tasks.`}
            </div>
          )}
          {filtered.map((todo) => (
            <TodoItem
              key={todo.id}
              todo={todo}
              onToggle={toggleTodo}
              onDelete={deleteTodo}
              onEdit={editTodo}
            />
          ))}
        </div>
      </main>

      <footer className="footer">
        <span>Double-click a task to edit · Press Enter to add</span>
      </footer>
    </div>
  );
}
