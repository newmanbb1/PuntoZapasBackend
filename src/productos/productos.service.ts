import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { CreateProductoDto } from './dto/create-producto.dto';
import { UpdateProductoDto } from './dto/update-producto.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProductosService {
  constructor(private prisma: PrismaService) {}

  private buildSku(marca: string, modelo: string, talla: string, color: string): string {
    const prefix = `${marca}-${modelo}-${talla}-${color}`
      .replace(/[^a-zA-Z0-9]/g, '-')
      .toUpperCase()
      .slice(0, 45);
    return `${prefix}-${Date.now().toString(36).slice(-4)}`;
  }

  async create(createProductoDto: CreateProductoDto) {
    const { talla, color, sucursal_id, cantidad, nivel_minimo, ...productData } = createProductoDto;

    if (!talla || !color || !sucursal_id) {
      throw new BadRequestException('Debe indicar talla, color y sucursal para crear el inventario inicial');
    }

    const sku = this.buildSku(productData.marca, productData.modelo, talla, color);

    return this.prisma.producto.create({
      data: {
        ...productData,
        en_oferta: productData.en_oferta ?? false,
        variantes: {
          create: [{
            talla,
            color,
            sku,
            inventarios: {
              create: [{
                sucursal_id,
                cantidad: cantidad ?? 0,
                nivel_minimo: nivel_minimo ?? 5,
              }],
            },
          }],
        },
      },
      include: {
        categoria: true,
        variantes: {
          include: { inventarios: true },
        },
      },
    });
  }

  async findAll(page: number = 1, limit: number = 20, enOferta?: boolean) {
    const skip = (page - 1) * limit;
    const where = enOferta !== undefined ? { en_oferta: enOferta } : undefined;

    const [data, total] = await Promise.all([
      this.prisma.producto.findMany({
        where,
        skip,
        take: limit,
        include: {
          categoria: true,
          variantes: {
            include: {
              inventarios: true,
            },
          },
        },
      }),
      this.prisma.producto.count({ where }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        lastPage: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: number) {
    const producto = await this.prisma.producto.findUnique({
      where: { id_producto: id },
      include: {
        categoria: true,
        variantes: {
          include: {
            inventarios: true,
          },
        },
      },
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
      include: {
        categoria: true,
        variantes: {
          include: { inventarios: true },
        },
      },
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.producto.delete({
      where: { id_producto: id },
    });
  }
}
