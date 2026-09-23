# Playbook: Cloud Agents × AMD ERP

Repo fijo: `https://github.com/Juaniconn/amd-mexico-erp` · branch base: `main`  
UI: `/agentes-cursor` · API key: `CURSOR_API_KEY` (solo server, nunca en Git)

## Ritual (siempre)

1. **Una tarea por run** — prompt concreto, sin “y también…”.
2. El agente trabaja en branch `cursor/...` y puede abrir **PR** (`autoCreatePR`).
3. **Tú revisas** el diff → CI en el PR → merge a `main` → Deploy automático.
4. **Nunca** pases `.env`, JWT, DB passwords ni secretos al prompt / `envVars` de prod.

## Prompts listos

### A — Tests Jest inventario/compras (bajo riesgo)
```
Repo Juaniconn/amd-mexico-erp. Rehabilita tests en apps/api/src/modules/{inventario,compras}/__tests__/.
InventarioService/ComprasService inyectan StockSucursalService. Actualiza mocks, quita paths de
testPathIgnorePatterns en apps/api/jest.config.js, corre pnpm --filter @amd/api test.
No toques schema Prisma, docker ni CI.
```

### B — Documentar flujo CONTPAQi (bajo riesgo)
```
Documenta en CURSOR.md (sección corta) el flujo: cotización aprobada → OT → embarque enviado →
cola facturación CONTPAQi (sin generar CFDI). Incluye endpoints/módulos relevantes.
Solo docs; sin cambios de código de negocio.
```

### C — Docs Deploy/CI (bajo riesgo)
```
Añade o actualiza docs/DEPLOY_GITHUB_ACTIONS.md: qué hace CI, qué hace Deploy (hot-deploy),
requisitos (tree limpio, CI=true pnpm), y cómo ver /tmp/amd-erp-deploy.log.
Sin cambiar workflows salvo typos obvios en comentarios.
```

### D — Feature UI chica (riesgo medio)
```
[Describe 1 pantalla + 1 comportamiento]. Añade test o smoke manual en el PR description.
No refactorices módulos no relacionados.
```

### E — Bug acotado (riesgo medio)
```
Bug: [síntoma]. Repro: [pasos]. Archivos sospechosos: [paths].
Fix mínimo + test si aplica. No cambies contratos API públicos sin necesidad.
```

## Endpoints ERP (proxy)

| Método | Ruta | Uso |
|--------|------|-----|
| GET | `/api/agentes-cursor/cloud/summary` | Estado + agentes |
| GET | `/api/agentes-cursor/cloud/agents` | Lista |
| POST | `/api/agentes-cursor/cloud/agents` | Crear agente + primer run |
| POST | `/api/agentes-cursor/cloud/agents/:id/runs` | Follow-up run |
| POST | `/api/agentes-cursor/cloud/agents/:id/runs/:runId/cancel` | Cancelar |

Body create (resumen):
```json
{
  "prompt": "texto del playbook",
  "name": "opcional",
  "autoCreatePR": true,
  "modelId": "opcional"
}
```
El backend fija el repo a `amd-mexico-erp` / `main`.

## Primer agente de referencia (Fase 1)

- **ID:** `bc-1bb1cdb9-1e5a-42b4-aaf4-046dd8bd0181`
- **Run:** `run-8b2b8f64-db4c-43fa-b601-f3693dd1764f`
- **URL:** https://cursor.com/agents/bc-1bb1cdb9-1e5a-42b4-aaf4-046dd8bd0181
- **Tarea:** prompt A (tests Jest inventario/compras)
- **Repo:** `Juaniconn/amd-mexico-erp` · `autoCreatePR: true`
