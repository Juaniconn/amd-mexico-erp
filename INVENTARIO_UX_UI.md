# AMD Operations ERP — Inventario UX/UI Completo

> **Proyecto:** AMD México Operations ERP  
> **Stack:** Next.js 14, Tailwind CSS, Lucide Icons  
> **Design System:** OKLCH (globals.css)  
> **Tecnología clave:** Design tokens en `@theme inline`, modo dark/light via `class`  
> **Objetivo:** Rediseño UX/UI aplicando filtro antislop (38 reglas)

---

## 🔴 PRIORIDAD 1: Layouts y Archivos Globales (afectan TODO el sistema)

| Archivo | Líneas | Propósito |
|---------|--------|-----------|
| `app/globals.css` | 344 | **Design system completo** con OKLCH colors, tokens CSS custom properties, utilidades `.brand-gradient`, `.card-premium`, `.btn-primary/outline/ghost/danger`, `.input-base`, `.section-title`, `.text-table`, animaciones fade-up/fade-in/pulse-brand, scrollbar custom. ES el corazón visual del sistema. |
| `app/layout.tsx` | 25 | Root layout mínimo. Carga `globals.css`, metadata del sitio, renderiza `<html lang="es">` con body simple. |
| `tailwind.config.ts` | 111 | Configuración Tailwind: `darkMode: ['class']`, mapeo de todos los colores CSS vars (brand, sidebar, success, warning, danger, etc.), border-radius dinámicos, animaciones fade-up/fade-in/pulse-brand, fuentes Geist. Plugin: `tailwindcss-animate`. |

---

## 🟠 PRIORIDAD 2: Componentes de Layout / Shell (estructura de navegación)

| Archivo | Líneas | Propósito |
|---------|--------|-----------|
| `components/Sidebar.tsx` | 283 | **Triple export:** `Sidebar` (desktop fijo w-64), `MobileSidebar` (overlay), `Header` (sticky top). Contiene navegación completa del ERP: 8 secciones (Dashboard, Operaciones, Producción, Ingeniería, Calidad, Infraestructura, Sistema). Header tiene buscador (⌘K), notificaciones, theme toggle, user dropdown con logout. |
| `components/AppLayout.tsx` | 198 | **Wrapper de autenticación.** Verifica token en localStorage, redirige a `/login`. Renderiza Sidebar + Header + main content. Gestiona estado de notificaciones, search modal, y tema. ES el layout que envuelve todas las páginas internas. |
| `app/(auth)/login/page.tsx` | 158 | **Página de login.** Formulario email/password, submit a `/api/auth/login`, guarda tokens en localStorage + cookies, redirige a `/?token=...`. UI con brand-gradient logo, inputs estilizados. |
| `app/test/page.tsx` | 39 | **Test page** (hardcoded). Botón para testear API de login. NO pertenece al flujo real. |

---

## 🟡 PRIORIDAD 3: Componentes UI Compartidos (shadcn-style)

| Archivo | Líneas | Propósito |
|---------|--------|-----------|
| `components/ui/button.tsx` | 45 | **Button con variantes:** default, destructive, outline, secondary, ghost, link. Tamaños: default/sm/lg/icon/icon-sm/icon-lg. Soporte `loading` state con spinner. Usa `cn()` para compose. |
| `components/ui/table.tsx` | 55 | **Sistema de tablas:** `TableContainer`, `Table`, `TableHeader`, `TableBody`, `TableRow`, `TableHead`, `TableCell`, `TableFooter`. Usa `.premium-table` class. |
| `components/ui/dialog.tsx` | 56 | **Dialog/Modal** custom: `Dialog`, `DialogContent`, `DialogHeader`, `DialogTitle`, `DialogFooter`. Overlay con backdrop, cerrable. |
| `components/ui/badge.tsx` | 30 | **Badge** con variantes: default, secondary, destructive, outline, ghost, link, success, warning. |
| `components/ui/input.tsx` | 25 | **Input** base estilizado con focus ring y disabled state. |
| `components/ui/label.tsx` | 24 | **Label** con peer-disabled styling. |
| `components/Card.tsx` | 53 | **Card compound component:** `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter`. Usa `ring-1 ring-foreground/10`, `rounded-xl`. |
| `components/StatCard.tsx` | 60 | **StatCard + StatGrid** para dashboards. Props: title, value, icon, trend, variant (default/success/warning/danger/brand). Grid responsive 2/3/4 cols. |
| `components/SearchFilterBar.tsx` | 42 | **Barra búsqueda + filtros.** Input con lupa + slot para filtros. Usa `.card-premium` y `.input-base`. |
| `components/States.tsx` | 60 | **Estados vacío/loading/error:** `EmptyState`, `LoadingState`, `ErrorState`. |
| `components/FormModal.tsx` | 33 | **Modal genérico para formularios.** Backdrop blur, animación fade-up, close button. |

---

## 🟢 PRIORIDAD 4: Utilidades y Tipos

| Archivo | Líneas | Propósito |
|---------|--------|-----------|
| `lib/utils.ts` | 6 | `cn()` helper (clsx + twMerge). |
| `lib/api.ts` | 216 | **API Client completo.** `apiClient` con auth Bearer token. Funciones `get/post/put/del/patch`. Tipos exportados: `OrdenTrabajo`, `ParteOT`, `Factura`. Helpers de Ingeniería: `getIngenieriaProyectos`, `createIngenieriaProyecto`, etc. |
| `types/index.ts` | 368 | **Tipos TypeScript completos:** User, Cliente, Sucursal, Cotizacion, Proveedor, OrdenCompra, Material, ParteOT, DetalleCotizacion, OrdenTrabajo, etc. |
| `types/ingenieria.ts` | 94 | **Tipos Ingeniería:** EnumIngenieriaEstatus, IngenieriaProceso, IngenieriaPlano, IngenieriaProyecto. |

---

## 🔵 PRIORIDAD 5: Páginas por Módulo (Page Components)

### 📊 Dashboard / Home

| Archivo | Líneas | Tamaño | Propósito |
|---------|--------|--------|-----------|
| `app/page.tsx` | 350 | 12KB | **Dashboard principal.** Grid de StatCards (clientes, cotizaciones, OC, OT, materiales, proveedores, operaciones). Feed de actividad reciente + alertas. Sidebar con shortcuts. Usa StatGrid, StatCard, Card. |

### 👥 Clientes

| Archivo | Líneas | Tamaño | Propósito |
|---------|--------|--------|-----------|
| `app/clientes/page.tsx` | 803 | 28KB | **CRUD completo de clientes.** Lista paginada con búsqueda/filtros. Form modal para crear/editar. Campos: código, razón social, RFC, contacto, email, teléfono, dirección, crédito. Estadísticas (total, activos, nuevos mes). |

### 📄 Cotizaciones

| Archivo | Líneas | Tamaño | Propósito |
|---------|--------|--------|-----------|
| `app/cotizaciones/page.tsx` | 1,173 | 47KB | **Módulo cotizaciones.** CRUD completo. Filtros por estatus (Borrador, Enviada, En Revisión, Aprobada, Rechazada). Form modal con líneas de detalle (descripción, cantidad, unidad, precio). |
| `app/cotizaciones/[id]/page.tsx` | 746 | 29KB | **Detalle de cotización.** Vista completa: info general, detalles (partes), historial, acciones (editar, enviar, aprobar, rechazar). Tabla de partes. |

### 🏭 Producción

| Archivo | Líneas | Tamaño | Propósito |
|---------|--------|--------|-----------|
| `app/produccion/page.tsx` | 881 | 34KB | **Órdenes de Trabajo (OT) lista.** CRUD completo. Filtros por estatus (Pendiente, En Producción, Calidad, Completada, Cancelada). Form con campos: pieza, cantidad, unidad, fechas, prioridad, responsable. |
| `app/produccion/ot/[id]/page.tsx` | 647 | 21KB | **Detalle de OT.** Info de la orden + tabla de Partes (ParteOT). Tracking de estatus por parte: Pendiente → En Proceso → Completada → Inspección → Aprobada/Rechazada. Asignación de operador y máquina. |

### 📦 Inventario

| Archivo | Líneas | Tamaño | Propósito |
|---------|--------|--------|-----------|
| `app/inventario/page.tsx` | 956 | 38KB | **Materiales/Productos lista.** CRUD. Búsqueda + filtro por categoría (Material, Producto, Servicio). Campos: código, descripción, tipo, unidad, stock actual, stock mínimo, costo, moneda. Indicador de stock bajo. |
| `app/inventario/[id]/page.tsx` | 411 | 16KB | **Detalle de material.** Vista edición in-place: descripción, tipo, unidad, stock, costo, notas. Indicadores de estado (stock bajo, inactivo). |

### 🛒 Compras

| Archivo | Líneas | Tamaño | Propósito |
|---------|--------|--------|-----------|
| `app/compras/page.tsx` | 1,147 | 46KB | **Órdenes de compra.** CRUD completo. Filtros por estatus. Form multi-proveedor: permite asignar múltiples proveedores con cantidad, precio unitario, subtotal. Resumen de totales. |
| `app/compras/[id]/page.tsx` | 397 | 16KB | **Detalle de orden compra.** Vista/edición: info de cliente, fecha entrega, moneda, proveedores asignados, totales (subtotal, IVA, total). |

### 🏭 Proveedores

| Archivo | Líneas | Tamaño | Propósito |
|---------|--------|--------|-----------|
| `app/proveedores/page.tsx` | 1,007 | 36KB | **CRUD proveedores.** Lista con búsqueda/filtros. Form: código, razón social, RFC, contacto, email, teléfono, dirección, crédito, moneda. Estadísticas de órdenes de compra. |

### ✅ Calidad

| Archivo | Líneas | Tamaño | Propósito |
|---------|--------|--------|-----------|
| `app/calidad/page.tsx` | 919 | 33KB | **Inspecciones de calidad.** CRUD. Filtros por estatus. Form: referencia a OT/WO, proceso, estatus, porcentaje aprobación, notas, inspector. Seguimiento de aprobación/rechazo. |

### 📊 Reportes

| Archivo | Líneas | Tamaño | Propósito |
|---------|--------|--------|-----------|
| `app/reportes/page.tsx` | 677 | 25KB | **Dashboard de reportes.** Métricas por módulo con gráficos. Estadísticas de cotizaciones por estatus, tendencias, KPUs. Usa LoadingState, ErrorState, SearchFilterBar. |

### 🧾 Facturación

| Archivo | Líneas | Tamaño | Propósito |
|---------|--------|--------|-----------|
| `app/facturacion/page.tsx` | 591 | 22KB | **Facturación.** CRUD facturas. Filtros: estatus (Pendiente, Facturada, Cancelada), moneda. Colores hardcoded (yellow/green/red) NO usa design tokens. Crear factura desde OT. |

### 🔧 Ingeniería / Diseño

| Archivo | Líneas | Tamaño | Propósito |
|---------|--------|--------|-----------|
| `app/ingenieria/page.tsx` | 257 | 9KB | **Proyectos de ingeniería.** Lista con estatus workflow: Pendiente Planos → En Diseño → Listo Cotizar → Cotizado → En Producción → Liberado / Obsoleto. |
| `app/ingenieria/[id]/page.tsx` | 423 | 16KB | **Detalle de proyecto.** Info general, procesos (ruta de fabricación), planos, historial. Upload de planos. |
| `app/ingenieria/components/UploadPlanoModal.tsx` | 155 | 4.5KB | **Modal upload planos.** Form con número de parte, version, file picker. Submit multipart a `/api/ingenieria/[id]/planos`. |

### 🖥️ VPS (Infraestructura)

| Archivo | Líneas | Tamaño | Propósito |
|---------|--------|--------|-----------|
| `app/vps/page.tsx` | 231 | 10KB | **Monitor de servidores VPS.** Métricas de sistema: uptime, memoria, CPU, load average. Parseo de `df -h` y `free -m`. Tabla de discos, contenedores Docker (parseo de `docker ps`). |

### 👤 Usuarios

| Archivo | Líneas | Tamaño | Propósito |
|---------|--------|--------|-----------|
| `app/usuarios/page.tsx` | 879 | 32KB | **Gestión de usuarios.** CRUD. Lista con búsqueda/filtros. Form: email, nombre, apellido, username, role, sucursal. Estadísticas (total, activos, por rol). |

---

## 📋 Resumen de Métricas

| Categoría | Archivos | Líneas totales |
|-----------|----------|----------------|
| **Globales (CSS + Tailwind + Layout)** | 3 | ~480 |
| **Layout Shell (Sidebar + AppLayout)** | 2 | ~481 |
| **Componentes UI compartidos** | 11 | ~493 |
| **Páginas de módulo** | 18 | ~12,000+ |
| **Utilidades y Tipos** | 4 | ~684 |
| **TOTAL** | **38** | **~14,138** |

---

## ⚠️ Hallazgos Clave para Rediseño UX/UI

1. **Botones duales:** Existen tanto `Button` (ui/button.tsx) como `.btn-primary/outline/ghost/danger` (globals.css). Usar solo uno.
2. **Inputs duales:** Existe `Input` (ui/input.tsx) vs `.input-base` (globals.css). Unificar.
3. **Colores hardcoded:** `facturacion/page.tsx` usa `bg-yellow-100 text-yellow-800` en vez de design tokens.
4. **Páginas sin paginación visible:** Algunas listas no muestran controles de paginación clara.
5. **Loading/Skeleton states:** Usa `LoadingState` componente pero no skeletons diferenciados.
6. **Responsive:** Sidebar se oculta en lg, header mobile incluido.
7. **Accesibilidad:** Faltan aria-labels, focus management en modales, skip links.
8. **Empty states:** Usa `EmptyState` pero algunas páginas no lo implementan.
9. **Test page residual:** `app/test/page.tsx` no debería ir a producción.
10. **Notificaciones hardcodeadas:** `AppLayout` usa sample notifications estáticas.

---

## 📁 Estructura de Carpetas Final

```
app/
├── globals.css              ← Design system OKLCH
├── layout.tsx               ← Root layout
├── page.tsx                 ← Dashboard
├── (auth)/
│   └── login/page.tsx       ← Login
├── calidad/page.tsx         ← Inspecciones calidad
├── clientes/page.tsx        ← CRUD clientes
├── compras/
│   ├── page.tsx             ← Órdenes de compra
│   └── [id]/page.tsx        ← Detalle OC
├── cotizaciones/
│   ├── page.tsx             ← Lista cotizaciones
│   └── [id]/page.tsx        ← Detalle cotización
├── facturacion/page.tsx     ← Facturación
├── ingenieria/
│   ├── page.tsx             ← Proyectos ingeniería
│   ├── [id]/page.tsx        ← Detalle proyecto
│   └── components/
│       └── UploadPlanoModal.tsx
├── inventario/
│   ├── page.tsx             ← Materiales
│   └── [id]/page.tsx        ← Detalle material
├── produccion/
│   ├── page.tsx             ← Órdenes de trabajo
│   └── ot/[id]/page.tsx     ← Detalle OT
├── proveedores/page.tsx     ← CRUD proveedores
├── reportes/page.tsx        ← Dashboard reportes
├── usuarios/page.tsx        ← CRUD usuarios
├── vps/page.tsx             ← Monitor servidores
└── test/page.tsx            ← Test (remover)

components/
├── AppLayout.tsx            ← Auth wrapper + shell
├── Card.tsx                 ← Card compound component
├── FormModal.tsx            ← Modal genérico
├── SearchFilterBar.tsx      ← Barra búsqueda
├── Sidebar.tsx              ← Sidebar + Header + Mobile
├── StatCard.tsx             ← Dashboard stats
├── States.tsx               ← Empty/Loading/Error
└── ui/
    ├── badge.tsx            ← Badge
    ├── button.tsx           ← Button shadcn
    ├── dialog.tsx           ← Dialog/Modal
    ├── input.tsx            ← Input
    ├── label.tsx            ← Label
    └── table.tsx            ← Sistema tablas

lib/
├── api.ts                   ← API Client + tipos
└── utils.ts                 ← cn() helper

tailwind.config.ts           ← Config Tailwind
types/
├── index.ts                 ← Tipos principales
└── ingenieria.ts            ← Tipos ingeniería
```
