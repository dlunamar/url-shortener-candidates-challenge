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

### [2026-09-23] Fase: Backend cableado con seguridad (Fase 3)
- **Qué se hizo**: handlers agnósticos `handleShorten`/`handleResolve` (resultados planos), `action`/`loader` finos con status reales, rate-limit 10/min por IP, anti-SSRF fail-closed con DNS, `getBaseUrl` validada, headers `nosniff`+`referrer-policy`, store legacy eliminado; 19 tests web con Request nativo + integración crear→redirigir (43 en total).
- **Por qué**: separar la capa HTTP del dominio (el primer diseño con `data()` en lib falló en tests y se refactorizó), cerrar validación/seguridad/estadísticas y dejar el servidor prod verificado de extremo a extremo.
- **Prompt usado**: "ejecuta [Fase 3: action/loader + rate-limit + seguridad + tests con Request nativo]".
- **Modelo**: Muse Spark (opencode/muse-spark).
- **Revisión manual**: el servidor compilado moría al arrancar (`.prisma/client/default` irresoluble con pnpm strict) — se añadió `ssr.external` + `@prisma/client`/`prisma` en web (pnpm fusionó ambas copias en la entrada con el cliente generado) y se verificó con smoke prod local (200/302/404 reales); el POST crudo a `/` sin `?index` da 405 por diseño de RR, no es bug. Limitaciones conocidas: rate-limit in-memory por instancia y clave IP por header (`unknown` en dev directo); integración web con InMemory en vez de Prisma.

### [2026-09-23] Fase: UI con componentes y lista con estadísticas (Fase 4)
- **Qué se hizo**: componentes estilo shadcn sin Radix (`button`/`input`/`card` con cva+clsx+merge), `ShortenForm` (label, `type=url`, loading con `useNavigation`, `role=alert`, botón copiar), `UrlList`/`UrlListItem` (badge de clics, fecha, vacío explícito); `loader` con `listUrls`; 43 tests intactos.
- **Por qué**: sustituir el JSX monolítico por piezas reutilizables y accesibles, y exponer las estadísticas que el backend ya contaba desde Fase 1.
- **Prompt usado**: "ejecuta [Fase 4: UI shadcn mínima + lista con estadísticas]".
- **Modelo**: Muse Spark (opencode/muse-spark).
- **Revisión manual**: se corrigió el `aria-label` del badge (decía "1 clicks"); smoke prod local verificó vacío→crear→0 clics→302→1 clic en HTML real y se limpió la fila de prueba de `dev.db`.
