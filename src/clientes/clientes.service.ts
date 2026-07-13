import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ClientesService {
  constructor(private prisma: PrismaService) {}

  create(createClienteDto: any) {
    return this.prisma.cliente.create({
      data: {
        nombre_completo: createClienteDto.nombre_completo,
        email: createClienteDto.email,
        telefono: createClienteDto.telefono,
        nit_facturacion: createClienteDto.nit_facturacion
      }
    });
  }

  findAll() {
    return this.prisma.cliente.findMany();
  }

  findOne(id: number) {
    return this.prisma.cliente.findUnique({ where: { id_cliente: id } });
  }

  update(id: number, updateClienteDto: any) {
    return this.prisma.cliente.update({
      where: { id_cliente: id },
      data: updateClienteDto
    });
  }

  remove(id: number) {
    return this.prisma.cliente.delete({ where: { id_cliente: id } });
  }
}
