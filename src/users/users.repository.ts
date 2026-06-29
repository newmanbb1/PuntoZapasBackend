import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class UsersRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Prisma.UsuarioCreateInput | Prisma.UsuarioUncheckedCreateInput) {
    return this.prisma.usuario.create({
      data,
    });
  }

  async findAll() {
    return this.prisma.usuario.findMany({
      select: {
        id_usuario: true,
        sucursal_id: true,
        nombre: true,
        rol: true,
        email: true,
      },
    });
  }

  async findOne(id: number) {
    return this.prisma.usuario.findUnique({
      where: { id_usuario: id },
      select: {
        id_usuario: true,
        sucursal_id: true,
        nombre: true,
        rol: true,
        email: true,
      },
    });
  }

  async update(id: number, data: Prisma.UsuarioUpdateInput | Prisma.UsuarioUncheckedUpdateInput) {
    return this.prisma.usuario.update({
      where: { id_usuario: id },
      data,
    });
  }

  async remove(id: number) {
    return this.prisma.usuario.delete({
      where: { id_usuario: id },
    });
  }
}
