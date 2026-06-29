import { IsNumber, Min, IsOptional } from 'class-validator';

export class AgregarCarritoDto {
  @IsNumber()
  varianteId: number;

  @IsNumber()
  @Min(1, { message: 'La cantidad debe ser al menos 1' })
  cantidad: number;

  // Asumimos que el frontend puede mandar la sucursal, o usamos la Central por defecto (1)
  @IsNumber()
  @IsOptional()
  sucursalId?: number = 1;
}
