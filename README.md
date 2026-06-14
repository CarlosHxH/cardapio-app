# Tempero Cuiabano — Supabase 🍽️

Versão com **Supabase** (PostgreSQL + Auth + Realtime).  
Pedidos chegam **instantaneamente** no painel sem precisar recarregar.

## Stack
- **React 18 + TypeScript + Vite + Tailwind CSS**
- **Supabase** — banco PostgreSQL, autenticação, Realtime via WebSocket

---

## 1. Criar projeto no Supabase

1. Acesse [supabase.com](https://supabase.com) e clique em **Start your project**
2. Crie uma organização e um projeto
3. Escolha a região **South America (São Paulo)** para menor latência
4. Aguarde o projeto ficar pronto (~2 min)

---

## 2. Configurar o banco de dados

1. No menu lateral, vá em **SQL Editor**
2. Clique em **New query**
3. Cole o conteúdo do arquivo **`supabase/setup.sql`** (incluso no projeto)
4. Clique em **Run** (▶)

Isso vai criar:
- Tabelas `cardapio` e `pedidos`
- Regras de segurança (RLS) — clientes só podem criar pedidos; só admin lê tudo
- Realtime habilitado na tabela `pedidos`
- Cardápio padrão já inserido

---

## 3. Criar o usuário admin

1. No menu lateral, vá em **Authentication → Users**
2. Clique em **Add user → Create new user**
3. Preencha:
   - E-mail: `admin@tempero.com` (ou o que preferir)
   - Senha: escolha uma senha segura
4. Clique em **Create User**

---

## 4. Obter as credenciais da API

1. Vá em **Settings → API**
2. Copie:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon public** (em Project API Keys) → `VITE_SUPABASE_ANON_KEY`

---

## 5. Configurar o .env

```bash
cp .env.example .env
```

Preencha o arquivo `.env`:
```env
VITE_SUPABASE_URL=https://xxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 6. Instalar e rodar

```bash
npm install
npm run dev
```

Acesse:
- **`http://localhost:5173`** — Cardápio (clientes)
- **`http://localhost:5173/login`** — Login admin
- **`http://localhost:5173/admin`** — Painel admin

---

## Deploy (Vercel / Netlify)

```bash
npm run build
# Publique a pasta dist/
```

No painel do Vercel/Netlify, adicione as variáveis de ambiente:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

---

## Diferencial: Realtime 🟢

Quando um cliente envia um pedido, ele aparece **instantaneamente** no painel do admin com um banner laranja "🔔 Novo pedido!" sem precisar recarregar a página.

O indicador **"Ao vivo"** no topo da aba Pedidos mostra se a conexão Realtime está ativa.

---

## Estrutura

```
cardapio-supabase/
├── src/
│   ├── lib/
│   │   ├── supabase.ts   # cliente Supabase
│   │   └── utils.ts      # formatadores + parser
│   ├── hooks/
│   │   ├── useAuth.tsx   # Supabase Auth
│   │   ├── useCardapio.ts
│   │   └── usePedidos.ts # Realtime aqui!
│   ├── pages/
│   │   ├── ClientePage.tsx
│   │   ├── AdminPage.tsx
│   │   └── LoginPage.tsx
│   └── types/index.ts
├── supabase/
│   └── setup.sql         # ← Cole este no SQL Editor do Supabase
├── .env.example
└── README.md
```

---

## Comparativo das versões

| Recurso | Firebase | SQLite | **Supabase** |
|---------|----------|--------|--------------|
| Pedidos em tempo real | ✅ WebSocket | ⏱ Polling 15s | ✅ WebSocket |
| Banco de dados | Firestore (NoSQL) | SQLite (arquivo) | **PostgreSQL** |
| Auth | Firebase Auth | JWT próprio | **Supabase Auth** |
| Hospedagem necessária | Não | Sim | Não |
| Plano gratuito | Sim (com limites) | — | **Sim (generoso)** |
| SQL nativo | Não | Sim | **Sim** |
