-- AlterTable: columna en_oferta (faltaba en BD vs schema.prisma)
ALTER TABLE "producto" ADD COLUMN IF NOT EXISTS "en_oferta" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex: índices definidos en schema.prisma
CREATE INDEX IF NOT EXISTS "producto_marca_idx" ON "producto"("marca");
CREATE INDEX IF NOT EXISTS "producto_categoria_id_idx" ON "producto"("categoria_id");
