import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CategoriasService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.categoria.findMany({
      orderBy: { id_categoria: 'asc' }
    });
  }

  create(data: any) {
    return this.prisma.categoria.create({
      data: { nombre: data.nombre }
    });
  }

  update(id: number, data: any) {
    return this.prisma.categoria.update({
      where: { id_categoria: id },
      data: { nombre: data.nombre }
    });
  }

  remove(id: number) {
    return this.prisma.categoria.delete({
      where: { id_categoria: id }
    });
  }
}
