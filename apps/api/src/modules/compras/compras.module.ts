import { Module } from '@nestjs/common';
import { ComprasService } from './compras.service';
import { ComprasController } from './compras.controller';
import { PrismaModule } from '../../database/prisma.module';
import { InventarioModule } from '../inventario/inventario.module';

@Module({
  imports: [PrismaModule, InventarioModule],
  controllers: [ComprasController],
  providers: [ComprasService],
  exports: [ComprasService],
})
export class ComprasModule {}
