import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import 'dotenv/config';

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:admin@localhost:5432/punto_zapas?schema=public';
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Seeding database...');

  // 1. Sucursales
  const sucursal1 = await prisma.sucursal.create({
    data: {
      nombre: 'Punto Zapas Centro',
      direccion: 'Calle Independencia #123',
      estado: 'ACTIVO'
    }
  });

  const sucursal2 = await prisma.sucursal.create({
    data: {
      nombre: 'Punto Zapas Norte',
      direccion: 'Av. Banzer 4to Anillo',
      estado: 'ACTIVO'
    }
  });

  // 2. Categorias
  const catUrban = await prisma.categoria.create({ data: { nombre: 'Urban' } });
  const catSport = await prisma.categoria.create({ data: { nombre: 'Sport' } });
  const catRunning = await prisma.categoria.create({ data: { nombre: 'Running' } });

  // 3. Productos y Variantes
  const prod1 = await prisma.producto.create({
    data: {
      categoria_id: catUrban.id_categoria,
      modelo: 'Air Max 90',
      marca: 'Nike',
      costo_adquisicion: 300.0,
      precio_venta: 500.0,
      descripcion: 'Zapatillas clásicas urbanas',
      imagenes: ['/placeholder.png'],
      variantes: {
        create: [
          { talla: '40', color: 'Blanco', sku: 'NK-AM90-40-WH' },
          { talla: '41', color: 'Blanco', sku: 'NK-AM90-41-WH' },
          { talla: '42', color: 'Negro', sku: 'NK-AM90-42-BK' },
        ]
      }
    },
    include: { variantes: true }
  });

  const prod2 = await prisma.producto.create({
    data: {
      categoria_id: catRunning.id_categoria,
      modelo: 'Ultraboost',
      marca: 'Adidas',
      costo_adquisicion: 400.0,
      precio_venta: 650.0,
      descripcion: 'Alta tecnología para correr',
      imagenes: ['/placeholder.png'],
      variantes: {
        create: [
          { talla: '39', color: 'Gris', sku: 'AD-UB-39-GR' },
          { talla: '40', color: 'Gris', sku: 'AD-UB-40-GR' },
        ]
      }
    },
    include: { variantes: true }
  });

  // 4. Inventario
  // Sucursal 1 tiene prod1
  for (const v of prod1.variantes) {
    await prisma.inventario.create({
      data: {
        sucursal_id: sucursal1.id_sucursal,
        variante_id: v.id_variante_producto,
        cantidad: 15,
        nivel_minimo: 5
      }
    });
  }

  // Sucursal 2 tiene prod2
  for (const v of prod2.variantes) {
    await prisma.inventario.create({
      data: {
        sucursal_id: sucursal2.id_sucursal,
        variante_id: v.id_variante_producto,
        cantidad: 20,
        nivel_minimo: 3
      }
    });
  }

  // 5. Cliente Mock
  await prisma.cliente.create({
    data: {
      nombre_completo: 'Juan Perez',
      telefono: '77712345',
      email: 'juan@example.com',
      nit_facturacion: '1234567011'
    }
  });

  // 6. Usuario Admin
  const bcrypt = require('bcrypt');
  const salt = await bcrypt.genSalt(10);
  const password_hash = await bcrypt.hash('admin', salt);

  await prisma.usuario.upsert({
    where: { email: 'admin@puntozapas.com' },
    update: {},
    create: {
      nombre: 'Administrador Principal',
      email: 'admin@puntozapas.com',
      password_hash,
      rol: 'admin',
      sucursal_id: sucursal1.id_sucursal
    }
  });

  console.log('Seeding completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
