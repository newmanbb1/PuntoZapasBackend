/*
  Warnings:

  - The `metodo` column on the `pago` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `pasarela` column on the `pago` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `estado_pago` column on the `pago` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `estado` column on the `pedido` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `origen` column on the `pedido` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `rol` column on the `usuario` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "RolUsuario" AS ENUM ('ADMIN', 'VENDEDOR');

-- CreateEnum
CREATE TYPE "EstadoPedido" AS ENUM ('PENDIENTE', 'PAGADO', 'ENTREGADO', 'CANCELADO');

-- CreateEnum
CREATE TYPE "OrigenPedido" AS ENUM ('E_COMMERCE', 'POS_TIENDA');

-- CreateEnum
CREATE TYPE "MetodoPago" AS ENUM ('QR', 'TARJETA', 'EFECTIVO');

-- CreateEnum
CREATE TYPE "PasarelaPago" AS ENUM ('PAGOSNET', 'LIBELULA', 'NA');

-- CreateEnum
CREATE TYPE "EstadoPago" AS ENUM ('PENDIENTE', 'COMPLETADO', 'FALLIDO');

-- AlterTable
ALTER TABLE "pago" DROP COLUMN "metodo",
ADD COLUMN     "metodo" "MetodoPago",
DROP COLUMN "pasarela",
ADD COLUMN     "pasarela" "PasarelaPago",
DROP COLUMN "estado_pago",
ADD COLUMN     "estado_pago" "EstadoPago";

-- AlterTable
ALTER TABLE "pedido" DROP COLUMN "estado",
ADD COLUMN     "estado" "EstadoPedido",
DROP COLUMN "origen",
ADD COLUMN     "origen" "OrigenPedido";

-- AlterTable
ALTER TABLE "usuario" DROP COLUMN "rol",
ADD COLUMN     "rol" "RolUsuario";
