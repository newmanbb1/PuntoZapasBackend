-- Verificación manual: columnas de producto vs schema.prisma
-- Ejecutar: sudo -u postgres psql -d punto_zapas -f prisma/scripts/verify-schema.sql

\echo '=== Tablas ==='
SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;

\echo '=== Columnas de producto ==='
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'producto'
ORDER BY ordinal_position;

\echo '=== Columnas esperadas en producto ==='
-- id_producto, categoria_id, modelo, marca, costo_adquisicion, precio_venta,
-- descripcion, imagenes, en_oferta, video_url, video_card_url
