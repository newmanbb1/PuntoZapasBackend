import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductoDto } from './dto/create-producto.dto';
import { UpdateProductoDto } from './dto/update-producto.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class ProductosRepository {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateProductoDto) {
    return this.prisma.$transaction(async (tx) => {
      // 1. Create the Product
      const producto = await tx.producto.create({
        data: {
          categoria_id: data.categoria_id,
          modelo: data.modelo,
          marca: data.marca,
          costo_adquisicion: data.costo_adquisicion,
          precio_venta: data.precio_venta,
          descripcion: data.descripcion,
        },
      });

      // 2. For each Variante, create it and its inventories
      if (data.variantes && data.variantes.length > 0) {
        for (const varianteData of data.variantes) {
          const variante = await tx.varianteProducto.create({
            data: {
              producto_id: producto.id_producto,
              talla: varianteData.talla,
              color: varianteData.color,
              sku: varianteData.sku,
            },
          });

          if (varianteData.inventarios && varianteData.inventarios.length > 0) {
            for (const invData of varianteData.inventarios) {
              await tx.inventario.create({
                data: {
                  variante_id: variante.id_variante_producto,
                  sucursal_id: invData.sucursal_id,
                  cantidad: invData.cantidad || 0,
                  nivel_minimo: invData.nivel_minimo || 0,
                },
              });
            }
          }
        }
      }

      // 3. Return the fully hydrated product
      return tx.producto.findUnique({
        where: { id_producto: producto.id_producto },
        include: {
          variantes: {
            include: {
              inventarios: true,
            },
          },
        },
      });
    });
  }

  async findAll(where?: Prisma.ProductoWhereInput) {
    return this.prisma.producto.findMany({
      where,
      include: {
        variantes: {
          include: {
            inventarios: true,
          },
        },
      },
    });
  }

  async findOne(id: number) {
    return this.prisma.producto.findUnique({
      where: { id_producto: id },
      include: {
        variantes: {
          include: {
            inventarios: true,
          },
        },
      },
    });
  }

  async update(id: number, data: UpdateProductoDto) {
    // Basic update for product fields. Nested updates require more complex logic.
    return this.prisma.producto.update({
      where: { id_producto: id },
      data: {
        categoria_id: data.categoria_id,
        modelo: data.modelo,
        marca: data.marca,
        costo_adquisicion: data.costo_adquisicion,
        precio_venta: data.precio_venta,
        descripcion: data.descripcion,
      },
    });
  }

  async remove(id: number) {
    return this.prisma.producto.delete({
      where: { id_producto: id },
    });
  }
}
