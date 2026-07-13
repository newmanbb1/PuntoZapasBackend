import { Controller, Get, Post, Body, Param, Res, UseGuards } from '@nestjs/common';
import { PedidosService } from './pedidos.service';
import type { Response } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreatePedidoDto } from './dto/create-pedido.dto';
import { User } from '../common/decorators/user.decorator';

@Controller('pedidos')
export class PedidosController {
  constructor(private readonly pedidosService: PedidosService) {}

  @Post()
  create(@Body() createPedidoDto: CreatePedidoDto) {
    return this.pedidosService.create(createPedidoDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  findAll(@User() user: any) {
    // Aquí user contiene los datos del token JWT gracias al custom decorator
    return this.pedidosService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.pedidosService.findOne(+id);
  }

  // Not protected to allow simple URL linking from frontend for PDF
  @Get(':id/comprobante')
  async getComprobante(@Param('id') id: string, @Res() res: Response) {
    const buffer = await this.pedidosService.generateComprobantePdf(+id);
    
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="comprobante-${id}.pdf"`,
      'Content-Length': buffer.length,
    });
    
    res.end(buffer);
  }
}
