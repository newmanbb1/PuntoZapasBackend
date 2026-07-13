import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SucursalesService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.sucursal.findMany({
      orderBy: { id_sucursal: 'asc' }
    });
  }

  create(data: any) {
    return this.prisma.sucursal.create({
      data: {
        nombre: data.nombre,
        direccion: data.direccion,
        estado: data.estado || 'ACTIVO'
      }
    });
  }

  update(id: number, data: any) {
    return this.prisma.sucursal.update({
      where: { id_sucursal: id },
      data: {
        nombre: data.nombre,
        direccion: data.direccion,
        estado: data.estado
      }
    });
  }

  remove(id: number) {
    return this.prisma.sucursal.delete({
      where: { id_sucursal: id }
    });
  }
}
