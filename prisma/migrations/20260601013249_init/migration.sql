-- CreateTable
CREATE TABLE "sucursal" (
    "id_sucursal" SERIAL NOT NULL,
    "nombre" VARCHAR(45),
    "direccion" VARCHAR(45),
    "estado" VARCHAR(10),

    CONSTRAINT "sucursal_pkey" PRIMARY KEY ("id_sucursal")
);

-- CreateTable
CREATE TABLE "cliente" (
    "id_cliente" SERIAL NOT NULL,
    "nombre_completo" VARCHAR(45),
    "telefono" VARCHAR(9),
    "email" VARCHAR(25),
    "nit_facturacion" VARCHAR(45),

    CONSTRAINT "cliente_pkey" PRIMARY KEY ("id_cliente")
);

-- CreateTable
CREATE TABLE "categoria" (
    "id_categoria" SERIAL NOT NULL,
    "nombre" VARCHAR(25),

    CONSTRAINT "categoria_pkey" PRIMARY KEY ("id_categoria")
);

-- CreateTable
CREATE TABLE "usuario" (
    "id_usuario" SERIAL NOT NULL,
    "sucursal_id" INTEGER NOT NULL,
    "nombre" VARCHAR(100),
    "rol" VARCHAR(20),
    "email" VARCHAR(100),
    "password_hash" VARCHAR(255),

    CONSTRAINT "usuario_pkey" PRIMARY KEY ("id_usuario")
);

-- CreateTable
CREATE TABLE "gasto_operativo" (
    "id_gasto_operativo" SERIAL NOT NULL,
    "sucursal_id" INTEGER NOT NULL,
    "concepto" VARCHAR(20) NOT NULL,
    "monto" DECIMAL(10,2) NOT NULL,
    "fecha" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "gasto_operativo_pkey" PRIMARY KEY ("id_gasto_operativo")
);

-- CreateTable
CREATE TABLE "producto" (
    "id_producto" SERIAL NOT NULL,
    "categoria_id" INTEGER NOT NULL,
    "modelo" VARCHAR(25),
    "marca" VARCHAR(45),
    "costo_adquisicion" DECIMAL(10,2) NOT NULL,
    "precio_venta" DECIMAL(10,2) NOT NULL,
    "descripcion" VARCHAR(100),

    CONSTRAINT "producto_pkey" PRIMARY KEY ("id_producto")
);

-- CreateTable
CREATE TABLE "variante_producto" (
    "id_variante_producto" SERIAL NOT NULL,
    "producto_id" INTEGER NOT NULL,
    "talla" VARCHAR(2),
    "color" VARCHAR(15),
    "sku" VARCHAR(50),

    CONSTRAINT "variante_producto_pkey" PRIMARY KEY ("id_variante_producto")
);

-- CreateTable
CREATE TABLE "pedido" (
    "id_pedido" SERIAL NOT NULL,
    "cliente_id" INTEGER NOT NULL,
    "usuario_id" INTEGER,
    "fecha" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    "estado" VARCHAR(50),
    "origen" VARCHAR(50),
    "total" DECIMAL(10,2) NOT NULL,

    CONSTRAINT "pedido_pkey" PRIMARY KEY ("id_pedido")
);

-- CreateTable
CREATE TABLE "pago" (
    "id_pago" SERIAL NOT NULL,
    "pedido_id" INTEGER NOT NULL,
    "metodo" VARCHAR(25),
    "pasarela" VARCHAR(25),
    "id_transaccion_pasarela" VARCHAR(50),
    "estado_pago" VARCHAR(25),
    "comprobante_url" VARCHAR(255),
    "fecha_pago" TIMESTAMPTZ,

    CONSTRAINT "pago_pkey" PRIMARY KEY ("id_pago")
);

-- CreateTable
CREATE TABLE "detalle_pedido" (
    "id_detalle_pedido" SERIAL NOT NULL,
    "pedido_id" INTEGER NOT NULL,
    "variante_id" INTEGER NOT NULL,
    "cantidad" INTEGER,
    "precio_unitario" DECIMAL(10,2) NOT NULL,
    "subtotal" DECIMAL(10,2) NOT NULL,

    CONSTRAINT "detalle_pedido_pkey" PRIMARY KEY ("id_detalle_pedido")
);

-- CreateTable
CREATE TABLE "inventario" (
    "id_inventario" SERIAL NOT NULL,
    "variante_id" INTEGER NOT NULL,
    "sucursal_id" INTEGER NOT NULL,
    "cantidad" INTEGER,
    "nivel_minimo" INTEGER,

    CONSTRAINT "inventario_pkey" PRIMARY KEY ("id_inventario")
);

-- CreateIndex
CREATE UNIQUE INDEX "usuario_email_key" ON "usuario"("email");

-- CreateIndex
CREATE UNIQUE INDEX "variante_producto_sku_key" ON "variante_producto"("sku");

-- AddForeignKey
ALTER TABLE "usuario" ADD CONSTRAINT "usuario_sucursal_id_fkey" FOREIGN KEY ("sucursal_id") REFERENCES "sucursal"("id_sucursal") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gasto_operativo" ADD CONSTRAINT "gasto_operativo_sucursal_id_fkey" FOREIGN KEY ("sucursal_id") REFERENCES "sucursal"("id_sucursal") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "producto" ADD CONSTRAINT "producto_categoria_id_fkey" FOREIGN KEY ("categoria_id") REFERENCES "categoria"("id_categoria") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "variante_producto" ADD CONSTRAINT "variante_producto_producto_id_fkey" FOREIGN KEY ("producto_id") REFERENCES "producto"("id_producto") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pedido" ADD CONSTRAINT "pedido_cliente_id_fkey" FOREIGN KEY ("cliente_id") REFERENCES "cliente"("id_cliente") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pedido" ADD CONSTRAINT "pedido_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuario"("id_usuario") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pago" ADD CONSTRAINT "pago_pedido_id_fkey" FOREIGN KEY ("pedido_id") REFERENCES "pedido"("id_pedido") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "detalle_pedido" ADD CONSTRAINT "detalle_pedido_pedido_id_fkey" FOREIGN KEY ("pedido_id") REFERENCES "pedido"("id_pedido") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "detalle_pedido" ADD CONSTRAINT "detalle_pedido_variante_id_fkey" FOREIGN KEY ("variante_id") REFERENCES "variante_producto"("id_variante_producto") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventario" ADD CONSTRAINT "inventario_sucursal_id_fkey" FOREIGN KEY ("sucursal_id") REFERENCES "sucursal"("id_sucursal") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventario" ADD CONSTRAINT "inventario_variante_id_fkey" FOREIGN KEY ("variante_id") REFERENCES "variante_producto"("id_variante_producto") ON DELETE CASCADE ON UPDATE CASCADE;
