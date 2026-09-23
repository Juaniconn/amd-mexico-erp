# Auditoría ERP AMD México — 2026-09-22

## Veredicto

La plataforma es un **ERP MTO (make-to-order) a ~55–65% de madurez operativa**. Hay pantallas y APIs por departamento, pero **varios puentes UI↔API están rotos** y faltan piezas clave de un job shop (BOM/routing por orden, stock por sucursal, MRP, scheduling, costeo real).

Objetivo de negocio: conectar Juárez / Guadalajara / El Paso, compartir información y **automatizar trabajo mecánico/repetitivo**. Hoy el sistema documenta; **aún no orquesta** el día a día de planta.

---

## Qué sí funciona

- Catálogos: clientes, proveedores, usuarios, maquinaria (CRUD).
- Cotizaciones → aprobar → convertir a OT (API).
- Inventario: materiales, movimientos básicos, stock bajo.
- Compras: lógica RECIBIDA → entrada de stock (service).
- Calidad vinculada a operación/OT (parcial).
- Dashboard con alertas desde DB.
- Infra: Docker healthy, tunnel, permisos UI, Agentes Hermes/Cursor.

---

## Bloqueadores P0 (ops diarias)

1. **Compras UI llama `/api/ordenes-compra`**; API es `/api/compras/ordenes` + `detalles[].materialId`. Crear/recibir OC desde UI falla.
2. **Facturación UI llama `POST/PATCH /api/facturas`**; API solo tiene listado + `desde-ot` + marcar pagada/cancelar. Crear factura desde UI falla.
3. **Convert cotización→OT** no copia `sucursalId` ni crea operaciones desde `procesoRequerido`.
4. **Lookup OT por cotización** usa heurística de folio, no `cotizacionId`.
5. **Descuento de material en OT** baja stock sin `MovimientoInventario` (kardex incompleto).

## P1 (multi-planta / integridad)

6. Sin filtro operativo por `sucursalId` en listados.
7. Stock global (Material sin sucursal); Transferencias solo en schema.
8. Permisos granulares en UI no se enforcean en API (solo roles).
9. Calidad: enums UI (`aprobado`) vs Prisma (`APROBADO`).
10. Factura desde OT sin líneas `DetalleFactura`.

## P2 (automatización MTO real)

11. Ingeniería: falta `/nuevo`, upload MinIO real, liberar→cotización.
12. Sin sugerencias de reorden → draft OC.
13. Sin scheduling / capacidad de máquinas.
14. Sin mantenimiento preventivo automático.
15. Sin costeo real vs cotizado (margen vs estimado).

---

## Contraste vs ERP MTO de industria

Flujo esperado: Estimar → Cotizar → Orden/Job → BOM/Routing → MRP/Compras → Programar → Fabricar → Calidad → Embarcar → Facturar → Margen.

| Capacidad | AMD ERP hoy |
|-----------|-------------|
| Quote→Job | Parcial |
| BOM/routing por orden | Casi ausente |
| MRP / reorden | No |
| Stock multi-sitio | No |
| APS / scheduling | No |
| Job costing | No |
| Calidad / trazabilidad | Parcial |
| Facturación ligada a OT | API sí / UI no |

---

## Roadmap recomendado

**Sprint A (esta sesión / inmediato):** arreglar puentes Compras + Facturación + convert OT + kardex.

**Sprint B:** filtro sucursal + stock por planta + permisos en API.

**Sprint C:** Ingeniería→cotización, reorden automático, tablero de máquinas, costeo OT.
