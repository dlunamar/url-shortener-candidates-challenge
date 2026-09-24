# Submission

## Qué hice

Refactor completo del URL shortener en fases pequeñas y verificables
(detalle por fase en `CHANGELOG_IA.md` y `notas-ia/paso*.txt`):

- **Fase 0 — Tooling**: Vitest 5.0.1 + Zod 4.6.5 (pins exactos,
  verificados contra Node 24), scripts `test` y tarea turbo `test`
  con `cache: false` permanente para evitar falsos verdes.
- **Fase 1 — Dominio puro** (`libs/engine`): entidad `ShortenedUrl`,
  puerto `UrlRepository`, errores tipados, generador Base62 de 7
  caracteres con `node:crypto` (adiós a los 9 códigos con colisión
  garantizada), schemas Zod y casos de uso `shortenUrl` (reintento
  acotado ante colisión), `resolveUrl` (cuenta clics) y `listUrls`.
  20 tests. La tienda `Map` global quedó como shim deprecado para no
  romper la web a mitad del refactor.
- **Fase 2 — Persistencia** (Prisma 6.19.3 + SQLite, versión estable
  verificada; se descartó el `latest` 8.0.0-RC): `PrismaUrlRepository`
  tras el puerto sin tocar dominio ni casos de uso, migración
  versionada, incremento de clics atómico, Dockerfile con `generate`
  pre-build y `migrate deploy` en arranque, compose con volumen
  `./data` y README actualizado. 24 tests.
- **Fase 3 — Backend** (`applications/web`): `action`/`loader` finos
  que delegan en handlers agnósticos al framework (testeables con
  `Request` nativo), validación en profundidad, rate-limit 10/min
  por IP (429 + `Retry-After`), anti-SSRF fail-closed con DNS,
  `PUBLIC_URL` validada y headers `nosniff`/`referrer-policy`.
  Store legacy eliminado. 19 tests web + integración crear→redirigir
  (43 en total). Servidor de producción verificado de extremo a
  extremo (200/302/404 reales).
- **Fase 4 — UI**: componentes estilo shadcn sin Radix
  (`button`/`input`/`card` con cva), formulario accesible (`label`,
  `type="url"`, loading con `useNavigation`, `role="alert"`, botón
  copiar) y lista de URLs con badge de clics, fecha y estado vacío,
   alimentada por `listUrls`. Smoke prod: vacío→crear→0 clics→
   302→1 clic.
- **Fase 5 — Cierre**: este archivo, filas de Prisma/SQLite/Zod/Vitest
  en el README y verificación global (typecheck + 43 tests + build
  en verde), sin cambios de código.
- **Fase 6 — Docker**: instalado WSL2 + Docker Desktop 4.91.0;
  `docker compose up --build` funcionó a la primera, con migraciones
  aplicadas en arranque; flujo crear→302→`restart` confirmó que URL y
  clics persisten en el volumen `./data`.
- **Fixes post-cierre** (ramas `chore/...fase-6`): bug real detectado
  probando en local — el anti-SSRF rechazaba *todos* los hostnames
  (el pre-chequeo de IP literales filtraba también `isIP → 0`);
  fix + resolver inyectable + 3 tests de regresión sin red en su
  propio commit; además se eliminó el export `baseUrl` del engine,
  ya sin uso.

Prioricé el backend (persistencia, validación, seguridad, tests)
sobre la UI porque los defectos graves estaban allí; la UI se
reescribió al final sobre un backend ya sólido.

## Qué haría con más tiempo

- **Rate-limit distribuido** (Redis): el actual es in-memory por
  instancia y la IP sale del header `x-forwarded-for` (documentado
  como limitación conocida).
- **Tests de componentes** (Testing Library + happy-dom) y
  paginación/búsqueda en la lista de URLs.
- **Deduplicación** de URLs ya acortadas y caducidad opcional.

## Uso de IA

Todo el refactor se hizo con OpenCode + **Muse Spark**
(`opencode/muse-spark`), yo (David Luna) revisando, verificando y
commiteando cada fase. Flujo típico por fase: auditoría/plan en modo
plan (solo lectura) → mi confirmación → ejecución → mi commit manual.

Prompts representativos (resumidos):

- *"Audita el código actual contra CHALLENGE_DESCRIPTION.md y
  AGENTS.md... propón fases pequeñas y verificables. No escribas
  código todavía, solo el plan."*
- *"Ejecuta. Dos ajustes: 1. cache:false en turbo test para todo el
  reto. 2. Node v24.18.0 — fija versiones compatibles."*
- *"Precisión para el generador: alfabeto Base62. Para Fase 3:
  testea action/loader con Request simulado, sin servidor ni e2e."*
- *"CONFIRMADO"* / *"ejecuta"* / *"vamos a fase N"* para cada fase.

Revisión manual en cada fase (registrada en `CHANGELOG_IA.md`):
compatibilidad de versiones en el registry, imports relativos,
`data()` de React Router (no es un `Response`: obligó a separar los
handlers del framework), resolución de `@prisma/client` bajo pnpm
strict + SSR (servidor compilado que moría al arrancar), `aria-label`
del badge de clics, limpieza de filas de prueba de `dev.db` y
diagnóstico del anti-SSRF que bloqueaba hostnames (`nslookup`/Node
confirmaron DNS sano y acotaron el bug al pre-chequeo; los smokes
previos usaban IP literales, por eso no lo vieron).

## Feedback

Enunciado claro y bien acotado; los criterios (persistencia,
repository pattern, validación, tests, anti-abuso, Docker) guían
bien las prioridades. La estimación de ~2h se queda corta para
hacerlo con esta profundidad, pero como guía orientativa funciona.
Sugerencia: aclarar si se espera una sola rama o valen ramas por
fases, y si el `docker-compose up --build` lo verifica el evaluador
o el candidato.
