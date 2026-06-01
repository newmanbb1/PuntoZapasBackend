import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'SECRET_KEY_PROVISIONAL',
      signOptions: { expiresIn: '1d' },
    }),
    // PrismaModule no se importa aquí porque lo configuramos como @Global() previamente
  ],
  controllers: [AuthController], // Capa de Entrada
  providers: [AuthService],       // Capa de Negocio
  exports: [AuthService],         // Permite que otros módulos usen la lógica de auth si es necesario
})
export class AuthModule { }
