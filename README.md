# SeniorCare — Frontend

Interface web do **SeniorCare**, um SaaS para gestão de Instituições de Longa Permanência para Idosos (ILPIs). O sistema permite que gerentes, médicos, enfermeiros e familiares acompanhem a saúde, atividades, medicamentos e informações dos residentes de forma centralizada.

---

## Sumário

- [Visão Geral](#visão-geral)
- [Stack Tecnológica](#stack-tecnológica)
- [Pré-requisitos](#pré-requisitos)
- [Instalação e Configuração](#instalação-e-configuração)
- [Rodando o Projeto](#rodando-o-projeto)
- [Estrutura de Pastas](#estrutura-de-pastas)
- [Módulos e Funcionalidades](#módulos-e-funcionalidades)
- [Sistema de Autenticação](#sistema-de-autenticação)
- [Controle de Acesso por Role](#controle-de-acesso-por-role)
- [Camada de API](#camada-de-api)
- [Gerenciamento de Estado](#gerenciamento-de-estado)
- [Convenções de Código](#convenções-de-código)
- [Variáveis de Ambiente](#variáveis-de-ambiente)
- [Backend](#backend)

---

## Visão Geral

O SeniorCare Frontend é uma Single Page Application (SPA) construída com React 18 e TypeScript. A interface foi projetada com foco em usabilidade para usuários não-técnicos — enfermeiros, médicos, gerentes e familiares de idosos —, priorizando clareza, feedback visual imediato e tolerância a erros.

**Funcionalidades principais:**

- Login com JWT e proteção de rotas por papel (role)
- Troca de senha obrigatória no primeiro acesso (familiares)
- Gestão de residentes: admissão, edição, vínculos familiares
- Prontuários de saúde com histórico de medições e fotos
- Prescrições e registros de administração de medicamentos
- Histórico de atividades com anotações e fotos
- Gestão de funcionários: médicos, enfermeiros, gerentes
- Gestão de familiares: criação de conta e vínculo com residente
- Gestão de usuários: visualização, edição e desativação
- Upload de foto de perfil via Azure Blob Storage

---

## Stack Tecnológica

| Camada | Tecnologia |
|---|---|
| UI | React 18 |
| Linguagem | TypeScript 5 |
| Estilização | Tailwind CSS v3 |
| Componentes | Shadcn/ui (Radix UI) |
| Roteamento | React Router v6 |
| Estado do servidor | TanStack Query v5 (React Query) |
| Estado global | Zustand |
| Formulários | React Hook Form + Zod |
| HTTP | Axios |
| Ícones | Lucide React |
| Notificações | Sonner |
| Datas | date-fns |
| Build | Vite |

---

## Pré-requisitos

- **Node.js** 18+ (recomendado 20 LTS)
- **npm** 9+ ou **pnpm** 8+
- Backend do SeniorCare rodando na porta `8080` (ver [Backend](#backend))

---

## Instalação e Configuração

```bash
# Clone o repositório
git clone https://github.com/Dogolaa/Senior-Care-Frontend.git
cd Senior-Care-Frontend

# Instale as dependências
npm install
```

O projeto não requer arquivo `.env` para desenvolvimento local — a URL base da API está configurada diretamente em `src/api/axios.ts` apontando para `http://localhost:8080/api/v1`.

Se quiser alterar a URL da API, edite:

```ts
// src/api/axios.ts
const api = axios.create({
  baseURL: 'http://localhost:8080/api/v1',
})
```

---

## Rodando o Projeto

```bash
# Servidor de desenvolvimento (hot-reload)
npm run dev
```

A aplicação ficará disponível em `http://localhost:3000`.

```bash
# Build de produção
npm run build

# Preview do build de produção
npm run preview

# Verificação de tipos TypeScript
npm run type-check
```

---

## Estrutura de Pastas

```
src/
├── api/                    # Funções de chamada à API REST
│   ├── axios.ts            # Instância Axios com interceptors JWT
│   ├── auth.ts             # Login, registro, troca de senha
│   ├── users.ts            # CRUD de usuários
│   ├── residents.ts        # Residentes e vínculos familiares
│   ├── employees.ts        # Funcionários (médicos, enfermeiros, gerentes)
│   ├── healthRecords.ts    # Prontuários e histórico
│   ├── medications.ts      # Medicamentos e prescrições
│   └── activityRecords.ts  # Atividades e histórico
│
├── components/
│   ├── ui/                 # Componentes Shadcn (Button, Input, Dialog…)
│   ├── layout/             # AppLayout, Sidebar, AppHeader
│   └── shared/             # PageHeader, EmptyState, ConfirmDialog,
│                           #   LoadingSkeleton, PhotoUploader, Avatar
│
├── features/               # Domínios de negócio (lógica + componentes locais)
│   ├── auth/
│   │   └── components/     # LoginForm
│   ├── residents/
│   │   ├── components/     # ResidentCard, AdmitResidentDialog,
│   │   │                   #   EditResidentDialog, FamilyMembersDialog,
│   │   │                   #   ResidentPickerCard
│   │   └── hooks/          # useResidentList, useResidentSearch,
│   │                       #   useAdmitResident, useEditResident,
│   │                       #   useCreateAndLinkFamilyMember, etc.
│   ├── employees/
│   │   ├── components/     # EmployeeCard, PromoteEmployeeDialog,
│   │   │                   #   EditEmployeeDialog, DemoteDialog
│   │   └── hooks/          # useEmployeeList, usePromoteEmployee, etc.
│   ├── health-records/
│   │   └── hooks/          # useHealthRecord, useCreateHealthRecord,
│   │                       #   useUpdateHealthRecord, useAddHistoryPhoto
│   ├── medications/
│   │   └── hooks/          # useMedications, usePrescriptions,
│   │                       #   useMedicationRecords, useAddMedicationRecordPhoto
│   ├── activities/
│   │   └── hooks/          # useActivityRecord, useAddActivity,
│   │                       #   useAddActivityPhoto
│   └── users/
│       └── hooks/          # useUserList, useUpdateUser, useDeleteUser
│
├── hooks/                  # Hooks genéricos reutilizáveis
│
├── lib/
│   ├── utils.ts            # cn(), formatCPF(), formatDate(), formatPhone()
│   ├── constants.ts        # ROLE_LABELS, BLOOD_TYPE_LABELS, GENDER_LABELS,
│   │                       #   SHIFT_LABELS, ROLE_COLORS, ROLE_AVATAR_COLORS
│   └── permissions.ts      # hasPermission(), hasAnyPermission() — RBAC
│
├── pages/                  # Componentes de página (composição de features)
│   ├── LoginPage.tsx
│   ├── ChangePasswordPage.tsx
│   ├── DashboardPage.tsx
│   ├── ResidentsPage.tsx
│   ├── EmployeesPage.tsx
│   ├── HealthRecordsPage.tsx
│   ├── MedicationsPage.tsx
│   ├── ActivitiesPage.tsx
│   ├── FamilyMembersPage.tsx
│   └── UsersPage.tsx
│
├── router/
│   ├── index.tsx           # Definição de rotas com createBrowserRouter
│   └── ProtectedRoute.tsx  # Guarda de rota: JWT + must_change_password
│
├── store/
│   └── authStore.ts        # Zustand: token, userId, role, mustChangePassword
│
└── types/
    ├── api.ts              # Interfaces espelhando os DTOs do backend
    └── enums.ts            # Enums alinhados com o backend
```

---

## Módulos e Funcionalidades

### Login / Autenticação
- Página de login com validação de formulário
- Token JWT armazenado no `sessionStorage` via Zustand persist
- Expiração do token detectada automaticamente no rehidrate
- Interceptor Axios injeta `Authorization: Bearer <token>` em todas as requisições
- Respostas `401` limpam o estado e redirecionam para `/login`

### Troca de Senha Obrigatória
- Familiares criados pelo gerente recebem uma senha temporária por e-mail
- No primeiro login, a API retorna `mustChangePassword: true`
- O `ProtectedRoute` redireciona para `/change-password` até que a senha seja trocada
- Após a troca, o flag é atualizado no store e o usuário segue para o dashboard

### Dashboard
- Visão geral com contadores: residentes ativos, funcionários, prontuários
- Acesso rápido aos módulos conforme o papel do usuário

### Residentes
- Lista paginada de residentes em cards
- Admissão de novo residente com CPF, data de nascimento, tipo sanguíneo, quarto e alergias
- Edição de dados do residente
- Visualização e gestão de vínculos familiares diretamente do card

### Prontuários de Saúde
- Busca de residente e exibição do prontuário mais recente
- Criação e atualização de prontuário (altura, peso, pressão, frequência cardíaca, temperatura, saturação)
- IMC calculado automaticamente pelo backend
- Histórico de medições com linha do tempo
- Upload de fotos por entrada do histórico
- Push de sinais vitais (dispositivos wearable/manual)

### Medicamentos e Prescrições
- Busca de medicamentos no catálogo (nome comercial, princípio ativo)
- Criação de prescrições vinculadas ao prontuário
- Registro de administração de medicamentos com dose e responsável
- Histórico de administrações por residente com suporte a fotos

### Atividades
- Criação de registro de atividades para o residente
- Adição de atividades individuais (nome, descrição, horário, responsável, notas)
- Histórico de atividades com suporte a fotos

### Funcionários
- Lista de médicos, enfermeiros e gerentes
- Promoção de usuário padrão para funcionário (informar especialização, turno, CRM/COREN)
- Edição de dados do funcionário
- Rebaixamento para usuário padrão (reverte role para `DEFAULT_USER`)

### Familiares
- Página dedicada com seletor de residente
- Criação de conta para o familiar (envia e-mail com senha temporária)
- Exibição de familiares vinculados com dados completos (nome, e-mail, telefone)
- Definição de contato principal
- Remoção de vínculo com confirmação

### Usuários
- Lista de todos os usuários do sistema em cards
- Usuários ativos exibidos antes dos inativos
- Usuários inativos não exibem papel nem botões de ação
- Edição de nome, e-mail e telefone
- Desativação: retira acesso ao sistema e reverte role para `DEFAULT_USER`

---

## Sistema de Autenticação

O fluxo completo de autenticação:

```
1. POST /api/v1/auth/login → { token, userId, name, email, role, mustChangePassword }
2. Token salvo no sessionStorage via Zustand
3. Interceptor Axios injeta "Authorization: Bearer <token>" em todo request
4. ProtectedRoute verifica isAuthenticated → redireciona /login se ausente
5. ProtectedRoute verifica mustChangePassword → redireciona /change-password se true
6. Interceptor de resposta: 401 → clearAuth() + redirect /login
```

O token tem validade de **24 horas**. Ao fechar e reabrir o browser, o `sessionStorage` é limpo e o usuário precisa logar novamente.

---

## Controle de Acesso por Role

O arquivo `src/lib/permissions.ts` mapeia cada role às suas permissões:

| Role | Permissões principais |
|---|---|
| `ADMIN` | Todas as permissões |
| `MANAGER` | Gestão de residentes, funcionários, prontuários, atividades, familiares |
| `DOCTOR` | Prontuários, prescrições, atividades |
| `NURSE` | Prontuários, medicamentos, atividades |
| `FAMILY_MEMBER` | Leitura de prontuários e atividades do residente vinculado |
| `DEFAULT_USER` | Apenas leitura de dados do próprio usuário |

A visibilidade dos itens do menu lateral e dos botões de ação é controlada via `hasPermission(role, permission)` e `hasAnyPermission(role, permissions[])`.

---

## Camada de API

### Axios (`src/api/axios.ts`)

- `baseURL`: `http://localhost:8080/api/v1`
- **Request interceptor**: injeta `Authorization: Bearer <token>` automaticamente
- **Response interceptors**:
  - `401` → limpa store + redireciona `/login`
  - `403` → toast "Você não tem permissão para esta ação"
  - `400` → exibe mensagem de erro do body
  - `404` → toast "Recurso não encontrado"
  - `5xx` → toast "Erro interno, tente novamente"

### TanStack Query

- Leituras sempre via `useQuery` com `queryKey` consistente
- Escritas via `useMutation` com `invalidateQueries` no `onSuccess`
- Stale time de 2–10 minutos conforme o módulo
- Skeletons e estados de loading em todas as operações assíncronas

---

## Gerenciamento de Estado

### Zustand — `authStore`

```ts
interface AuthState {
  token: string | null
  userId: string | null
  name: string | null
  email: string | null
  role: string | null
  photoUrl: string | null
  mustChangePassword: boolean
  isAuthenticated: boolean
  setAuth(data: LoginResponse): void
  setPhotoUrl(url: string): void
  setMustChangePassword(value: boolean): void
  clearAuth(): void
}
```

Persistido no `sessionStorage` com `zustand/middleware/persist`. Ao reabrir o browser a sessão é limpa (comportamento intencional para segurança).

### TanStack Query — Estado do servidor

Dados remotos (residentes, prontuários, funcionários…) nunca são duplicados no Zustand. O React Query é a fonte de verdade para dados da API.

---

## Convenções de Código

| Artefato | Padrão |
|---|---|
| Componentes | `PascalCase` — `ResidentCard.tsx` |
| Hooks | `use` prefix — `useResidents.ts` |
| Serviços/utils | `camelCase` — `residents.ts`, `formatDate` |
| Páginas | suffix `Page` — `ResidentsPage.tsx` |
| Tipos da API | suffix `DTO` — `ResidentDTO` |
| Tipos de form | suffix `FormData` — `AdmitResidentFormData` |

**Regras gerais:**
- TypeScript strict em todo o projeto — sem `any` explícito
- Enums do backend nunca exibidos crus — sempre traduzidos via `constants.ts`
- Formulários sempre com React Hook Form + Zod — nunca `useState` isolado para campos
- Ações destrutivas sempre com `ConfirmDialog` antes de executar
- Toast de sucesso/erro em toda mutation
- Estado vazio tratado com `EmptyState` — nunca lista vazia sem contexto

---

## Variáveis de Ambiente

O projeto não usa `.env` em desenvolvimento local. A URL da API é configurada diretamente em `src/api/axios.ts`.

Para deploy em produção, altere a `baseURL` conforme o endereço do backend:

```ts
const api = axios.create({
  baseURL: process.env.VITE_API_URL ?? 'http://localhost:8080/api/v1',
})
```

E adicione no `.env.production`:

```
VITE_API_URL=https://api.seudominio.com/api/v1
```

---

## Backend

O frontend consome a API REST do **Senior-Care-Spring**.

- Repositório: [github.com/Dogolaa/Senior-Care-Spring](https://github.com/Dogolaa/Senior-Care-Spring)
- Porta padrão: `8080`
- Swagger UI: `http://localhost:8080/swagger-ui.html`

**Credenciais de acesso padrão (seed):**

| E-mail | Senha | Role |
|---|---|---|
| `admin@seniorcare.com` | `admin123` | ADMIN |
| `ana.oliveira@seniorcare.com` | `admin123` | DOCTOR |
| `carlos.medeiros@seniorcare.com` | `admin123` | DOCTOR |
| `maria.silva@seniorcare.com` | `admin123` | NURSE |
| `joao.santos@seniorcare.com` | `admin123` | NURSE |
| `roberto.alves@seniorcare.com` | `admin123` | MANAGER |

Para subir o ambiente completo (API + PostgreSQL + Redis) via Docker:

```bash
cd Senior-Care-Spring
docker compose up -d
```
