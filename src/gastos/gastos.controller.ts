import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { GastosService } from './gastos.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('gastos')
export class GastosController {
  constructor(private readonly gastosService: GastosService) {}

  @Post()
  create(@Body() data: any) {
    return this.gastosService.create(data);
  }

  @Get()
  findAll() {
    return this.gastosService.findAll();
  }
}
