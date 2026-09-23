import { Module } from '@nestjs/common';
import { ProduccionService } from './produccion.service';
import { ProduccionController } from './produccion.controller';
import { PrismaModule } from '../../database/prisma.module';
import { InventarioModule } from '../inventario/inventario.module';

@Module({
  imports: [PrismaModule, InventarioModule],
  controllers: [ProduccionController],
  providers: [ProduccionService],
  exports: [ProduccionService],
})
export class ProduccionModule {}
