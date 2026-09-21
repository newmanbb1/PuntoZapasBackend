import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { CreateProductoDto } from './dto/create-producto.dto';
import { UpdateProductoDto } from './dto/update-producto.dto';
import { PrismaService } from '../prisma/prisma.service';
import { AppCacheService } from '../common/cache/app-cache.service';
import { CACHE_KEYS, CACHE_TTL_MS } from '../common/cache/cache-keys';

@Injectable()
export class ProductosService {
  constructor(
    private prisma: PrismaService,
    private appCache: AppCacheService,
  ) {}

  private buildSku(marca: string, modelo: string, talla: string, color: string): string {
    const prefix = `${marca}-${modelo}-${talla}-${color}`
      .replace(/[^a-zA-Z0-9]/g, '-')
      .toUpperCase()
      .slice(0, 45);
    return `${prefix}-${Date.now().toString(36).slice(-4)}`;
  }

  async create(createProductoDto: CreateProductoDto) {
    const { talla, color, sucursal_id, cantidad, nivel_minimo, remove_video, ...productData } = createProductoDto;

    if (!talla || !color || !sucursal_id) {
      throw new BadRequestException('Debe indicar talla, color y sucursal para crear el inventario inicial');
    }

    const sku = this.buildSku(productData.marca, productData.modelo, talla, color);

    const created = await this.prisma.producto.create({
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

    await this.appCache.invalidateCatalog();
    return created;
  }

  async findCatalog(enOferta?: boolean) {
    const cacheKey = CACHE_KEYS.catalog(enOferta);
    return this.appCache.getOrSet(cacheKey, CACHE_TTL_MS.catalog, async () => {
      const where = enOferta !== undefined ? { en_oferta: enOferta } : undefined;
      const data = await this.prisma.producto.findMany({
        where,
        select: {
          id_producto: true,
          modelo: true,
          marca: true,
          precio_venta: true,
          descripcion: true,
          imagenes: true,
          en_oferta: true,
          video_url: true,
          video_card_url: true,
          categoria: { select: { id_categoria: true, nombre: true } },
        },
        orderBy: { id_producto: 'desc' },
      });
      return { data };
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
    return this.appCache.getOrSet(CACHE_KEYS.producto(id), CACHE_TTL_MS.producto, async () => {
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
    });
  }

  async update(id: number, updateProductoDto: UpdateProductoDto) {
    await this.ensureExists(id);
    const { talla, color, sucursal_id, cantidad, nivel_minimo, remove_video, ...data } = updateProductoDto;
    if (remove_video) {
      data.video_url = null as any;
      data.video_card_url = null as any;
    }
    const updated = await this.prisma.producto.update({
      where: { id_producto: id },
      data,
      include: {
        categoria: true,
        variantes: {
          include: { inventarios: true },
        },
      },
    });
    await this.appCache.invalidateProducto(id);
    return updated;
  }

  async remove(id: number) {
    await this.ensureExists(id);
    const deleted = await this.prisma.producto.delete({
      where: { id_producto: id },
    });
    await this.appCache.invalidateProducto(id);
    return deleted;
  }

  private async ensureExists(id: number) {
    const exists = await this.prisma.producto.findUnique({
      where: { id_producto: id },
      select: { id_producto: true },
    });
    if (!exists) {
      throw new NotFoundException(`Producto #${id} no encontrado`);
    }
  }
}
