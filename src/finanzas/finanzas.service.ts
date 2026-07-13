import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FinanzasService {
  constructor(private prisma: PrismaService) {}

  async getResumen() {
    const pedidos = await this.prisma.pedido.aggregate({
      _sum: { total: true },
    });

    const gastos = await this.prisma.gastoOperativo.aggregate({
      _sum: { monto: true }
    });

    const ingresos = Number(pedidos._sum.total || 0);
    const egresos = Number(gastos._sum.monto || 0);
    const costos = ingresos * 0.4;
    
    // Generar historial mensual
    const allPedidos = await this.prisma.pedido.findMany({
      select: { total: true, fecha: true, estado: true }
    });
    
    const allGastos = await this.prisma.gastoOperativo.findMany({
      select: { monto: true, fecha: true }
    });

    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const currentYear = new Date().getFullYear();
    
    const historialMap = months.map(month => ({
      name: month,
      ingresos: 0,
      costo: 0,
      operativo: 0
    }));

    allPedidos.forEach(p => {
      if (p.fecha && p.fecha.getFullYear() === currentYear && p.estado !== 'CANCELADO') {
        const monthIndex = p.fecha.getMonth();
        historialMap[monthIndex].ingresos += Number(p.total);
        historialMap[monthIndex].costo += Number(p.total) * 0.4;
      }
    });

    allGastos.forEach(g => {
      if (g.fecha && g.fecha.getFullYear() === currentYear) {
        const monthIndex = g.fecha.getMonth();
        historialMap[monthIndex].operativo += Number(g.monto);
      }
    });

    const currentMonth = new Date().getMonth();
    const historial = historialMap.slice(0, Math.max(7, currentMonth + 1)); // Show at least 7 months

    return {
      ingresos,
      costos,
      gastos_operativos: egresos,
      utilidad_neta: ingresos - egresos - costos,
      historial
    };
  }
}
