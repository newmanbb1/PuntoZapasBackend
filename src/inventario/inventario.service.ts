import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class InventarioService {
  constructor(private prisma: PrismaService) {}

  async findAll(page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;
    
    const [data, total] = await Promise.all([
      this.prisma.inventario.findMany({
        skip,
        take: limit,
        include: {
          variante: {
            include: {
              producto: true
            }
          },
          sucursal: true
        }
      }),
      this.prisma.inventario.count()
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        lastPage: Math.ceil(total / limit)
      }
    };
  }

  create(data: any) {
    return this.prisma.inventario.create({ data });
  }

  getAlerts() {
    return this.getAlertasStock();
  }

  async getAlertasStock() {
    const all = await this.prisma.inventario.findMany({
      include: {
        variante: {
          include: { producto: true }
        },
        sucursal: true
      }
    });
    // Filtramos en memoria para compatibilidad
    return all.filter(item => (item.cantidad || 0) <= (item.nivel_minimo || 0));
  }
  update(id: number, data: any) {
    return this.prisma.inventario.update({
      where: { id_inventario: id },
      data
    });
  }
}
