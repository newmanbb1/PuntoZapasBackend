import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findByEmail(email: string) {
    return this.prisma.usuario.findUnique({
      where: { email },
      include: { sucursal: true }
    });
  }

  async create(data: any) {
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(data.password, salt);

    return this.prisma.usuario.create({
      data: {
        nombre: data.nombre,
        email: data.email,
        password_hash,
        rol: data.rol || 'cajero',
        sucursal_id: Number(data.sucursal_id) || 1,
      },
    });
  }

  async findAll() {
    const users = await this.prisma.usuario.findMany({
      include: { sucursal: true },
      orderBy: { id_usuario: 'desc' }
    });
    // Remove password_hash from the response
    return users.map(user => {
      const { password_hash, ...result } = user;
      return result;
    });
  }

  async update(id: number, data: any) {
    const updateData: any = {
      nombre: data.nombre,
      email: data.email,
      rol: data.rol,
      sucursal_id: data.sucursal_id ? Number(data.sucursal_id) : undefined,
    };

    if (data.password) {
      const salt = await bcrypt.genSalt(10);
      updateData.password_hash = await bcrypt.hash(data.password, salt);
    }

    const updated = await this.prisma.usuario.update({
      where: { id_usuario: id },
      data: updateData,
    });
    
    const { password_hash, ...result } = updated;
    return result;
  }

  async remove(id: number) {
    return this.prisma.usuario.delete({
      where: { id_usuario: id },
    });
  }
}
