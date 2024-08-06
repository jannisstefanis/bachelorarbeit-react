import { useState } from "react";
import "./App.css";
import { useEffect } from "react";

function App() {
  const [todos, setTodos] = useState([]);

  const [description, setDescription] = useState("");
  const [dueAt, setDueAt] = useState(null);

  const staleTime = 1000 * 60 * 5;

  async function loadTodos() {
    const todos = localStorage.getItem("todos");

    if (todos) {
      const { data, timestamp } = JSON.parse(todos);

      if (Date.now() - timestamp < staleTime) {
        setTodos(data);
        return;
      }
    } else {
      const response = await fetch("http://localhost:3002/todo");
      const data = await response.json();

      setTodos(data);

      localStorage.setItem(
        "todos",
        JSON.stringify({ data, timestamp: Date.now() })
      );
    }
  }

  useEffect(() => {
    loadTodos();

    const interval = setInterval(() => {
      loadTodos();
    }, staleTime);

    return () => {
      clearInterval(interval);
    };
  }, []);

  const [error, setError] = useState("");

  async function createTodo() {
    setError("");

    try {
      await fetch("http://localhost:3002/todo", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          description,
          dueAt,
        }),
      });

      setDescription("");
      setDueAt(null);

      localStorage.removeItem("todos");
      loadTodos();
    } catch (err) {
      setError("Failed to create todo");
    }
  }

  async function updateTodo(id) {
    setError("");

    try {
      await fetch(`http://localhost:3002/todo/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          description,
          dueAt,
        }),
      });

      setDescription("");
      setDueAt(null);

      localStorage.removeItem("todos");
      loadTodos();
    } catch (err) {
      setError("Failed to update todo");
    }
  }

  async function removeTodo(id) {
    setError("");

    try {
      await fetch(`http://localhost:3002/todo/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          description,
          dueAt,
        }),
      });

      setDescription("");
      setDueAt(null);

      localStorage.removeItem("todos");
      loadTodos();
    } catch (err) {
      setError("Failed to remove todo");
    }
  }

  return (
    <div className="todo-page">
      <h1>Todos</h1>
      <div className="new-todos">
        <input
          type="text"
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <input
          type="datetime-local"
          placeholder="Due at"
          value={dueAt?.toISOString().slice(0, 16)}
          onChange={(e) => setDueAt(new Date(e.target.value))}
        />
        <button onClick={createTodo} disabled={!description}>
          Create
        </button>
      </div>
      <div className="todo-list">
        {todos.map((todo) => (
          <div key={todo.id} className="todo-item">
            <div className="todo-properties">
              <div
                className={`todo-property ${todo.isDone ? "done" : "active"}`}
              >
                {todo.isDone ? "Done" : "Todo"}
              </div>
              {todo.dueAt && (
                <div className="todo-property">
                  {new Date(todo.dueAt)?.toLocaleDateString()}
                </div>
              )}
            </div>
            <p className="todo-description">{todo.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
