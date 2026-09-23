# URL Shortener

## Tech Stack

```
url-shortener/
├── applications/web/    # React + React Router v7
└── libs/engine/         # Domain logic
```

| Technology                                    | Description                                                                                       |
| --------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| [pnpm](https://pnpm.io/)                      | Fast, disk-efficient package manager with built-in monorepo support via workspaces                |
| [Turbo](https://turbo.build/)                 | High-performance build system for monorepos. Runs tasks in parallel and caches results            |
| [React](https://react.dev/)                   | Library for building user interfaces with components                                              |
| [React Router v7](https://reactrouter.com/)   | Full-stack React framework. Handles routing, data loading (loaders), mutations (actions), and SSR |
| [TypeScript](https://www.typescriptlang.org/) | Typed superset of JavaScript for catching errors at compile time                                  |
| [Tailwind CSS](https://tailwindcss.com/)      | Utility-first CSS framework for rapid UI development                                              |
| [Vite](https://vite.dev/)                     | Fast build tool and dev server with hot module replacement                                        |

## Local Setup

```bash
pnpm install
cp .env.example .env
# Prisma CLI only reads libs/engine/.env: copy the DATABASE_URL line there
pnpm --filter @url-shortener/engine db:migrate
pnpm dev
```

Open `http://localhost:5173`

Data lives in `libs/engine/prisma/dev.db` (gitignored SQLite file).

## Docker Setup

```bash
docker-compose up --build
```

Open `http://localhost:3000`

- Migrations run automatically on container start (`prisma migrate deploy`).
- Data persists in the `./data` volume (`shortener.db`, gitignored), so
  shortened URLs survive restarts and rebuilds.
