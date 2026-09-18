-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'GERENTE', 'VENDEDOR', 'PRODUCCION', 'CALIDAD', 'COMPRAS', 'OPERADOR');

-- CreateEnum
CREATE TYPE "EstatusCotizacion" AS ENUM ('BORRADOR', 'ENVIADA', 'ACEPTADA', 'RECHAZADA', 'CANCELADA');

-- CreateEnum
CREATE TYPE "EstatusPO" AS ENUM ('PENDIENTE', 'APROBADA', 'EN_PRODUCCION', 'COMPLETADA', 'CANCELADA');

-- CreateEnum
CREATE TYPE "EstatusWO" AS ENUM ('PENDIENTE', 'EN_PRODUCCION', 'CALIDAD', 'COMPLETADA', 'CANCELADA');

-- CreateEnum
CREATE TYPE "EstatusOperacion" AS ENUM ('PENDIENTE', 'EN_PROCESO', 'COMPLETADA', 'RECHAZADA');

-- CreateEnum
CREATE TYPE "EstatusCalidad" AS ENUM ('APROBADO', 'RECHAZADO', 'REWORK');

-- CreateEnum
CREATE TYPE "TipoCambio" AS ENUM ('MXN', 'USD');

-- CreateEnum
CREATE TYPE "Prioridad" AS ENUM ('BAJA', 'MEDIA', 'ALTA', 'URGENTE');

-- CreateEnum
CREATE TYPE "EstatusVenta" AS ENUM ('COTIZACION', 'PENDIENTE', 'APROBADA', 'EN_PRODUCCION', 'COMPLETADA', 'CANCELADA');

-- CreateTable
CREATE TABLE "usuarios" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "apellido" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'OPERADOR',
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "ultimo_acceso" TIMESTAMP(3),
    "sucursal_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sucursales" (
    "id" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "ciudad" TEXT NOT NULL,
    "estado" TEXT NOT NULL,
    "pais" TEXT NOT NULL DEFAULT 'México',
    "direccion" TEXT,
    "telefono" TEXT,
    "moneda_default" "TipoCambio" NOT NULL DEFAULT 'MXN',
    "es_principal" BOOLEAN NOT NULL DEFAULT false,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sucursales_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clientes" (
    "id" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "razon_social" TEXT NOT NULL,
    "rfc" TEXT,
    "contacto" TEXT,
    "email" TEXT,
    "telefono" TEXT,
    "direccion" TEXT,
    "ciudad" TEXT,
    "estado" TEXT,
    "codigo_postal" TEXT,
    "pais" TEXT NOT NULL DEFAULT 'México',
    "credito_limite" DECIMAL(12,2),
    "dias_credito" INTEGER NOT NULL DEFAULT 30,
    "moneda_pref" "TipoCambio" NOT NULL DEFAULT 'MXN',
    "notas" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "clientes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "proveedores" (
    "id" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "razon_social" TEXT NOT NULL,
    "rfc" TEXT,
    "contacto" TEXT,
    "email" TEXT,
    "telefono" TEXT,
    "direccion" TEXT,
    "ciudad" TEXT,
    "estado" TEXT,
    "codigo_postal" TEXT,
    "pais" TEXT NOT NULL DEFAULT 'México',
    "dias_credito" INTEGER NOT NULL DEFAULT 30,
    "moneda_pref" "TipoCambio" NOT NULL DEFAULT 'MXN',
    "notas" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "proveedores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "empleados" (
    "id" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "apellido" TEXT NOT NULL,
    "puesto" TEXT NOT NULL,
    "email" TEXT,
    "telefono" TEXT,
    "fecha_ingreso" TIMESTAMP(3),
    "sucursal_id" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "empleados_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "maquinas" (
    "id" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "descripcion" TEXT,
    "capacidad" TEXT,
    "sucursal_id" TEXT,
    "notas" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "maquinas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "materiales" (
    "id" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "unidad" TEXT NOT NULL,
    "stock_actual" DECIMAL(12,3) NOT NULL DEFAULT 0,
    "stock_minimo" DECIMAL(12,3) NOT NULL DEFAULT 0,
    "costo_unitario" DECIMAL(12,2),
    "moneda" "TipoCambio" NOT NULL DEFAULT 'MXN',
    "proveedor_id" TEXT,
    "sucursal_id" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "notas" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "materiales_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cotizaciones" (
    "id" TEXT NOT NULL,
    "folio" TEXT NOT NULL,
    "cliente_id" TEXT NOT NULL,
    "sucursal_id" TEXT,
    "creado_por" TEXT,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "validez" INTEGER NOT NULL DEFAULT 30,
    "moneda" "TipoCambio" NOT NULL DEFAULT 'MXN',
    "tipo_cambio" DECIMAL(10,6),
    "subtotal" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "iva" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "total" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "estatus" "EstatusCotizacion" NOT NULL DEFAULT 'BORRADOR',
    "notas" TEXT,
    "archivo_plano_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cotizaciones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "detalles_cotizacion" (
    "id" TEXT NOT NULL,
    "cotizacion_id" TEXT NOT NULL,
    "pieza_nombre" TEXT NOT NULL,
    "pieza_descripcion" TEXT,
    "cantidad" INTEGER NOT NULL,
    "unidad" TEXT NOT NULL,
    "precio_unitario" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "subtotal" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "tiempo_estimado" DECIMAL(8,2),
    "proceso_requerido" TEXT,
    "archivo_plano_id" TEXT,
    "notas" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "detalles_cotizacion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ordenes_compra" (
    "id" TEXT NOT NULL,
    "folio" TEXT NOT NULL,
    "cotizacion_id" TEXT,
    "cliente_id" TEXT NOT NULL,
    "sucursal_id" TEXT,
    "creado_por" TEXT,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_entrega" TIMESTAMP(3),
    "moneda" "TipoCambio" NOT NULL DEFAULT 'MXN',
    "tipo_cambio" DECIMAL(10,6),
    "subtotal" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "iva" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "total" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "estatus" "EstatusPO" NOT NULL DEFAULT 'PENDIENTE',
    "condiciones_pago" TEXT,
    "notas" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ordenes_compra_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ordenes_compra_proveedor" (
    "id" TEXT NOT NULL,
    "orden_compra_id" TEXT NOT NULL,
    "proveedor_id" TEXT NOT NULL,
    "cantidad" DECIMAL(12,3) NOT NULL,
    "precio_unitario" DECIMAL(12,2) NOT NULL,
    "estatus" TEXT NOT NULL DEFAULT 'pendiente',
    "notas" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ordenes_compra_proveedor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ordenes_trabajo" (
    "id" TEXT NOT NULL,
    "folio" TEXT NOT NULL,
    "po_id" TEXT NOT NULL,
    "pieza_nombre" TEXT NOT NULL,
    "pieza_descripcion" TEXT,
    "cantidad" INTEGER NOT NULL,
    "unidad" TEXT NOT NULL,
    "fecha_inicio" TIMESTAMP(3),
    "fecha_fin_estimada" TIMESTAMP(3),
    "fecha_fin_real" TIMESTAMP(3),
    "estatus" "EstatusWO" NOT NULL DEFAULT 'PENDIENTE',
    "prioridad" "Prioridad" NOT NULL DEFAULT 'MEDIA',
    "notas" TEXT,
    "creado_por" TEXT,
    "sucursal_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ordenes_trabajo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "operaciones" (
    "id" TEXT NOT NULL,
    "wo_id" TEXT NOT NULL,
    "secuencia" INTEGER NOT NULL,
    "proceso" TEXT NOT NULL,
    "maquina_id" TEXT,
    "operador_id" TEXT,
    "tiempo_estimado" DECIMAL(8,2),
    "tiempo_real" DECIMAL(8,2),
    "estatus" "EstatusOperacion" NOT NULL DEFAULT 'PENDIENTE',
    "notas" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "operaciones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "control_calidad" (
    "id" TEXT NOT NULL,
    "operacion_id" TEXT NOT NULL,
    "wo_id" TEXT NOT NULL,
    "inspector_id" TEXT,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resultado" "EstatusCalidad" NOT NULL,
    "defectos" TEXT,
    "observaciones" TEXT,
    "archivo_evidencia_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "control_calidad_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "movimientos_inventario" (
    "id" TEXT NOT NULL,
    "material_id" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "cantidad" DECIMAL(12,3) NOT NULL,
    "stock_anterior" DECIMAL(12,3) NOT NULL,
    "stock_resultante" DECIMAL(12,3) NOT NULL,
    "referencia" TEXT,
    "notas" TEXT,
    "creado_por" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "movimientos_inventario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transferencias" (
    "id" TEXT NOT NULL,
    "folio" TEXT NOT NULL,
    "origen_id" TEXT NOT NULL,
    "destino_id" TEXT NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "estatus" TEXT NOT NULL DEFAULT 'PENDIENTE',
    "notas" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "transferencias_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_log" (
    "id" TEXT NOT NULL,
    "usuario_id" TEXT,
    "accion" TEXT NOT NULL,
    "entidad" TEXT NOT NULL,
    "entidad_id" TEXT,
    "datos_antes" JSONB,
    "datos_despues" JSONB,
    "ip" TEXT,
    "user_agent" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_log_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "configuracion" (
    "id" TEXT NOT NULL,
    "clave" TEXT NOT NULL,
    "valor" TEXT NOT NULL,
    "descripcion" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "configuracion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ventas" (
    "id" TEXT NOT NULL,
    "folio" TEXT NOT NULL,
    "cliente_id" TEXT NOT NULL,
    "sucursal_id" TEXT,
    "creado_por" TEXT,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_entrega" TIMESTAMP(3),
    "moneda" "TipoCambio" NOT NULL DEFAULT 'MXN',
    "tipo_cambio" DECIMAL(10,6),
    "subtotal" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "iva" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "total" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "estatus" "EstatusVenta" NOT NULL DEFAULT 'COTIZACION',
    "notas" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ventas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ventas_items" (
    "id" TEXT NOT NULL,
    "venta_id" TEXT NOT NULL,
    "pieza_nombre" TEXT NOT NULL,
    "pieza_descripcion" TEXT,
    "cantidad" INTEGER NOT NULL,
    "unidad" TEXT NOT NULL,
    "precio_unitario" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "subtotal" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "tiempo_estimado" DECIMAL(8,2),
    "proceso_requerido" TEXT,
    "notas" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ventas_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_email_key" ON "usuarios"("email");

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_username_key" ON "usuarios"("username");

-- CreateIndex
CREATE UNIQUE INDEX "sucursales_codigo_key" ON "sucursales"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "clientes_codigo_key" ON "clientes"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "proveedores_codigo_key" ON "proveedores"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "empleados_codigo_key" ON "empleados"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "maquinas_codigo_key" ON "maquinas"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "materiales_codigo_key" ON "materiales"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "cotizaciones_folio_key" ON "cotizaciones"("folio");

-- CreateIndex
CREATE UNIQUE INDEX "ordenes_compra_folio_key" ON "ordenes_compra"("folio");

-- CreateIndex
CREATE UNIQUE INDEX "ordenes_trabajo_folio_key" ON "ordenes_trabajo"("folio");

-- CreateIndex
CREATE UNIQUE INDEX "transferencias_folio_key" ON "transferencias"("folio");

-- CreateIndex
CREATE UNIQUE INDEX "configuracion_clave_key" ON "configuracion"("clave");

-- CreateIndex
CREATE UNIQUE INDEX "ventas_folio_key" ON "ventas"("folio");

-- AddForeignKey
ALTER TABLE "usuarios" ADD CONSTRAINT "usuarios_sucursal_id_fkey" FOREIGN KEY ("sucursal_id") REFERENCES "sucursales"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "materiales" ADD CONSTRAINT "materiales_proveedor_id_fkey" FOREIGN KEY ("proveedor_id") REFERENCES "proveedores"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "materiales" ADD CONSTRAINT "materiales_sucursal_id_fkey" FOREIGN KEY ("sucursal_id") REFERENCES "sucursales"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cotizaciones" ADD CONSTRAINT "cotizaciones_cliente_id_fkey" FOREIGN KEY ("cliente_id") REFERENCES "clientes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cotizaciones" ADD CONSTRAINT "cotizaciones_sucursal_id_fkey" FOREIGN KEY ("sucursal_id") REFERENCES "sucursales"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cotizaciones" ADD CONSTRAINT "cotizaciones_creado_por_fkey" FOREIGN KEY ("creado_por") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "detalles_cotizacion" ADD CONSTRAINT "detalles_cotizacion_cotizacion_id_fkey" FOREIGN KEY ("cotizacion_id") REFERENCES "cotizaciones"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ordenes_compra" ADD CONSTRAINT "ordenes_compra_cotizacion_id_fkey" FOREIGN KEY ("cotizacion_id") REFERENCES "cotizaciones"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ordenes_compra" ADD CONSTRAINT "ordenes_compra_cliente_id_fkey" FOREIGN KEY ("cliente_id") REFERENCES "clientes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ordenes_compra" ADD CONSTRAINT "ordenes_compra_sucursal_id_fkey" FOREIGN KEY ("sucursal_id") REFERENCES "sucursales"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ordenes_compra" ADD CONSTRAINT "ordenes_compra_creado_por_fkey" FOREIGN KEY ("creado_por") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ordenes_compra_proveedor" ADD CONSTRAINT "ordenes_compra_proveedor_orden_compra_id_fkey" FOREIGN KEY ("orden_compra_id") REFERENCES "ordenes_compra"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ordenes_compra_proveedor" ADD CONSTRAINT "ordenes_compra_proveedor_proveedor_id_fkey" FOREIGN KEY ("proveedor_id") REFERENCES "proveedores"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ordenes_trabajo" ADD CONSTRAINT "ordenes_trabajo_po_id_fkey" FOREIGN KEY ("po_id") REFERENCES "ordenes_compra"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ordenes_trabajo" ADD CONSTRAINT "ordenes_trabajo_creado_por_fkey" FOREIGN KEY ("creado_por") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ordenes_trabajo" ADD CONSTRAINT "ordenes_trabajo_sucursal_id_fkey" FOREIGN KEY ("sucursal_id") REFERENCES "sucursales"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "operaciones" ADD CONSTRAINT "operaciones_wo_id_fkey" FOREIGN KEY ("wo_id") REFERENCES "ordenes_trabajo"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "operaciones" ADD CONSTRAINT "operaciones_maquina_id_fkey" FOREIGN KEY ("maquina_id") REFERENCES "maquinas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "operaciones" ADD CONSTRAINT "operaciones_operador_id_fkey" FOREIGN KEY ("operador_id") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "control_calidad" ADD CONSTRAINT "control_calidad_operacion_id_fkey" FOREIGN KEY ("operacion_id") REFERENCES "operaciones"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "control_calidad" ADD CONSTRAINT "control_calidad_wo_id_fkey" FOREIGN KEY ("wo_id") REFERENCES "ordenes_trabajo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "control_calidad" ADD CONSTRAINT "control_calidad_inspector_id_fkey" FOREIGN KEY ("inspector_id") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transferencias" ADD CONSTRAINT "transferencias_origen_id_fkey" FOREIGN KEY ("origen_id") REFERENCES "sucursales"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transferencias" ADD CONSTRAINT "transferencias_destino_id_fkey" FOREIGN KEY ("destino_id") REFERENCES "sucursales"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ventas" ADD CONSTRAINT "ventas_cliente_id_fkey" FOREIGN KEY ("cliente_id") REFERENCES "clientes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ventas" ADD CONSTRAINT "ventas_sucursal_id_fkey" FOREIGN KEY ("sucursal_id") REFERENCES "sucursales"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ventas" ADD CONSTRAINT "ventas_creado_por_fkey" FOREIGN KEY ("creado_por") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ventas_items" ADD CONSTRAINT "ventas_items_venta_id_fkey" FOREIGN KEY ("venta_id") REFERENCES "ventas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

