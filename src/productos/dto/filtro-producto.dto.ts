import { Type } from 'class-transformer';
import { IsString, IsOptional, IsNumber, Min } from 'class-validator';

export class FiltroProductoDto {
  @IsString()
  @IsOptional()
  category?: string;

  @IsString()
  @IsOptional()
  marca?: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Type(() => Number) // Esencial para query params que llegan como strings
  maxPrice?: number;
}
