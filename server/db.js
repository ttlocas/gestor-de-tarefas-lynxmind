// server/db.js
const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const dbPath = path.resolve(__dirname, "database.db");

// abre (ou cria) o ficheiro database.db
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error("Erro ao abrir o banco de dados:", err.message);
  } else {
    console.log("Base de dados SQLite conectada em", dbPath);
  }
});

// cria tabela se não existir
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      status TEXT NOT NULL,
      priority TEXT NOT NULL,
      due_date TEXT
    )
  `);
});

module.exports = db;
