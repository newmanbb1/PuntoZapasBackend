import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AppCacheService } from '../common/cache/app-cache.service';
import { CACHE_KEYS, CACHE_TTL_MS } from '../common/cache/cache-keys';

@Injectable()
export class CategoriasService {
  constructor(
    private prisma: PrismaService,
    private appCache: AppCacheService,
  ) {}

  findAll() {
    return this.appCache.getOrSet(CACHE_KEYS.categorias, CACHE_TTL_MS.categorias, () =>
      this.prisma.categoria.findMany({
        orderBy: { id_categoria: 'asc' },
      }),
    );
  }

  async create(data: any) {
    const created = await this.prisma.categoria.create({
      data: { nombre: data.nombre },
    });
    await this.appCache.invalidateCategorias();
    await this.appCache.invalidateCatalog();
    return created;
  }

  async update(id: number, data: any) {
    const updated = await this.prisma.categoria.update({
      where: { id_categoria: id },
      data: { nombre: data.nombre },
    });
    await this.appCache.invalidateCategorias();
    await this.appCache.invalidateCatalog();
    return updated;
  }

  async remove(id: number) {
    const deleted = await this.prisma.categoria.delete({
      where: { id_categoria: id },
    });
    await this.appCache.invalidateCategorias();
    await this.appCache.invalidateCatalog();
    return deleted;
  }
}
