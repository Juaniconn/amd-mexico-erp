# Plan P4 — Cierre operativo (permisos + embarques + cola CONTPAQi)

Estado: **completado** (ajustado 2026-09-23: Facturación = solo monitoreo).

## Entregado

### P4-A — Permisos API ✅
- `PermissionsGuard` + `@RequirePermiso`
- Smoke: usuario sin `compras:crear` → 403

### P4-B — Embarques ✅
- CRUD + enviar; al **enviar** se encola pedido de facturación

### P4-C — Facturación (cola CONTPAQi) ✅
- **No CFDI / no contabilidad / no PAC**
- Módulo = cola de monitoreo: OT + cotización + importe ref. para que Contabilidad facture en **CONTPAQi**
- Auto al finalizar entrega (embarque ENVIADO)
- UI: listado + “Marcar facturado en CONTPAQi”

### P4-D — Calidad enums ✅

## Fuera de alcance
- Timbrado SAT, CONTPAQi API, asientos contables, CFDI
