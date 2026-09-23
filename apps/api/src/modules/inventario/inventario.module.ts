import { Module } from '@nestjs/common';
import { InventarioService } from './inventario.service';
import { InventarioController } from './inventario.controller';
import { StockSucursalService } from './stock-sucursal.service';
import { PrismaModule } from '../../database/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [InventarioController],
  providers: [InventarioService, StockSucursalService],
  exports: [InventarioService, StockSucursalService],
})
export class InventarioModule {}
