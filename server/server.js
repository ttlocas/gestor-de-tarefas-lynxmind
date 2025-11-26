// server/server.js
const express = require("express");
const cors = require("cors");
const db = require("./db");

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// GET todas as tarefas
app.get("/tasks", (req, res) => {
  db.all("SELECT * FROM tasks", [], (err, rows) => {
    if (err) {
      console.error("Erro ao buscar tarefas:", err);
      return res.status(500).json({ error: "Erro ao buscar tarefas" });
    }

    // ajustar chaves para o formato que o frontend espera
    const tasks = rows.map((row) => ({
      id: row.id,
      title: row.title,
      desc: row.description,
      status: row.status,
      priority: row.priority,
      dueDate: row.due_date
    }));

    res.json(tasks);
  });
});

// POST criar nova tarefa
app.post("/tasks", (req, res) => {
  const { title, desc, status, priority, dueDate } = req.body;

  if (!title || !status || !priority) {
    return res.status(400).json({ error: "Campos obrigatórios em falta" });
  }

  const sql = `
    INSERT INTO tasks (title, description, status, priority, due_date)
    VALUES (?, ?, ?, ?, ?)
  `;
  db.run(
    sql,
    [title, desc || "", status, priority, dueDate || null],
    function (err) {
      if (err) {
        console.error("Erro ao criar tarefa:", err);
        return res.status(500).json({ error: "Erro ao criar tarefa" });
      }

      res.status(201).json({
        id: this.lastID,
        title,
        desc: desc || "",
        status,
        priority,
        dueDate: dueDate || null
      });
    }
  );
});

// PUT atualizar status (pode ser expandido depois)
app.put("/tasks/:id", (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!status) {
    return res.status(400).json({ error: "Status é obrigatório" });
  }

  const sql = `UPDATE tasks SET status = ? WHERE id = ?`;
  db.run(sql, [status, id], function (err) {
    if (err) {
      console.error("Erro ao atualizar tarefa:", err);
      return res.status(500).json({ error: "Erro ao atualizar tarefa" });
    }
    res.json({ success: true });
  });
});

// DELETE apagar tarefa
app.delete("/tasks/:id", (req, res) => {
  const { id } = req.params;

  const sql = `DELETE FROM tasks WHERE id = ?`;
  db.run(sql, [id], function (err) {
    if (err) {
      console.error("Erro ao apagar tarefa:", err);
      return res.status(500).json({ error: "Erro ao apagar tarefa" });
    }
    res.json({ success: true });
  });
});

app.listen(PORT, () => {
  console.log(`Servidor a rodar em http://localhost:${PORT}`);
});
