import { Type } from 'class-transformer';
import { IsString, IsNumber, IsOptional, ValidateNested, IsArray, Min } from 'class-validator';

export class CreateInventarioDto {
  @IsNumber()
  sucursal_id: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  cantidad?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  nivel_minimo?: number;
}

export class CreateVarianteDto {
  @IsString()
  @IsOptional()
  talla?: string;

  @IsString()
  @IsOptional()
  color?: string;

  @IsString()
  @IsOptional()
  sku?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateInventarioDto)
  inventarios: CreateInventarioDto[];
}

export class CreateProductoDto {
  @IsNumber()
  categoria_id: number;

  @IsString()
  @IsOptional()
  modelo?: string;

  @IsString()
  @IsOptional()
  marca?: string;

  @IsNumber()
  @Min(0)
  costo_adquisicion: number;

  @IsNumber()
  @Min(0)
  precio_venta: number;

  @IsString()
  @IsOptional()
  descripcion?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateVarianteDto)
  variantes: CreateVarianteDto[];
}
