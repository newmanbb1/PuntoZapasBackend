import { IsInt, IsString, IsEmail, IsOptional, MaxLength } from 'class-validator';

export class CreateUserDto {
  @IsInt()
  sucursal_id: number;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  nombre?: string;

  @IsString()
  @IsOptional()
  @MaxLength(20)
  rol?: string;

  @IsEmail()
  @IsOptional()
  @MaxLength(100)
  email?: string;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  password_hash?: string;
}
