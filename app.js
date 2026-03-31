const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const session = require("express-session");

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Configuração de Sessão Segura (Mitigação para Sequestro de Sessão)
// Uso de cookies seguros e controle adequado.
app.use(
  session({
    secret: "chave-super-secreta",
    resave: false,
    saveUninitialized: true,
    cookie: {
      httpOnly: true, // Impede acesso via JavaScript (XSS)
      secure: false, // Em produção no Azure com HTTPS, mude para 'true'
      maxAge: 3600000, // Política de expiração de sessão
    },
  }),
);

// Serve os arquivos estáticos da pasta 'public'
app.use(express.static("public"));

// Banco de Dados em Memória para o teste
const db = new sqlite3.Database(":memory:");
db.serialize(() => {
  db.run("CREATE TABLE users (id INT, username TEXT, password TEXT)");
  db.run(
    "INSERT INTO users (id, username, password) VALUES (1, 'admin', 'senha123')",
  );
});

// ==========================================
// CENÁRIO 1: ATAQUE DE INJEÇÃO (SQL Injection)
// ==========================================

// ROTA VULNERÁVEL: Demonstra o risco de enviar dados não confiáveis diretamente para o interpretador.
app.post("/login-vulneravel", (req, res) => {
  const { username, password } = req.body;
  // Falha: Concatenação direta de strings. Um invasor pode manipular a consulta.
  // Exemplo de payload no campo username: admin' OR '1'='1
  const query = `SELECT * FROM users WHERE username = '${username}' AND password = '${password}'`;

  db.get(query, (err, row) => {
    if (row) {
      res.send(`Login efetuado com sucesso! Bem-vindo, ${row.username}.`);
    } else {
      res.send("Falha no login.");
    }
  });
});

// ROTA SEGURA (Security by Design): Validação e tratamento adequado.
app.post("/login-seguro", (req, res) => {
  const { username, password } = req.body;
  // Mitigação: Uso de consultas parametrizadas.
  const query = `SELECT * FROM users WHERE username = ? AND password = ?`;

  db.get(query, [username, password], (err, row) => {
    if (row) {
      // Mitigação adicional: Regeneração do identificador de sessão após autenticação.
      req.session.regenerate((err) => {
        req.session.user = row.username;
        res.send(
          `Login seguro efetuado! Bem-vindo, ${row.username}. Sessão regenerada.`,
        );
      });
    } else {
      res.send("Falha no login.");
    }
  });
});

// ==========================================
// CENÁRIO 2: SEQUESTRO DE SESSÃO
// ==========================================

// Rota para verificar a sessão atual
app.get("/perfil", (req, res) => {
  if (req.session.user) {
    // Se um invasor obteve o identificador de sessão, ele consegue acessar essa área.
    res.send(`Área logada. Usuário logado: ${req.session.user}`);
  } else {
    res.status(401).send("Acesso não autorizado. Faça login primeiro.");
  }
});

// Rota para destruir a sessão (Logout)
app.get("/logout", (req, res) => {
  req.session.destroy();
  res.send("Sessão encerrada com sucesso.");
});

module.exports = app;