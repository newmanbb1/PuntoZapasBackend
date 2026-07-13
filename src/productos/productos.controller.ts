import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, UploadedFiles, Query } from '@nestjs/common';
import { ProductosService } from './productos.service';
import { CreateProductoDto } from './dto/create-producto.dto';
import { UpdateProductoDto } from './dto/update-producto.dto';
import { FilesInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { UploadsService } from '../uploads/uploads.service';

@Controller('productos')
export class ProductosController {
  constructor(
    private readonly productosService: ProductosService,
    private readonly uploadsService: UploadsService
  ) {}

  @Post()
  @UseInterceptors(FilesInterceptor('imagenes', 5, {
    storage: memoryStorage(),
  }))
  async create(
    @Body() createProductoDto: CreateProductoDto,
    @UploadedFiles() files: Express.Multer.File[]
  ) {
    if (files && files.length > 0) {
      const uploadPromises = files.map(file => this.uploadsService.uploadFile(file));
      createProductoDto.imagenes = await Promise.all(uploadPromises);
    }
    return this.productosService.create(createProductoDto);
  }

  @Get()
  findAll(@Query('page') page: string = '1', @Query('limit') limit: string = '20') {
    return this.productosService.findAll(Number(page), Number(limit));
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productosService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateProductoDto: UpdateProductoDto) {
    return this.productosService.update(+id, updateProductoDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productosService.remove(+id);
  }
}
