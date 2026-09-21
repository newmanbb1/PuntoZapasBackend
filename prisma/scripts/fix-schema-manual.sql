-- Parche de emergencia si aún no hiciste git pull con la migración 20260921000000
-- Ejecutar: sudo -u postgres psql -d punto_zapas -f prisma/scripts/fix-schema-manual.sql

ALTER TABLE "producto" ADD COLUMN IF NOT EXISTS "imagenes" TEXT[];
ALTER TABLE "producto" ADD COLUMN IF NOT EXISTS "en_oferta" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "producto" ADD COLUMN IF NOT EXISTS "video_url" VARCHAR(512);
ALTER TABLE "producto" ADD COLUMN IF NOT EXISTS "video_card_url" VARCHAR(512);

CREATE INDEX IF NOT EXISTS "producto_marca_idx" ON "producto"("marca");
CREATE INDEX IF NOT EXISTS "producto_categoria_id_idx" ON "producto"("categoria_id");

\echo 'Schema parcheado. Columnas de producto:'
SELECT column_name FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'producto' ORDER BY ordinal_position;
