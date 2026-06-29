import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { CarritoRepository } from './carrito.repository';
import { AgregarCarritoDto } from './dto/agregar-carrito.dto';

@Injectable()
export class CarritoService {
  constructor(private readonly carritoRepository: CarritoRepository) { }

  async validarStock(dto: AgregarCarritoDto) {
    // Asignamos 1 por defecto en caso de que sucursalId venga undefined
    const { varianteId, cantidad, sucursalId = 1 } = dto;

    // Buscar el inventario de la variante en la sucursal específica a través del Repositorio
    const inventario = await this.carritoRepository.findInventario(varianteId, sucursalId);

    if (!inventario) {
      throw new NotFoundException(`Variante con ID ${varianteId} no encontrada en la sucursal ${sucursalId}.`);
    }

    // Fallback a 0 porque en el schema cantidad es Int? (nullable)
    if ((inventario.cantidad || 0) < cantidad) {
      throw new BadRequestException('Stock insuficiente');
    }

    // Si todo está bien, devolvemos un mensaje de éxito
    return {
      success: true,
      message: 'Stock disponible',
      data: {
        varianteId,
        cantidadPermitida: cantidad,
        sucursalId
      }
    };
  }
}
