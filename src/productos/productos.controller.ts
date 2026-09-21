import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, UploadedFiles, Query } from '@nestjs/common';
import { SkipThrottle, Throttle } from '@nestjs/throttler';
import { ProductosService } from './productos.service';
import { CreateProductoDto } from './dto/create-producto.dto';
import { UpdateProductoDto } from './dto/update-producto.dto';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { UploadsService } from '../uploads/uploads.service';
import { mediaUploadOptions } from '../uploads/media-upload.options';

type ProductMedia = {
  imagenes?: Express.Multer.File[];
  video?: Express.Multer.File[];
};

@Controller('productos')
export class ProductosController {
  constructor(
    private readonly productosService: ProductosService,
    private readonly uploadsService: UploadsService
  ) {}

  @Throttle({ default: { limit: 30, ttl: 60000 } })
  @Post()
  @UseInterceptors(FileFieldsInterceptor([
    { name: 'imagenes', maxCount: 36 },
    { name: 'video', maxCount: 1 },
  ], mediaUploadOptions))
  async create(
    @Body() createProductoDto: CreateProductoDto,
    @UploadedFiles() files: ProductMedia,
  ) {
    await this.applyMedia(createProductoDto, files ?? {});
    return this.productosService.create(createProductoDto);
  }

  @SkipThrottle()
  @Get('catalogo')
  findCatalog(@Query('en_oferta') enOferta?: string) {
    const ofertaFilter = enOferta === 'true' ? true : enOferta === 'false' ? false : undefined;
    return this.productosService.findCatalog(ofertaFilter);
  }

  @Get()
  findAll(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '20',
    @Query('en_oferta') enOferta?: string,
  ) {
    const ofertaFilter = enOferta === 'true' ? true : enOferta === 'false' ? false : undefined;
    return this.productosService.findAll(Number(page), Number(limit), ofertaFilter);
  }

  @SkipThrottle()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productosService.findOne(+id);
  }

  @Throttle({ default: { limit: 30, ttl: 60000 } })
  @Patch(':id')
  @UseInterceptors(FileFieldsInterceptor([
    { name: 'imagenes', maxCount: 36 },
    { name: 'video', maxCount: 1 },
  ], mediaUploadOptions))
  async update(
    @Param('id') id: string,
    @Body() updateProductoDto: UpdateProductoDto,
    @UploadedFiles() files: ProductMedia,
  ) {
    await this.applyMedia(updateProductoDto, files ?? {}, true);
    return this.productosService.update(+id, updateProductoDto);
  }

  @Throttle({ default: { limit: 20, ttl: 60000 } })
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productosService.remove(+id);
  }

  private async applyMedia(
    dto: CreateProductoDto | UpdateProductoDto,
    files: ProductMedia = {},
    mergeImages = false,
  ) {
    if (files.imagenes && files.imagenes.length > 0) {
      const uploaded = await Promise.all(files.imagenes.map((file) => this.uploadsService.uploadFile(file)));
      dto.imagenes = mergeImages ? [...(dto.imagenes ?? []), ...uploaded] : uploaded;
    }
    if (files.video?.[0]) {
      const video = await this.uploadsService.uploadVideo(files.video[0]);
      dto.video_url = video.url;
      dto.video_card_url = video.cardUrl;
      dto.remove_video = false;
    }
  }
}
