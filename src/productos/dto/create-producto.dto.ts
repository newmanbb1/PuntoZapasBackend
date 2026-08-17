import { IsString, IsNumber, IsOptional, IsArray, Min, MaxLength, IsNotEmpty, IsBoolean } from 'class-validator';
import { Type, Transform } from 'class-transformer';

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

  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  en_oferta?: boolean;

  @IsString()
  @IsOptional()
  @MaxLength(512)
  video_url?: string;

  @IsString()
  @IsOptional()
  @MaxLength(512)
  video_card_url?: string;

  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  remove_video?: boolean;

  @IsString()
  @IsOptional()
  @MaxLength(2)
  talla?: string;

  @IsString()
  @IsOptional()
  @MaxLength(15)
  color?: string;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  sucursal_id?: number;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  cantidad?: number;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  nivel_minimo?: number;
}
