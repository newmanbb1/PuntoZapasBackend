import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateProductoDto } from './dto/create-producto.dto';
import { UpdateProductoDto } from './dto/update-producto.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProductosService {
  constructor(private prisma: PrismaService) {}

  async create(createProductoDto: CreateProductoDto) {
    return this.prisma.producto.create({
      data: createProductoDto,
    });
  }

  async findAll(page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;
    
    const [data, total] = await Promise.all([
      this.prisma.producto.findMany({
        skip,
        take: limit,
        include: {
          categoria: true,
          variantes: {
            include: {
              inventarios: true
            }
          }
        }
      }),
      this.prisma.producto.count()
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

  async findOne(id: number) {
    const producto = await this.prisma.producto.findUnique({
      where: { id_producto: id },
      include: {
        categoria: true,
        variantes: {
          include: {
            inventarios: true
          }
        }
      }
    });

    if (!producto) {
      throw new NotFoundException(`Producto #${id} no encontrado`);
    }

    return producto;
  }

  async update(id: number, updateProductoDto: UpdateProductoDto) {
    await this.findOne(id);
    return this.prisma.producto.update({
      where: { id_producto: id },
      data: updateProductoDto,
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.producto.delete({
      where: { id_producto: id },
    });
  }
}
