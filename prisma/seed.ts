import { PrismaClient, RolUsuario } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as bcrypt from 'bcrypt';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Iniciando el seeder...');

  // 1. Borrar de forma recursiva
  console.log('Eliminando datos anteriores...');
  await prisma.usuario.deleteMany({});
  await prisma.sucursal.deleteMany({});
  
  // 2. Crear una sucursal base
  console.log('Creando Sucursal Base...');
  const sucursal = await prisma.sucursal.create({
    data: {
      nombre: 'Sucursal Central',
      direccion: 'Av. Principal 123',
      estado: 'Activa'
    }
  });

  // 3. Crear el usuario administrador
  console.log('Creando Usuario Administrador...');
  const salt = await bcrypt.genSalt();
  const password_hash = await bcrypt.hash('admin123', salt);

  const admin = await prisma.usuario.create({
    data: {
      sucursal_id: sucursal.id_sucursal,
      nombre: 'Administrador',
      rol: RolUsuario.ADMIN,
      email: 'admin@ejemplo.com',
      password_hash
    }
  });

  // 4. Crear el usuario vendedor
  console.log('Creando Usuario Vendedor...');
  const saltVendedor = await bcrypt.genSalt();
  const passwordHashVendedor = await bcrypt.hash('vendedor123', saltVendedor);

  const vendedor = await prisma.usuario.create({
    data: {
      sucursal_id: sucursal.id_sucursal,
      nombre: 'Vendedor Prueba',
      rol: RolUsuario.VENDEDOR,
      email: 'vendedor@ejemplo.com',
      password_hash: passwordHashVendedor
    }
  });

  console.log('¡Seeder completado!');
  console.log('Sucursal ID:', sucursal.id_sucursal);
  console.log('Usuario Admin ID:', admin.id_usuario);
  console.log('Usuario Vendedor ID:', vendedor.id_usuario);
}

main()
  .catch((e) => {
    console.error('Error durante el seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
