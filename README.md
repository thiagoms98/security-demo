# Security (projeto de exemplo)

> Aplicação de demonstração para tópicos de segurança web: injeção de SQL e sequestro de sessão.

Status: protótipo educacional — NÃO usar em produção sem melhorias de segurança.

## Estrutura

- [app.js](app.js) — servidor Express demonstrando cenários vulneráveis e seguros.
- [package.json](package.json) — dependências e script de inicialização.
- [public/index.html](public/index.html) — conteúdo estático servido pelo app.

## Requisitos

- Node.js (versão 14+ recomendada)

## Instalação

1. Instale dependências:

```bash
npm install
```

2. Inicie a aplicação:

```bash
npm start
# ou
node app.js
```

A aplicação roda por padrão em `http://localhost:3000`.

## Endpoints principais

- `POST /login-vulneravel` — Rota propositalmente vulnerável a SQL Injection.
  - Corpo (JSON): `{ "username": "...", "password": "..." }`
  - Não use dados reais aqui; é apenas para demonstração.

- `POST /login-seguro` — Exemplo de rota com consulta parametrizada e regeneração de sessão.
  - Corpo (JSON): `{ "username": "...", "password": "..." }`

- `GET /perfil` — Retorna informação do usuário se a sessão estiver ativa.

- `GET /logout` — Encerra a sessão atual.

Exemplo de teste com curl (login seguro):

```bash
curl -X POST http://localhost:3000/login-seguro \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"senha123"}'
```

## Observações de segurança (melhorias recomendadas)

- Não armazene senhas em texto plano: use hashing seguro (bcrypt/argon2) e salt.
- Não comite segredos no código: mova `secret` da sessão para variável de ambiente.
- Ative `cookie.secure: true` em ambientes com HTTPS (produção).
- Use uma store de sessão persistente (Redis, DB) em vez de memória.
- Valide e sanitize toda entrada do usuário e utilize consultas parametrizadas (já demonstrado em `/login-seguro`).
- Adicione cabeçalhos de segurança com `helmet` e configure CORS apropriadamente.
- Substitua o banco em memória por um banco persistente para cenários reais.

## Para estudos e exercícios

- Experimente enviar payloads de SQL Injection para `/login-vulneravel` e observe o comportamento.
- Implemente hashing de senhas e verifique como isso muda as rotas de autenticação.

## Licença

Projeto de exemplo para fins educacionais.
