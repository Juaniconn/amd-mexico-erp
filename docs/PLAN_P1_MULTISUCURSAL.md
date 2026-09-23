# Plan P1 Multi-sucursal — AMD ERP

Estado: **completado** (aprobado y desplegado 2026-09-22 / 2026-09-23).

Ver auditoría: `docs/AUDITORIA_ERP_2026-09-22.md`.

## Decisiones
- Stock por sucursal (`StockSucursal`), catálogo Material compartido.
- Migración inicial: 100% del stock legacy → sucursal `esPrincipal` (Ciudad Juárez).
- ADMIN/GERENTE: pueden filtrar/ver todas; resto: solo su sucursal.

## Entregado
- Schema: `StockSucursal`, `Transferencia` + `DetalleTransferencia`, `Movimiento.sucursalId`, enum `TRANSFERENCIA_OUT`/`IN`.
- API: scope JWT (`sucursal-scope.ts`), inventario/compras/producción/cotizaciones/facturación filtrados; módulo `/api/transferencias`.
- Web: página `/transferencias`, filtro/badge de sucursal en Sidebar, login guarda `sucursal*` + `sucursalFilter`; `api.ts` append `sucursalId` en GET.
- Smoke: recepción TR mueve stock JUA→GDL; rutas `/transferencias` 200.

## Deploy notes
- Tras `prisma generate`, sincronizar cliente al contenedor:
  `docker cp …/@prisma/client/. amd-erp-api:…/@prisma/client/` y `…/.prisma/.`
- Web: `docker cp apps/web/.next/. amd-erp-web:/app/.next/`
