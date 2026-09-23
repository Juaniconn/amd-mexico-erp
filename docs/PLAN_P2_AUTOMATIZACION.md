# Plan P2 — Automatización MTO (Sprint C)

Estado: **completado** (P2-A…E desplegados 2026-09-23).

Base: `docs/AUDITORIA_ERP_2026-09-22.md` ítems 11–15. P0/P1 ya cerrados.

## Objetivo
Pasar de “documentar” a **orquestar** el flujo: Ingeniería → Cotización, reorden → OC, costeo OT, programación liviana y preventivo.

## Entregado

### P2-A — Ingeniería ✅
- `/ingenieria/nuevo`, MinIO real (`s3://erp-files/...`), `POST /ingenieria/:id/cotizar`

### P2-B — Reorden → OC ✅
- `POST /compras/ordenes/desde-reorden` + botón en Compras

### P2-C — Costeo OT ✅
- `GET /ordenes-trabajo/:id/costeo` + card en detalle OT

### P2-D — Scheduling liviano ✅
- Campos `fechaInicioProgramada` / `fechaFinProgramada` en `Operacion`
- `PATCH /operaciones/:id/programar`
- `GET /maquinaria/agenda-semanal` + tab **Agenda** en Maquinaria

### P2-E — Preventivo ✅
- `intervaloDiasPreventivo` / `ultimoPreventivo` en `Maquina`
- `GET /maquinaria/preventivos-vencidos` + alerta dashboard
- Botón “Registrar preventivo” en detalle máquina

## Fuera de alcance (sigue fuera)
- MRP por BOM/OT completo, APS/Gantt avanzado, costeo multi-overhead
