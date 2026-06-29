import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { CarritoService } from './carrito.service';
import { AgregarCarritoDto } from './dto/agregar-carrito.dto';

@Controller('carrito')
export class CarritoController {
  constructor(private readonly carritoService: CarritoService) {}

  // Endpoint público para que cualquier cliente pueda validar stock y armar su carrito
  @Post('agregar')
  @HttpCode(HttpStatus.OK)
  async agregar(@Body() agregarCarritoDto: AgregarCarritoDto) {
    return this.carritoService.validarStock(agregarCarritoDto);
  }
}
