import { IsInt, IsString, IsEmail, IsOptional, MaxLength, IsEnum } from 'class-validator';
import { RolUsuario } from '@prisma/client';

export class UpdateUserDto {
  @IsInt()
  @IsOptional()
  sucursal_id?: number;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  nombre?: string;

  @IsEnum(RolUsuario)
  @IsOptional()
  rol?: RolUsuario;

  @IsEmail()
  @IsOptional()
  @MaxLength(100)
  email?: string;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  password_hash?: string;
}
