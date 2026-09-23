# Changelog IA

### [2026-09-23] Fase: Tooling de testing y validación (Fase 0)
- **Qué se hizo**: instalados `vitest@5.0.1` y `zod@4.6.5` (pins exactos, verificados contra Node 24.18.0) en engine y web; configs Vitest (`environment: node`); scripts `test`; tarea turbo `test` con `dependsOn: ^test` y `cache: false`; smoke tests temporales verdes.
- **Por qué**: base verificable para las fases siguientes sin tocar lógica de negocio; `cache: false` evita falsos verdes por caché durante todo el reto.
- **Prompt usado**: "Ejecuta [Fase 0]. Dos ajustes: 1. cache:false en turbo test para todo el reto. 2. Node v24.18.0 — fija versiones compatibles."
- **Modelo**: Muse Spark (opencode/muse-spark).
- **Revisión manual**: se verificó compatibilidad de vitest 5.0.1 (engines Node + peer vite 7) en el registry antes de fijarla; se detectó que pnpm no estaba disponible (corepack sin permisos EPERM) y se instaló vía `npm install -g pnpm@10.20.0`; se confirmó que el build no deja artefactos sin ignorar.
