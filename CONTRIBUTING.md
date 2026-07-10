# Contributing to Stellar Canopy

Thank you for your interest in contributing to Stellar Canopy! As a decentralized tree-planting and carbon-offset tracking platform built on Stellar using Soroban smart contracts, we aim for the highest standards of code quality and developer workflows.

---

## 1. Getting Started

### Prerequisites
- **Node.js** 20+
- **pnpm** (preferred package manager)
- **Rust** & Cargo (stable)
- **Stellar CLI** (for contract deployments)

### Development Setup
1. **Clone the repository:**
   ```bash
   git clone git@github.com:stellar-canopy/canopy.git
   cd canopy
   ```
2. **Install frontend dependencies:**
   ```bash
   pnpm install
   ```
3. **Build the smart contracts:**
   ```bash
   cd contracts
   cargo build --target wasm32-unknown-unknown --release
   ```
4. **Run the Next.js development server:**
   ```bash
   pnpm dev
   ```

---

## 2. Branching Strategy

Always start your work by creating a branch from the latest `main`:
```bash
git checkout main
git pull origin main
git checkout -b <type>/<issue-number>-<short-description>
```

### Branch Naming Conventions
- `feat/42-wallet-connect-modal`
- `fix/78-rate-limit-toast`
- `docs/107-contributing-guide`

---

## 3. Commit Guidelines

We strictly enforce **Conventional Commits** and **Atomic Commits**. Each commit must represent a single, cohesive change.

### Commit Format
```
<type>(<scope>): <short description>

[optional body]

[optional footer]
```

### Allowed Types
| Type | Description |
| :--- | :--- |
| `feat` | New feature or component |
| `fix` | Bug fix |
| `docs` | Documentation updates |
| `style` | Code style/formatting changes (no logic changes) |
| `refactor` | Code restructuring (no behavior changes) |
| `test` | Adding or updating tests |
| `build` | Build system or dependency updates |
| `ci` | CI configuration updates |

### Allowed Scopes
`auth`, `wallet`, `dashboard`, `planter`, `sponsor`, `escrow`, `carbon`, `ui`, `layout`, `config`, `deps`

---

## 4. Coding Standards

- **TypeScript Strict Mode**: Avoid using `any` and suppressions like `// @ts-ignore`. Unused variables will fail the build.
- **Tailwind CSS v4 styling**: Use predefined design tokens and variables in `src/app/globals.css`. Avoid ad-hoc inline styles.
- **No Barrel Exports**: Always import components directly from their source files rather than indexing them in a barrel file.
  * **Correct**: `import { Button } from '@/components/atoms/Button'`
  * **Incorrect**: `import { Button } from '@/components/atoms'`

---

## 5. Pull Request Process

Before submitting a Pull Request, verify that your branch builds and passes linting:
```bash
pnpm build
pnpm lint
```

### PR Requirements
1. **Linked Issue**: Every PR must close an open issue (e.g., `Closes #123`).
2. **Screen Recording**: Attach a screen recording showing your implementation working in the browser.
3. **PR Template**: Complete the PR template description fields (Summary, Implementation Details, How to Test).
