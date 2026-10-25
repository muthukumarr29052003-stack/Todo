import { useEffect, useState } from "react";

const API_URL = "http://localhost:5000/api/tasks";

function App() {
  const [tasks, setTasks] = useState([]);
  const [taskText, setTaskText] = useState("");
  const [filter, setFilter] = useState("all");
  const [error, setError] = useState("");

  useEffect(() => {
    loadTasks();
  }, []);

  async function loadTasks() {
    try {
      const res = await fetch(API_URL);
      if (!res.ok) throw new Error("Failed to load");
      const data = await res.json();
      setTasks(data);
      setError("");
    } catch {
      setError("Could not load tasks. Is the server running?");
    }
  }

  async function addTask() {
    const text = taskText.trim();
    if (text === "") return;

    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      if (!res.ok) throw new Error("Failed to add");
      const newTask = await res.json();
      setTasks([...tasks, newTask]);
      setTaskText("");
      setError("");
    } catch {
      setError("Could not add the task.");
    }
  }

  async function toggleTask(task) {
    try {
      const res = await fetch(`${API_URL}/${task.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed: !task.completed }),
      });
      if (!res.ok) throw new Error("Failed to update");
      const updated = await res.json();
      setTasks(tasks.map((t) => (t.id === updated.id ? updated : t)));
    } catch {
      setError("Could not update the task.");
    }
  }

  async function deleteTask(id) {
    try {
      const res = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      setTasks(tasks.filter((t) => t.id !== id));
    } catch {
      setError("Could not delete the task.");
    }
  }

  async function clearCompleted() {
    try {
      const res = await fetch(`${API_URL}/completed`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to clear");
      setTasks(tasks.filter((t) => !t.completed));
    } catch {
      setError("Could not clear completed tasks.");
    }
  }

  const visibleTasks = tasks.filter((task) => {
    if (filter === "active") return !task.completed;
    if (filter === "completed") return task.completed;
    return true;
  });

  const remaining = tasks.filter((t) => !t.completed).length;

  return (
    <main className="todo-app">
      <header className="app-header">
        <h1>My Tasks</h1>
        
      </header>

      {error && <p className="empty-message">{error}</p>}

      <section className="section">
        <h2>Add a Task</h2>
        <div className="task-form">
          <input
            type="text"
            placeholder="Enter a new task..."
            aria-label="New task description"
            value={taskText}
            onChange={(e) => setTaskText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addTask()}
          />
          <button type="button" onClick={addTask}>
            Add
          </button>
        </div>
      </section>

      <section className="section">
        <h2>Filter Tasks</h2>
        <div className="task-filters" role="group" aria-label="Filter tasks">
          {["all", "active", "completed"].map((name) => (
            <button
              key={name}
              type="button"
              aria-pressed={filter === name}
              onClick={() => setFilter(name)}
            >
              {name.charAt(0).toUpperCase() + name.slice(1)}
            </button>
          ))}
        </div>
      </section>

      <section className="section">
        <h2>My Task List</h2>
        <ul id="taskList">
          {visibleTasks.map((task) => (
            <li
              key={task.id}
              className={`task-item ${task.completed ? "completed" : ""}`}
            >
              <input
                type="checkbox"
                aria-label="Mark task as completed"
                checked={task.completed}
                onChange={() => toggleTask(task)}
              />
              <span>{task.text}</span>
              <button type="button" onClick={() => deleteTask(task.id)}>
                Delete
              </button>
            </li>
          ))}
        </ul>
        {visibleTasks.length === 0 && (
          <p className="empty-message">
            {tasks.length === 0
              ? "No tasks yet. Add your first task above!"
              : "No tasks in this filter."}
          </p>
        )}
      </section>

      <footer className="app-footer">
        <p>
          {remaining} {remaining === 1 ? "task" : "tasks"} remaining
        </p>
        <button type="button" onClick={clearCompleted}>
          Clear completed
        </button>
      </footer>
    </main>
  );
}

export default App;