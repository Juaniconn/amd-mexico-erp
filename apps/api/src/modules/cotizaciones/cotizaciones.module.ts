import { Module } from '@nestjs/common';
import { CotizacionesService } from './cotizaciones.service';
import { CotizacionesController } from './cotizaciones.controller';
import { PrismaModule } from '../../database/prisma.module';
import { ProduccionModule } from '../produccion/produccion.module';

@Module({
  imports: [PrismaModule, ProduccionModule],
  controllers: [CotizacionesController],
  providers: [CotizacionesService],
  exports: [CotizacionesService],
})
export class CotizacionesModule {}
