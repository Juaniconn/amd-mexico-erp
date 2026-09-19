import { IsEmail, IsEnum, IsOptional, IsString, MinLength, MaxLength } from 'class-validator';
import { Role } from '@prisma/client';

export class CreateUsuarioDto {
  @IsEmail({}, { message: 'El email debe ser válido' })
  email!: string;

  @IsString({ message: 'El nombre de usuario es requerido' })
  @MinLength(3, { message: 'El usuario debe tener al menos 3 caracteres' })
  @MaxLength(50, { message: 'El usuario no puede exceder 50 caracteres' })
  username!: string;

  @IsString({ message: 'La contraseña es requerida' })
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  password!: string;

  @IsString({ message: 'El nombre es requerido' })
  @MaxLength(100, { message: 'El nombre no puede exceder 100 caracteres' })
  nombre!: string;

  @IsString({ message: 'El apellido es requerido' })
  @MaxLength(100, { message: 'El apellido no puede exceder 100 caracteres' })
  apellido!: string;

  @IsOptional()
  @IsEnum(Role, { message: 'Rol inválido' })
  role?: Role;
}
