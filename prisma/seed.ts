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
  await prisma.inventario.deleteMany({});
  await prisma.detallePedido.deleteMany({});
  await prisma.pago.deleteMany({});
  await prisma.pedido.deleteMany({});
  await prisma.varianteProducto.deleteMany({});
  await prisma.producto.deleteMany({});
  await prisma.categoria.deleteMany({});
  await prisma.usuario.deleteMany({});
  await prisma.sucursal.deleteMany({});
  await prisma.cliente.deleteMany({});
  
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

  // 5. Crear Categorias
  console.log('Creando Categorias...');
  const catRunning = await prisma.categoria.create({
    data: { nombre: 'Running' }
  });
  const catCasual = await prisma.categoria.create({
    data: { nombre: 'Casual' }
  });

  // 6. Crear Productos
  console.log('Creando Productos...');
  const productoNike = await prisma.producto.create({
    data: {
      categoria_id: catRunning.id_categoria,
      marca: 'Nike',
      modelo: 'Air Zoom',
      costo_adquisicion: 30000,
      precio_venta: 45000,
      descripcion: 'Zapatillas de running Nike',
    }
  });

  const productoAdidas = await prisma.producto.create({
    data: {
      categoria_id: catRunning.id_categoria,
      marca: 'Adidas',
      modelo: 'Ultraboost',
      costo_adquisicion: 40000,
      precio_venta: 60000,
      descripcion: 'Zapatillas de running Adidas',
    }
  });

  // 7. Crear Variantes
  console.log('Creando Variantes...');
  const varianteNike42 = await prisma.varianteProducto.create({
    data: {
      producto_id: productoNike.id_producto,
      talla: '42',
      color: 'Rojo',
      sku: 'NK-AZ-42-ROJ'
    }
  });
  const varianteAdidas42 = await prisma.varianteProducto.create({
    data: {
      producto_id: productoAdidas.id_producto,
      talla: '42',
      color: 'Negro',
      sku: 'AD-UB-42-NEG'
    }
  });

  // 8. Crear Inventario
  console.log('Creando Inventario...');
  await prisma.inventario.create({
    data: {
      variante_id: varianteNike42.id_variante_producto,
      sucursal_id: sucursal.id_sucursal,
      cantidad: 10,
      nivel_minimo: 5
    }
  });
  
  await prisma.inventario.create({
    data: {
      variante_id: varianteAdidas42.id_variante_producto,
      sucursal_id: sucursal.id_sucursal,
      cantidad: 0,
      nivel_minimo: 2
    }
  });

  console.log('¡Seeder completado!');
  console.log('Sucursal ID:', sucursal.id_sucursal);
  console.log('Usuario Admin ID:', admin.id_usuario);
  console.log('Usuario Vendedor ID:', vendedor.id_usuario);
  console.log('--- Datos de Prueba ---');
  console.log('Producto Nike (Running, < 50000) ID:', productoNike.id_producto);
  console.log('  -> Variante (Stock: 10) ID:', varianteNike42.id_variante_producto);
  console.log('Producto Adidas (Running, > 50000) ID:', productoAdidas.id_producto);
  console.log('  -> Variante (Stock: 0) ID:', varianteAdidas42.id_variante_producto);
}

main()
  .catch((e) => {
    console.error('Error durante el seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
