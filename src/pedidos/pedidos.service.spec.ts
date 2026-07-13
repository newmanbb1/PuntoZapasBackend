import { Test, TestingModule } from '@nestjs/testing';
import { PedidosService } from './pedidos.service';
import { PrismaService } from '../prisma/prisma.service';
import { BadRequestException } from '@nestjs/common';

describe('PedidosService', () => {
  let service: PedidosService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PedidosService,
        {
          provide: PrismaService,
          useValue: {
            $transaction: jest.fn(),
            pedido: {
              create: jest.fn(),
              findMany: jest.fn(),
              findUnique: jest.fn(),
            },
            inventario: {
              findFirst: jest.fn(),
              update: jest.fn(),
            },
            cliente: {
              findUnique: jest.fn(),
            }
          }
        }
      ],
    }).compile();

    service = module.get<PedidosService>(PedidosService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should throw BadRequestException if stock is insufficient', async () => {
      // Mock the transaction callback directly
      const mockTx = {
        inventario: {
          findFirst: jest.fn().mockResolvedValue({ cantidad: 1 }) // Insufficient stock (1 < 5)
        }
      };
      
      jest.spyOn(prisma, '$transaction').mockImplementation(async (callback) => {
        return callback(mockTx as any);
      });

      const orderData = {
        sucursal_id: 1,
        cliente_id: 1,
        total: 100,
        detalles: [{ variante_id: 1, cantidad: 5, precio_unitario: 20 }]
      };

      await expect(service.create(orderData)).rejects.toThrow(BadRequestException);
      expect(mockTx.inventario.findFirst).toHaveBeenCalledWith({
        where: { sucursal_id: 1, variante_id: 1 }
      });
    });

    it('should successfully create an order and decrement stock', async () => {
      const mockInventario = { id_inventario: 1, cantidad: 10 };
      const mockPedido = { id_pedido: 1, cliente_id: 1 };

      const mockTx = {
        inventario: {
          findFirst: jest.fn().mockResolvedValue(mockInventario),
          update: jest.fn().mockResolvedValue({}),
        },
        pedido: {
          create: jest.fn().mockResolvedValue(mockPedido),
        },
        cliente: {
          findUnique: jest.fn().mockResolvedValue({ email: 'test@test.com' })
        }
      };

      jest.spyOn(prisma, '$transaction').mockImplementation(async (callback) => {
        return callback(mockTx as any);
      });

      const orderData = {
        sucursal_id: 1,
        cliente_id: 1,
        total: 100,
        detalles: [{ variante_id: 1, cantidad: 2, precio_unitario: 50 }]
      };

      const result = await service.create(orderData);

      expect(result).toEqual(mockPedido);
      expect(mockTx.pedido.create).toHaveBeenCalled();
      expect(mockTx.inventario.update).toHaveBeenCalledWith({
        where: { id_inventario: 1 },
        data: { cantidad: 8 } // 10 - 2
      });
    });
  });
});
