# Changelog IA

### [2026-09-23] Fase: Tooling de testing y validación (Fase 0)
- **Qué se hizo**: instalados `vitest@5.0.1` y `zod@4.6.5` (pins exactos, verificados contra Node 24.18.0) en engine y web; configs Vitest (`environment: node`); scripts `test`; tarea turbo `test` con `dependsOn: ^test` y `cache: false`; smoke tests temporales verdes.
- **Por qué**: base verificable para las fases siguientes sin tocar lógica de negocio; `cache: false` evita falsos verdes por caché durante todo el reto.
- **Prompt usado**: "Ejecuta [Fase 0]. Dos ajustes: 1. cache:false en turbo test para todo el reto. 2. Node v24.18.0 — fija versiones compatibles."
- **Modelo**: Muse Spark (opencode/muse-spark).
- **Revisión manual**: se verificó compatibilidad de vitest 5.0.1 (engines Node + peer vite 7) en el registry antes de fijarla; se detectó que pnpm no estaba disponible (corepack sin permisos EPERM) y se instaló vía `npm install -g pnpm@10.20.0`; se confirmó que el build no deja artefactos sin ignorar.

### [2026-09-23] Fase: Dominio puro y casos de uso (Fase 1)
- **Qué se hizo**: entidad `ShortenedUrl`, puerto `UrlRepository`, errores tipados, generador Base62 (longitud 7, `node:crypto`, inyectable), schemas Zod v4, casos de uso `shortenUrl` (reintento acotado ante colisión) / `resolveUrl` (cuenta clics) / `listUrls`, `InMemoryUrlRepository` solo para tests; 20 tests verdes; legacy como shim `@deprecated`.
- **Por qué**: desacoplar la lógica de negocio de las rutas y de la futura persistencia Prisma (DIP/OCP); corregir el generador de 9 códigos y la ausencia de validación y estadísticas.
- **Prompt usado**: "ejecuta [Fase 1: dominio puro con generador Base62]".
- **Modelo**: Muse Spark (opencode/muse-spark).
- **Revisión manual**: se corrigió un import relativo erróneo en `shorten-url.test.ts` a la primera ejecución de vitest; se confirmó que la web compila sin cambios gracias al shim y que `dist/*.tsbuildinfo` quedan ignorados.

### [2026-09-23] Fase: Persistencia Prisma + SQLite (Fase 2)
- **Qué se hizo**: schema `ShortUrl` + migración inicial, `PrismaUrlRepository` tras el puerto (mapeo P2002/P2025 a errores de dominio, incremento atómico), singleton con guard `globalThis`, 4 tests contra SQLite efímero (24 en total); Dockerfile (generate pre-build + migrate deploy en arranque), compose con volumen `./data`, README y gitignores.
- **Por qué**: persistencia que sobrevive a reinicios sin tocar dominio ni casos de uso; paths sqlite relativos resuelven desde el schema (verificado empíricamente desde cwd `applications/web`).
- **Prompt usado**: "CONFIRMADO [plan Fase 2: Prisma + SQLite + Docker]".
- **Modelo**: Muse Spark (opencode/muse-spark).
- **Revisión manual**: se descartó Prisma 8 RC / 7.x tras comprobar versiones y engines en el registry (6.19.3 fijado); se detectó que el CLI ignora el `.env` raíz y se documentó `libs/engine/.env`; el build SSR emite un aviso de externalización de `.prisma/client` (inocuo hasta Fase 3, queda vigilado); `docker compose up --build` NO verificado (sin Docker en la máquina) — pendiente explícito.
