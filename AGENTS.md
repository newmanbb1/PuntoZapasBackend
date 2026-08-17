# Punto Zapas — Backend (Codex)

NestJS 11 API for a Bolivian sneaker shop + POS. Postgres via Prisma 7 (`@prisma/adapter-pg`). Frontend is a separate repo (`punto-zapas-frontend`) on port 3001.

## Commands

```bash
npm install
npx prisma migrate dev
npx prisma db seed
npm run start:dev          # http://localhost:3000
npm run test
npm run lint
```

- Package manager: npm.
- Env: `DATABASE_URL`, `JWT_SECRET`, `PORT` (default 3000), `ALLOWED_ORIGIN` (default `http://localhost:3001`). Optional Cloudinary: `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`.
- Never commit `.env`. Never add hardcoded DB passwords or JWT fallbacks.

## Layout

```
src/
  main.ts                 # helmet, CORS, ValidationPipe, PrismaExceptionFilter
  app.module.ts           # Throttler 100/min, CacheModule (unused), ServeStatic /uploads
  auth/                   # login, register, jwt strategy/guard
  users/                  # CRUD /usuarios
  productos/              # catalog + multipart images
  categorias/ sucursales/ inventario/ pedidos/ clientes/
  dashboard/ finanzas/ gastos/ uploads/
  common/decorators/user.decorator.ts
  common/filters/prisma-exception.filter.ts
prisma/schema.prisma      # source of truth for the domain
prisma/seed.ts
```

No global API prefix. Controllers map 1:1 to routes (`/productos`, `/pedidos`, …).

## Domain

Spanish table/column names, mapped with `@@map`. Money in BOB (`Decimal(10,2)`).

- `Sucursal` → `Usuario`, `Inventario`, `GastoOperativo`
- `Producto` → `VarianteProducto` (talla, color, sku) → `Inventario` (per sucursal)
- `Pedido` → `DetallePedido` + `Pago` (Pago model exists; checkout does not write it)
- `Cliente` required on `Pedido`
- Roles in use: `admin`, `cajero` (string column, not an enum)

IDs are `id_<entity>` integers. Do not rename to `id`. Keep snake_case in API responses; the frontend maps them.

## Module conventions

- One Nest module per folder: `*.module.ts`, `*.controller.ts`, `*.service.ts`, `dto/` when mutating.
- Inject `PrismaService`. Use `$transaction` for stock + order writes (see `pedidos.service.ts`).
- DTOs with `class-validator` + `@Type(() => Number)` for multipart/query numbers.
- Do not type request bodies as `any` on new code. Add a DTO.
- Strip `password_hash` from every user response, including `remove()`.
- Recalculate `precio_unitario` and `total` from `producto.precio_venta` in the DB. Never trust amounts from the client.
- Recalculate `subtotal` as `cantidad * precio_unitario` server-side.

## Auth rules (mandatory on new/changed endpoints)

| Surface | Auth |
|---|---|
| `GET /productos`, `GET /productos/:id`, `GET /categorias` | public |
| `POST/PATCH/DELETE /productos` | JWT + admin |
| `POST /pedidos` | public for shop checkout **or** JWT for POS; always recompute prices/stock |
| `GET /pedidos`, `GET /pedidos/:id` | JWT; scope by `sucursal_id` for cajero |
| PDF `/pedidos/:id/comprobante` | JWT or one-time token — not a guessable ID |
| `POST /clientes` | public (checkout) with a real DTO; `GET/PATCH/DELETE /clientes` JWT + admin |
| `POST /auth/register` | JWT + admin (do not leave it public) |
| `POST /auth/login` | public, keep `@Throttle` |
| users, sucursales, inventario writes, gastos, finanzas, dashboard | JWT; admin-only except POS inventory read and POS create-order |

There is **no RolesGuard yet**. If you touch auth, add one (`@Roles('admin')`) instead of checking `rol` ad-hoc in random services. Fail boot if `JWT_SECRET` is missing; do not fall back to `super-secret-key-2026`.

## Prisma / data

- Schema: `prisma/schema.prisma`. Config: `prisma.config.ts`.
- After schema edits: `npx prisma migrate dev --name <desc>` then regenerate client.
- Prefer `onDelete: Restrict` for catalog relations. Cascade on sucursal currently wipes users/inventory — do not spread that pattern.
- Add `@@unique([variante_id, sucursal_id])` if you touch Inventario.
- `talla` is `VarChar(2)` (tight). Do not store `42.5` without a migration.
- Filter stock alerts in SQL (`cantidad <= nivel_minimo`), not by loading the full table.
- Finanzas must use `costo_adquisicion` from line items, not `ingresos * 0.4`.

## Uploads

`UploadsService`: Cloudinary if credentials exist, else `uploads/productos/` served at `/uploads`. Validate mime (`image/jpeg|png|webp`) and size before write. Max files already 36.

## Style

- TypeScript, Nest patterns, Prettier via `npm run lint`.
- Spanish user-facing error messages (`UnauthorizedException('Credenciales incorrectas')`).
- English code identifiers are fine; keep existing Spanish domain names.
- Do not add Swagger unless asked. Do not introduce a global `/api` prefix (frontend calls `http://localhost:3000/productos`).
- Do not rewrite README Nest boilerplate unless asked.
- Tests: Jest in `src/**/*.spec.ts`. New business logic needs a service spec (auth, stock, price recompute). Skip e2e unless asked.

## Do not

- Do not log secrets or full JWT payloads.
- Do not use `console.log` for “email notifications” in new code — that path is a stub.
- Do not create a `Pago` row that pretends a gateway succeeded.
- Do not expand `CacheModule` until there is a concrete key strategy.
