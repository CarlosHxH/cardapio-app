# Tempero Cuiabano — Supabase 🍽️

Sistema de pedidos online para restaurante, com cardápio do dia, painel admin em tempo real e página pública de acompanhamento de pedidos.

## Stack

- **React 18 + TypeScript + Vite + Tailwind CSS**
- **Supabase** — PostgreSQL, Auth, Realtime via WebSocket
- **React Router v6** — roteamento SPA
- **Lucide React** — ícones

---

## Rotas

| Rota | Acesso | Descrição |
|---|---|---|
| `/` | Público | Cardápio do dia — cliente monta e envia pedido |
| `/pedidos` | Público | Lista de todos os pedidos do dia com filtro por data |
| `/login` | Público | Login do administrador |
| `/admin` | Admin | Painel completo: pedidos em tempo real, cardápio, configurações |

---

## Setup

### 1. Criar projeto no Supabase

1. Acesse [supabase.com](https://supabase.com) → **Start your project**
2. Crie uma organização e um projeto
3. Região recomendada: **South America (São Paulo)**
4. Aguarde o projeto inicializar (~2 min)

### 2. Configurar o banco de dados

1. Vá em **SQL Editor → New query**
2. Cole o conteúdo de **`supabase/setup.sql`**
3. Clique em **Run**

O script cria:
- Tabelas `cardapio` e `pedidos` com constraints de integridade
- RLS — clientes só inserem; página pública só lê; admin lê, atualiza e deleta
- Realtime habilitado na tabela `pedidos`
- Cardápio padrão inserido como seed

### 3. Criar o usuário admin

1. Vá em **Authentication → Users → Add user → Create new user**
2. Informe e-mail e senha (mínimo recomendado: 12 caracteres com números)
3. Clique em **Create User**

### 4. Obter as credenciais

1. Vá em **Settings → API**
2. Copie:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon public** → `VITE_SUPABASE_ANON_KEY`

### 5. Configurar variáveis de ambiente

```bash
cp .env.example .env
```

```env
VITE_SUPABASE_URL=https://xxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 6. Instalar e rodar

```bash
npm install
npm run dev
```

---

## Deploy (Vercel / Netlify)

```bash
npm run build
# Publique a pasta dist/
```

Adicione as variáveis de ambiente no painel da plataforma:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

---

## Funcionalidades

### Cliente (`/`)
- Visualiza cardápio do dia (1ª e 2ª opção, marmitas, adicionais, bebidas)
- Monta carrinho e envia pedido com nome e setor
- Após envio, link direto para `/pedidos`
- Botão de acesso rápido aos pedidos do dia no header

### Pedidos do dia (`/pedidos`)
- Lista todos os pedidos de todos os clientes
- Filtro por data (padrão: hoje)
- Cards expandíveis com itens e totais
- Sem necessidade de login

### Admin (`/admin`)
- **Pedidos** — lista em tempo real com indicador "Ao vivo", divisão pendente/visto, edição, exclusão, exportação e impressão
- **Cardápio** — edição completa com importação via texto (WhatsApp)
- **Configurações** — troca de senha

---

## Estrutura

```
cardapio-supabase/
├── src/
│   ├── lib/
│   │   ├── supabase.ts            # cliente Supabase
│   │   └── utils.ts               # formatadores + parser de cardápio
│   ├── hooks/
│   │   ├── useAuth.tsx            # Supabase Auth (login/logout)
│   │   ├── useCardapio.ts         # leitura do cardápio
│   │   ├── usePedidos.ts          # pedidos com Realtime + ações admin
│   │   └── usePedidosPublic.ts    # leitura pública de pedidos (sem ações)
│   ├── pages/
│   │   ├── ClientePage.tsx        # cardápio do cliente
│   │   ├── PedidosDiaPage.tsx     # página pública de pedidos
│   │   ├── AdminPage.tsx          # painel admin
│   │   └── LoginPage.tsx          # login
│   ├── types/index.ts             # interfaces TypeScript
│   └── App.tsx                    # roteamento
├── supabase/
│   └── setup.sql                  # schema, RLS, seed
├── .env.example
└── README.md
```

---

## Segurança (RLS)

| Operação | Cardápio | Pedidos |
|---|---|---|
| SELECT | Todos | Todos (página pública) |
| INSERT | Admin | Todos (clientes enviam pedidos) |
| UPDATE | Admin | Admin |
| DELETE | Admin | Admin |

Constraints de integridade no banco:
- `total >= 0` — impede valores negativos
- `jsonb_array_length(itens) > 0` — impede pedidos sem itens

---

## Realtime 🟢

Pedidos chegam instantaneamente no painel admin via WebSocket (Supabase Realtime). O indicador **"Ao vivo"** no topo da aba Pedidos confirma a conexão ativa. Novos pedidos são destacados por 8 segundos.
