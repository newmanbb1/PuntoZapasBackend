import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class GastosService {
  constructor(private prisma: PrismaService) {}

  create(data: any) {
    return this.prisma.gastoOperativo.create({ data });
  }

  findAll() {
    return this.prisma.gastoOperativo.findMany({
      include: { sucursal: true },
      orderBy: { fecha: 'desc' }
    });
  }
}
