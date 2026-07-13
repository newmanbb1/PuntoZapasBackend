import { Controller, Get, Post, Body, Put, Param, UseGuards, Query } from '@nestjs/common';
import { InventarioService } from './inventario.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('inventario')
export class InventarioController {
  constructor(private readonly inventarioService: InventarioService) {}

  @Post()
  create(@Body() data: any) {
    return this.inventarioService.create(data);
  }

  @Get()
  findAll(@Query('page') page: string = '1', @Query('limit') limit: string = '20') {
    return this.inventarioService.findAll(Number(page), Number(limit));
  }

  @Get('alertas')
  getAlerts() {
    return this.inventarioService.getAlerts();
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() data: any) {
    return this.inventarioService.update(+id, data);
  }
}
