-- ============================================================
-- Tempero Cuiabano — Setup Supabase
-- Cole este SQL no Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- ── 1. TABELA: cardapio ──────────────────────────────────
CREATE TABLE IF NOT EXISTS public.cardapio (
  id            INT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  opcao1        JSONB NOT NULL DEFAULT '[]',
  opcao2        JSONB NOT NULL DEFAULT '[]',
  marmitas      JSONB NOT NULL DEFAULT '[]',
  adicionais    JSONB NOT NULL DEFAULT '[]',
  bebidas       JSONB NOT NULL DEFAULT '[]',
  whatsapp      TEXT  NOT NULL DEFAULT '5565992806693',
  atualizado_em TIMESTAMPTZ DEFAULT now()
);

-- ── 2. TABELA: pedidos ───────────────────────────────────
CREATE TABLE IF NOT EXISTS public.pedidos (
  id           BIGSERIAL PRIMARY KEY,
  cliente_nome TEXT        NOT NULL,
  setor        TEXT        NOT NULL,
  itens        JSONB       NOT NULL DEFAULT '[]',
  total        NUMERIC(10,2) NOT NULL DEFAULT 0,
  status       TEXT        NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente','visto')),
  data         DATE        NOT NULL DEFAULT CURRENT_DATE,
  criado_em    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Índice para filtrar pedidos por data (consulta mais comum)
CREATE INDEX IF NOT EXISTS idx_pedidos_data ON public.pedidos (data DESC);

-- ── 3. ROW LEVEL SECURITY ────────────────────────────────
ALTER TABLE public.cardapio ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pedidos  ENABLE ROW LEVEL SECURITY;

-- Cardápio: qualquer um lê; só admin autenticado escreve
CREATE POLICY "cardapio_leitura_publica"
  ON public.cardapio FOR SELECT USING (true);

CREATE POLICY "cardapio_escrita_admin"
  ON public.cardapio FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Pedidos: qualquer um insere; só admin lê e atualiza
CREATE POLICY "pedidos_insert_publico"
  ON public.pedidos FOR INSERT WITH CHECK (true);

CREATE POLICY "pedidos_select_admin"
  ON public.pedidos FOR SELECT
  USING (auth.role() = 'authenticated');

-- Pedidos: leitura pública (página /pedidos sem login)
CREATE POLICY "pedidos_select_publico"
  ON public.pedidos FOR SELECT
  USING (true);

CREATE POLICY "pedidos_update_admin"
  ON public.pedidos FOR UPDATE
  USING (auth.role() = 'authenticated');

CREATE POLICY "pedidos_delete_admin"
  ON public.pedidos FOR DELETE
  USING (auth.role() = 'authenticated');

-- ── 4. REALTIME ──────────────────────────────────────────
-- Habilita Realtime para a tabela pedidos
ALTER PUBLICATION supabase_realtime ADD TABLE public.pedidos;

-- ── 5. SEED: cardápio padrão ─────────────────────────────
INSERT INTO public.cardapio (
  id, opcao1, opcao2, marmitas, adicionais, bebidas, whatsapp
)
VALUES (
  1,
  '["Galinhada cuiabana","Farofa de banana","Maionese","Lasanha à bolonhesa","Spaguetti alho e óleo","Feijão carioca"]',
  '["Arroz Branco","Feijão","Bife acebolado ou Frango grelhado","Ovo frito","Batata frita","Macarrão"]',
  '[{"tamanho":"N: 7","preco":15},{"tamanho":"N: 8","preco":18},{"tamanho":"N: 9","preco":23}]',
  '[{"nome":"Bife","preco":10},{"nome":"Frango Grelhado","preco":10},{"nome":"Ovo Frito","preco":2}]',
  '[{"nome":"Coca 2 litros","preco":14},{"nome":"Coca 1,5","preco":11},{"nome":"Coca zero 2 litros","preco":14},{"nome":"Guaraná Antártica 2 litros","preco":13},{"nome":"Guaraná Antártica 1,5","preco":10},{"nome":"Guaraná Antártica lata","preco":5},{"nome":"Coca lata","preco":5}]',
  '5565992806693'
)
ON CONFLICT (id) DO NOTHING;

-- ── PRONTO! ───────────────────────────────────────────────
-- Agora vá em: Authentication → Users → Add User
-- e crie o usuário admin (ex: admin@tempero.com / admin123)
