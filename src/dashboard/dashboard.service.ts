import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getStats() {
    const totalPedidos = await this.prisma.pedido.count();
    const ventasTotales = await this.prisma.pedido.aggregate({
      _sum: { total: true },
    });
    const totalProductos = await this.prisma.producto.count();

    const inventarios = await this.prisma.inventario.findMany();
    const alertas = inventarios.filter(i => (i.cantidad || 0) <= (i.nivel_minimo || 0)).length;

    return {
      ventas_totales: ventasTotales._sum.total || 0,
      total_pedidos: totalPedidos,
      total_productos: totalProductos,
      alertas_stock: alertas
    };
  }

  async getVentasRecientes() {
    return this.prisma.pedido.findMany({
      take: 5,
      orderBy: { fecha: 'desc' },
      include: { cliente: true }
    });
  }
}
