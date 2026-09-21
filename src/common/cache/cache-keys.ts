export const CACHE_KEYS = {
  categorias: 'categorias:all',
  catalog: (enOferta?: boolean) =>
    enOferta === undefined ? 'catalog:all' : `catalog:oferta:${enOferta}`,
  producto: (id: number) => `producto:${id}`,
} as const;

export const CACHE_TTL_MS = {
  catalog: 60_000,
  producto: 60_000,
  categorias: 300_000,
} as const;
