import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
const PDFDocument = require('pdfkit');

@Injectable()
export class PedidosService {
  constructor(private prisma: PrismaService) {}

  async create(data: any) {
    return this.prisma.$transaction(async (tx) => {
      // 1. Verificar stock
      for (const item of data.detalles) {
        const inventario = await tx.inventario.findFirst({
          where: { sucursal_id: data.sucursal_id, variante_id: item.variante_id }
        });

        if (!inventario || (inventario.cantidad || 0) < item.cantidad) {
          throw new BadRequestException(`Stock insuficiente para la variante ${item.variante_id}`);
        }
      }

      // 2. Crear pedido
      const pedido = await tx.pedido.create({
        data: {
          cliente_id: data.cliente_id,
          usuario_id: data.usuario_id,
          estado: data.estado || 'PENDIENTE',
          origen: data.origen || 'ONLINE',
          total: data.total,
          detalles: {
            create: data.detalles.map((d: any) => ({
              variante_id: d.variante_id,
              cantidad: d.cantidad,
              precio_unitario: d.precio_unitario,
              subtotal: d.cantidad * d.precio_unitario
            }))
          }
        },
        include: { detalles: true }
      });

      // 3. Descontar stock
      for (const item of data.detalles) {
        const inventario = await tx.inventario.findFirst({
          where: { sucursal_id: data.sucursal_id, variante_id: item.variante_id }
        });

        if (inventario) {
          await tx.inventario.update({
            where: { id_inventario: inventario.id_inventario },
            data: { cantidad: (inventario.cantidad || 0) - item.cantidad }
          });
        }
      }

      // 4. Notificar Venta (Simulado)
      if (pedido.cliente_id) {
        const cliente = await tx.cliente.findUnique({ where: { id_cliente: pedido.cliente_id } });
        if (cliente && cliente.email) {
          console.log(`\n📧 [SISTEMA DE NOTIFICACIONES]`);
          console.log(`Enviando comprobante de pago PDF al correo: ${cliente.email}`);
          console.log(`Asunto: Confirmación de Pedido #${pedido.id_pedido} - Punto Zapas\n`);
        }
      }

      return pedido;
    });
  }

  findAll() {
    return this.prisma.pedido.findMany({
      include: {
        cliente: true,
        detalles: {
          include: {
            variante: { include: { producto: true } }
          }
        }
      },
      orderBy: { fecha: 'desc' }
    });
  }

  findOne(id: number) {
    return this.prisma.pedido.findUnique({
      where: { id_pedido: id },
      include: {
        cliente: true,
        detalles: {
          include: {
            variante: { include: { producto: true } }
          }
        }
      }
    });
  }

  async generateComprobantePdf(id: number): Promise<Buffer> {
    const pedido = await this.findOne(id);
    if (!pedido) {
      throw new NotFoundException('Pedido no encontrado');
    }

    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 50 });
      const buffers: Buffer[] = [];

      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', reject);

      // Header
      doc.fontSize(20).text('PUNTO ZAPAS', { align: 'center' });
      doc.fontSize(10).text('Las mejores zapatillas de Bolivia', { align: 'center' });
      doc.moveDown();
      
      // Info
      doc.fontSize(12).text(`Comprobante de Pedido #${pedido.id_pedido}`);
      doc.text(`Fecha: ${pedido.fecha ? pedido.fecha.toLocaleDateString() : 'N/A'}`);
      doc.text(`Cliente: ${pedido.cliente?.nombre_completo || 'Consumidor Final'}`);
      if (pedido.cliente?.nit_facturacion) {
        doc.text(`NIT: ${pedido.cliente.nit_facturacion}`);
      }
      doc.moveDown();

      // Detalles Header
      doc.font('Helvetica-Bold');
      doc.text('Producto', 50, doc.y, { continued: true });
      doc.text('Cant.', 300, doc.y, { continued: true });
      doc.text('Precio', 380, doc.y, { continued: true });
      doc.text('Subtotal', 450, doc.y);
      doc.font('Helvetica');
      doc.moveDown(0.5);

      // Detalles
      pedido.detalles.forEach(d => {
        const prodName = `${d.variante.producto.marca} ${d.variante.producto.modelo} (${d.variante.color} - ${d.variante.talla})`;
        const currentY = doc.y;
        doc.text(prodName, 50, currentY, { width: 240 });
        doc.text((d.cantidad || 0).toString(), 300, currentY);
        doc.text(`Bs. ${Number(d.precio_unitario).toFixed(2)}`, 380, currentY);
        doc.text(`Bs. ${Number(d.subtotal).toFixed(2)}`, 450, currentY);
        doc.moveDown();
      });

      // Total
      doc.moveDown();
      doc.font('Helvetica-Bold').fontSize(14).text(`TOTAL: Bs. ${Number(pedido.total).toFixed(2)}`, { align: 'right' });
      
      doc.moveDown(2);
      doc.font('Helvetica').fontSize(10).text('Gracias por su compra!', { align: 'center' });
      
      doc.moveDown();
      doc.fontSize(8).fillColor('gray');
      doc.text('Este documento es una simulación de Factura Electrónica.', { align: 'center' });
      const fakeCUF = Array.from({length: 40}, () => Math.floor(Math.random() * 16).toString(16)).join('').toUpperCase();
      doc.text(`CUF: ${fakeCUF}`, { align: 'center' });

      doc.end();
    });
  }
}
