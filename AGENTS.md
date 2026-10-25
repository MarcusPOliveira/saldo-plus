<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Diretrizes para Agentes de Desenvolvimento (AGENTS.md)

Este documento define os padrões obrigatórios de engenharia de software para este repositório.

---

## ⚠️ Regra Fundamental: Testes Obrigatórios

> **SEMPRE que uma nova funcionalidade for criada ou uma funcionalidade existente for alterada, É OBRIGATÓRIO escrever e manter:**
> 1. **Testes Unitários** usando **Vitest**
> 2. **Testes End-to-End (E2E)** usando **Playwright**

Nenhuma funcionalidade deve ser considerada concluída sem que a suite completa de testes unitários e E2E esteja implementada e passando.

---

## 1. Stack e Ferramentas de Teste

* **Test Runner Unitário**: [Vitest](https://vitest.dev/)
* **Mocking do Banco de Dados**: `vitest-mock-extended` (mock tipado do Prisma Client)
* **Autenticação**: Better Auth com Google Social Auth (`@/lib/auth`, `@/lib/auth-client`)
* **Testes E2E**: [Playwright](https://playwright.dev/) com Chromium

---

## 2. Padrões para Testes Unitários (Vitest)

Os testes unitários devem cobrir principalmente:
- **Server Actions** (`src/app/**/_actions/*.ts`)
- **API Routes** (`src/app/api/**/route.ts`)
- **Schemas Zod** (`src/schema/*.ts`)
- **Funções Utilitárias e Helpers** (`src/lib/*.ts`)

### Localização dos arquivos
- Os testes unitários devem ficar colocalizados junto aos arquivos que testam, com extensão `.test.ts` (ou `.spec.ts`).
  - Exemplo: `src/app/api/banks/route.test.ts`
  - Exemplo: `src/app/(app)/dashboard/_actions/categories.test.ts`

### Mocks de Autenticação e Prisma
Sempre utilize os utilitários padronizados do projeto:
* **Prisma Client**: Importe `prismaMock` de `@/tests/mocks/prisma`.
* **Better Auth**: Importe `mockCurrentUser` e `mockUnauthenticatedUser` de `@/tests/mocks/auth`.

### O que deve ser testado:
1. **Fluxo de Sucesso**: execução esperada com dados válidos e usuário autenticado.
2. **Autenticação**: redirecionamento para `/sign-in` caso o usuário não esteja autenticado (`mockUnauthenticatedUser()`).
3. **Validação de Dados**: lançamento de erro ou retorno de status `400` caso a validação do schema Zod falhe.
4. **Erros de Domínio/Banco**: tratamento de registros inexistentes (`404`), conflitos de unicidade (`409` / `P2002`) e erros inesperados (`500`).

---

## 3. Padrões para Testes End-to-End (Playwright)

Os testes E2E ficam no diretório `e2e/`.

### O que deve ser testado:
1. **Proteção de Rotas**: rotas privadas (`/dashboard`, `/transactions`, `/settings`, `/wizard`) devem redirecionar para `/sign-in` quando acessadas por visitantes anônimos.
2. **Páginas Públicas e Landing Page**: carregamento dos componentes principais, botões de ação e navegação.
3. **Fluxos de Autenticação**:
   - Renderização correta da página `/sign-in` e do botão **"Continuar com Google"**.
   - Como o projeto utiliza **Better Auth com autenticação social via Google**, requisições externas para provedores OAuth devem ser interceptadas via `page.route()` para validar os payloads disparados sem depender de telas de login externas de terceiros.
4. **Jornadas do Usuário**: interações de formulários, filtros, modais e transições de tela.

---

## 4. Scripts e Comandos de Validação

Antes de concluir qualquer tarefa, execute os seguintes comandos e certifique-se de que todos passam com sucesso:

```bash
# 1. Executar todos os testes unitários
pnpm test

# 2. Executar testes unitários em modo watch durante desenvolvimento
pnpm test:watch

# 3. Executar testes E2E
pnpm test:e2e

# 4. Executar testes E2E com interface visual interativa
pnpm test:e2e:ui

# 5. Executar lint e formatação
pnpm lint

# 6. Validar typecheck e build de produção
pnpm build
```
