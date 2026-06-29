import { Module } from '@nestjs/common';
import { CarritoService } from './carrito.service';
import { CarritoController } from './carrito.controller';
import { PrismaModule } from '../prisma/prisma.module';

import { CarritoRepository } from './carrito.repository';

@Module({
  imports: [PrismaModule],
  controllers: [CarritoController],
  providers: [CarritoService, CarritoRepository],
})
export class CarritoModule {}
