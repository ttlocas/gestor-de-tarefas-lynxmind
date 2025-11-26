import React, { useState, useEffect } from "react";

const STATUS_OPTIONS = [
  { value: "pendente", label: "Pendente" },
  { value: "em_progresso", label: "Em progresso" },
  { value: "concluida", label: "Concluída" }
];

const API_URL = "http://localhost:3001";

function App() {
  const [tasks, setTasks] = useState([]);
  const [filterStatus, setFilterStatus] = useState("todas");
  const [loading, setLoading] = useState(true);

  // carregar tarefas da API
  useEffect(() => {
    async function fetchTasks() {
      try {
        const res = await fetch(`${API_URL}/tasks`);
        const data = await res.json();
        setTasks(data);
      } catch (err) {
        console.error("Erro ao carregar tarefas:", err);
        alert("Erro ao carregar tarefas do servidor.");
      } finally {
        setLoading(false);
      }
    }

    fetchTasks();
  }, []);

  async function handleAddTask(newTask) {
    try {
      const res = await fetch(`${API_URL}/tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newTask)
      });

      if (!res.ok) {
        throw new Error("Erro ao criar tarefa");
      }

      const created = await res.json();
      setTasks((prev) => [...prev, created]);
    } catch (err) {
      console.error(err);
      alert("Erro ao criar tarefa na base de dados.");
    }
  }

  async function handleToggleStatus(id) {
    const task = tasks.find((t) => t.id === id);
    if (!task) return;

    const newStatus =
      task.status === "concluida" ? "pendente" : "concluida";

    try {
      const res = await fetch(`${API_URL}/tasks/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus })
      });

      if (!res.ok) throw new Error("Erro ao atualizar tarefa");

      setTasks((prev) =>
        prev.map((t) =>
          t.id === id ? { ...t, status: newStatus } : t
        )
      );
    } catch (err) {
      console.error(err);
      alert("Erro ao atualizar tarefa na base de dados.");
    }
  }

  async function handleDelete(id) {
    if (!confirm("Tens a certeza que queres apagar esta tarefa?")) return;

    try {
      const res = await fetch(`${API_URL}/tasks/${id}`, {
        method: "DELETE"
      });

      if (!res.ok) throw new Error("Erro ao apagar tarefa");

      setTasks((prev) => prev.filter((t) => t.id !== id));
    } catch (err) {
      console.error(err);
      alert("Erro ao apagar tarefa na base de dados.");
    }
  }

  const filteredTasks =
    filterStatus === "todas"
      ? tasks
      : tasks.filter((t) => t.status === filterStatus);

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="logo-area">
          <svg
            className="logo"
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle cx="50" cy="50" r="45" stroke="#00D5A5" strokeWidth="6" />
            <path
              d="M30 60 C40 30, 60 30, 70 60"
              stroke="#38BDF8"
              strokeWidth="6"
              strokeLinecap="round"
            />
            <circle cx="40" cy="50" r="5" fill="#00D5A5" />
            <circle cx="60" cy="50" r="5" fill="#00D5A5" />
          </svg>

          <h1 className="gradient-title">
            Lynxmind · Portal de Gestão de Tarefas
          </h1>
        </div>

        <p>Organiza as tuas tarefas e projetos como um verdadeiro Lynx 🐾</p>
      </header>

      <main className="app-main">
        <section className="card">
          <h2>Criar nova tarefa</h2>
          <TaskForm onAddTask={handleAddTask} />
        </section>

        <section className="card">
          <div className="list-header">
            <h2>Minhas tarefas</h2>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="todas">Todas</option>
              <option value="pendente">Pendentes</option>
              <option value="em_progresso">Em progresso</option>
              <option value="concluida">Concluídas</option>
            </select>
          </div>

          {loading ? (
            <p className="empty">A carregar tarefas...</p>
          ) : filteredTasks.length === 0 ? (
            <p className="empty">Nenhuma tarefa por aqui ainda… 😴</p>
          ) : (
            <ul className="task-list">
              {filteredTasks.map((task) => (
                <TaskItem
                  key={task.id}
                  task={task}
                  onToggleStatus={handleToggleStatus}
                  onDelete={handleDelete}
                />
              ))}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
}

function TaskForm({ onAddTask }) {
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [status, setStatus] = useState("pendente");
  const [priority, setPriority] = useState("media");
  const [dueDate, setDueDate] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    if (!title.trim()) {
      alert("O título é obrigatório.");
      return;
    }

    onAddTask({
      title: title.trim(),
      desc: desc.trim(),
      status,
      priority,
      dueDate: dueDate || null
    });

    setTitle("");
    setDesc("");
    setStatus("pendente");
    setPriority("media");
    setDueDate("");
  }

  return (
    <form className="task-form" onSubmit={handleSubmit}>
      <div className="form-row">
        <label>Título *</label>
        <input
          type="text"
          placeholder="Ex: Estudar React"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>

      <div className="form-row">
        <label>Descrição</label>
        <textarea
          placeholder="Detalhes da tarefa (opcional)"
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
        />
      </div>

      <div className="form-grid">
        <div className="form-row">
          <label>Estado</label>
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div className="form-row">
          <label>Prioridade</label>
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
          >
            <option value="baixa">Baixa</option>
            <option value="media">Média</option>
            <option value="alta">Alta</option>
          </select>
        </div>

        <div className="form-row date-field">
          <label>Data limite</label>
          <div className="date-wrapper">
            <input
              id="dateInput"
              type="date"
              value={dueDate || ""}
              onChange={(e) => setDueDate(e.target.value)}
            />
            <button
              type="button"
              className="date-button"
              onClick={() =>
                document.getElementById("dateInput").showPicker?.()
              }
            >
              📅
            </button>
          </div>
        </div>
      </div>

      <button type="submit" className="btn-primary">
        Adicionar tarefa
      </button>
    </form>
  );
}

function TaskItem({ task, onToggleStatus, onDelete }) {
  const statusLabel =
    STATUS_OPTIONS.find((s) => s.value === task.status)?.label ||
    task.status;

  return (
    <li className={`task-item ${task.status}`}>
      <div className="task-main">
        <h3>{task.title}</h3>
        {task.desc && <p className="task-desc">{task.desc}</p>}

        <div className="task-meta">
          <span className={`pill priority-${task.priority}`}>
            Prioridade: {task.priority}
          </span>

          <span className="pill">
            Estado: <strong>{statusLabel}</strong>
          </span>

          {task.dueDate && (
            <span className="pill">Prazo: {task.dueDate}</span>
          )}
        </div>
      </div>

      <div className="task-actions">
        <button
          onClick={() => onToggleStatus(task.id)}
          className="btn-secondary"
        >
          {task.status === "concluida"
            ? "Marcar como pendente"
            : "Marcar como concluída"}
        </button>

        <button onClick={() => onDelete(task.id)} className="btn-danger">
          Apagar
        </button>
      </div>
    </li>
  );
}

export default App;
