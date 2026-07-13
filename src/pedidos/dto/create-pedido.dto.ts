import { IsInt, IsNotEmpty, IsArray, ValidateNested, IsString, IsNumber, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

class PedidoDetalleDto {
  @IsInt()
  @IsNotEmpty()
  variante_id: number;

  @IsInt()
  @IsNotEmpty()
  cantidad: number;

  @IsNumber()
  @IsNotEmpty()
  precio_unitario: number;
}

export class CreatePedidoDto {
  @IsInt()
  @IsNotEmpty()
  sucursal_id: number;

  @IsInt()
  @IsOptional()
  cliente_id?: number;

  @IsInt()
  @IsOptional()
  usuario_id?: number;

  @IsString()
  @IsOptional()
  estado?: string;

  @IsString()
  @IsOptional()
  origen?: string;

  @IsNumber()
  @IsNotEmpty()
  total: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PedidoDetalleDto)
  detalles: PedidoDetalleDto[];
}
