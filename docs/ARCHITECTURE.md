# 🏗️ Arquitectura del Sistema

## Diagrama General
```
Clientes (Web/Mobile)
       │
       ▼
┌─────────────────────────────────────────────────────────────┐
│                    NGINX (Reverse Proxy)                     │
│              SSL, Rate Limiting, Static Files                 │
└──────────────────────────┬──────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────┐
│              NESTJS API (Monolito Modular)                   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ Auth │ Clientes │ Cotizaciones │ Producción │ ...   │   │
│  └──────────────────────────────────────────────────────┘   │
│  Audit Log │ RBAC │ Multi-tenant │ Event Bus │ Queue       │
└──────────────────────────┬──────────────────────────────────┘
                           │
     ┌─────────────────────┼─────────────────────┐
     ▼                     ▼                     ▼
┌──────────┐      ┌──────────────┐      ┌──────────┐
│ Postgres │      │    Redis     │      │  MinIO   │
│  (ACID)  │      │ (Cache/Queue)│      │  (S3)    │
└──────────┘      └──────────────┘      └──────────┘
```

## Módulos del Negocio
1. **Auth** — Autenticación, autorización, gestión de usuarios
2. **Clientes** — CRM ligero, fichas de cliente, historial
3. **Proveedores** — Catálogo de proveedores, órdenes de compra
4. **Cotizaciones** — RFQ, cotizaciones de manufactura
5. **Producción** — Órdenes de trabajo, routing, operaciones
6. **Calidad** — Control de calidad, inspecciones, defectos
7. **Inventario** — Materiales, stock, transferencias
8. **Compras** — Órdenes de compra, recepción
9. **Reportes** — KPIs, dashboards

## Flujo Principal del Negocio
```
Cliente → RFQ/Plano → Cotización → Orden de Compra (PO)
→ Orden de Trabajo (WO) → Operaciones → Calidad → Entrega
```

## Multi-sucursal
- Ciudad Juárez (Principal)
- Guadalajara
- El Paso TX

Datos aislados por sucursal a nivel de aplicación (Row-Level Security).

## Multi-moneda
- MXN (moneda base)
- USD (conversión usando Banxico FIX)
