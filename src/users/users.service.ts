import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    let { password_hash, ...rest } = createUserDto;
    
    if (password_hash) {
      const salt = await bcrypt.genSalt();
      password_hash = await bcrypt.hash(password_hash, salt);
    }

    return this.prisma.usuario.create({
      data: {
        ...rest,
        password_hash,
      },
    });
  }

  findAll() {
    return this.prisma.usuario.findMany({
      select: {
        id_usuario: true,
        sucursal_id: true,
        nombre: true,
        rol: true,
        email: true,
      }
    });
  }

  async findOne(id: number) {
    const user = await this.prisma.usuario.findUnique({
      where: { id_usuario: id },
      select: {
        id_usuario: true,
        sucursal_id: true,
        nombre: true,
        rol: true,
        email: true,
      }
    });

    if (!user) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }
    return user;
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    let { password_hash, ...rest } = updateUserDto;
    
    const data: any = { ...rest };
    
    if (password_hash) {
      const salt = await bcrypt.genSalt();
      data.password_hash = await bcrypt.hash(password_hash, salt);
    }

    try {
      return await this.prisma.usuario.update({
        where: { id_usuario: id },
        data,
      });
    } catch (error) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }
  }

  async remove(id: number) {
    try {
      return await this.prisma.usuario.delete({
        where: { id_usuario: id },
      });
    } catch (error) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }
  }
}
