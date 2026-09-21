import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import type { Cache } from 'cache-manager';
import { CACHE_KEYS } from './cache-keys';

@Injectable()
export class AppCacheService {
  constructor(@Inject(CACHE_MANAGER) private readonly cache: Cache) {}

  async getOrSet<T>(key: string, ttlMs: number, factory: () => Promise<T>): Promise<T> {
    const cached = await this.cache.get<T>(key);
    if (cached !== undefined && cached !== null) {
      return cached;
    }
    const value = await factory();
    await this.cache.set(key, value, ttlMs);
    return value;
  }

  async invalidateCatalog() {
    await Promise.all([
      this.cache.del(CACHE_KEYS.catalog()),
      this.cache.del(CACHE_KEYS.catalog(true)),
      this.cache.del(CACHE_KEYS.catalog(false)),
    ]);
  }

  async invalidateProducto(id: number) {
    await this.cache.del(CACHE_KEYS.producto(id));
    await this.invalidateCatalog();
  }

  async invalidateCategorias() {
    await this.cache.del(CACHE_KEYS.categorias);
  }
}
