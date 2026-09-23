# Plan P3 — Job shop MTO (BOM / MRP / APS / overhead)

Estado: **completado** (P3-A…D desplegados 2026-09-23).

Base: `docs/AUDITORIA_ERP_2026-09-22.md` (BOM/routing, MRP, APS, job costing).  
Prerrequisitos: P0–P2 cerrados.

## Entregado

### P3-A — BOM por OT ✅
- Schema `BomItem` + `GET/POST/PUT/PATCH/DELETE /ordenes-trabajo/:id/bom`
- UI sección BOM en detalle OT

### P3-B — MRP 1 nivel ✅
- `POST /compras/ordenes/desde-bom-ot` → OC BORRADOR con faltantes vs StockSucursal
- Botón “Generar OC desde BOM” en detalle OT

### P3-C — Gantt / conflictos ✅
- `GET /maquinaria/gantt-semanal`, `GET /maquinaria/conflictos`
- Tab Agenda: barras Gantt + alertas de overlap

### P3-D — Costeo multi-overhead ✅
- `Maquina.tarifaHora`; costeo = material + MO + máquina + overhead%
- Fallback material desde BOM si no hay salidas kardex
- Card costeo ampliada en detalle OT (`?overheadPct=15` default)

## Smoke (2026-09-23)
- BOM 1 línea; MRP → `OC-2026-0004` con faltantes
- Costeo oh0=2650 → oh20=3180 (overhead 530)
- Gantt total 2, conflictos 1; web maquinaria/OT 200

## Fuera de alcance (sigue fuera)
- BOM multinivel, solver APS, centros de costo contables, CFDI/embarques
