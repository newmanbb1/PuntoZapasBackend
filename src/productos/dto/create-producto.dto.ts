import { IsString, IsNumber, IsOptional, IsArray, Min, MaxLength, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateProductoDto {
  @IsNumber()
  @IsNotEmpty()
  @Type(() => Number)
  categoria_id: number;

  @IsString()
  @IsNotEmpty()
  @MaxLength(25)
  modelo: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(45)
  marca: string;

  @IsNumber()
  @Min(0)
  @Type(() => Number)
  costo_adquisicion: number;

  @IsNumber()
  @Min(0)
  @Type(() => Number)
  precio_venta: number;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  descripcion?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  imagenes?: string[];
}
