import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { ProductosRepository } from './productos.repository';
import { CreateProductoDto } from './dto/create-producto.dto';
import { UpdateProductoDto } from './dto/update-producto.dto';
import { FiltroProductoDto } from './dto/filtro-producto.dto';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class ProductosService {
  constructor(
    private readonly productosRepository: ProductosRepository,
    private readonly prisma: PrismaService,
  ) {}

  async create(createProductoDto: CreateProductoDto) {
    // Validar Categoría de forma optimizada
    const categoriaExiste = await this.prisma.categoria.findUnique({
      where: { id_categoria: createProductoDto.categoria_id },
      select: { id_categoria: true }, // Optimización: Solo traemos el ID, no toda la fila
    });
    
    if (!categoriaExiste) {
      throw new NotFoundException(`La categoría con ID ${createProductoDto.categoria_id} no fue encontrada.`);
    }

    // Validar Sucursales si vienen inventarios
    if (createProductoDto.variantes) {
      for (const variante of createProductoDto.variantes) {
        if (variante.inventarios) {
          for (const inventario of variante.inventarios) {
            const sucursalExiste = await this.prisma.sucursal.findUnique({
              where: { id_sucursal: inventario.sucursal_id }
            });
            if (!sucursalExiste) {
              throw new BadRequestException(`La sucursal con ID ${inventario.sucursal_id} no existe.`);
            }
          }
        }
      }
    }

    return this.productosRepository.create(createProductoDto);
  }

  async listarProductos(filtros: FiltroProductoDto) {
    const where: Prisma.ProductoWhereInput = {};

    // 1. Filtro dinámico: categoría (Optimizado usando relaciones)
    if (filtros.category) {
      where.categoria = {
        nombre: { equals: filtros.category, mode: 'insensitive' }
      };
    }

    // 2. Filtro dinámico: marca
    if (filtros.marca) {
      where.marca = { contains: filtros.marca, mode: 'insensitive' };
    }

    // 3. Filtro dinámico: precio máximo
    if (filtros.maxPrice !== undefined) {
      where.precio_venta = { lte: filtros.maxPrice };
    }

    // Al construir dinámicamente el objeto "where", si viene vacío (es decir {}), 
    // Prisma por defecto omite el WHERE en SQL y retorna todos los registros, evitando errores.
    return this.productosRepository.findAll(where);
  }

  async findOne(id: number) {
    const producto = await this.productosRepository.findOne(id);
    if (!producto) {
      throw new NotFoundException(`El producto con ID ${id} no fue encontrado.`);
    }
    return producto;
  }

  async update(id: number, updateProductoDto: UpdateProductoDto) {
    await this.findOne(id); // Valida existencia
    
    if (updateProductoDto.categoria_id) {
       const categoriaExiste = await this.prisma.categoria.findUnique({
         where: { id_categoria: updateProductoDto.categoria_id },
         select: { id_categoria: true },
       });
       if (!categoriaExiste) {
         throw new NotFoundException(`La categoría con ID ${updateProductoDto.categoria_id} no fue encontrada.`);
       }
    }
    
    return this.productosRepository.update(id, updateProductoDto);
  }

  async remove(id: number) {
    await this.findOne(id); // Valida existencia
    return this.productosRepository.remove(id);
  }
}
