import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, UseGuards, HttpCode, HttpStatus, Query } from '@nestjs/common';
import { ProductosService } from './productos.service';
import { CreateProductoDto } from './dto/create-producto.dto';
import { UpdateProductoDto } from './dto/update-producto.dto';
import { FiltroProductoDto } from './dto/filtro-producto.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolUsuario } from '@prisma/client';

@Controller('productos')
export class ProductosController {
  constructor(private readonly productosService: ProductosService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RolUsuario.ADMIN)
  @Post()
  @HttpCode(HttpStatus.CREATED) // Retorna 201 Created
  create(@Body() createProductoDto: CreateProductoDto) {
    return this.productosService.create(createProductoDto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  listarProductos(@Query() filtros: FiltroProductoDto) {
    return this.productosService.listarProductos(filtros);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.productosService.findOne(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RolUsuario.ADMIN)
  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  update(@Param('id', ParseIntPipe) id: number, @Body() updateProductoDto: UpdateProductoDto) {
    return this.productosService.update(id, updateProductoDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RolUsuario.ADMIN)
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.productosService.remove(id);
  }
}
