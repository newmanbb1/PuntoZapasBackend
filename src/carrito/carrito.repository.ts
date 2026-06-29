import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CarritoRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findInventario(varianteId: number, sucursalId: number) {
    return this.prisma.inventario.findFirst({
      where: {
        variante_id: varianteId,
        sucursal_id: sucursalId,
      },
    });
  }
}
