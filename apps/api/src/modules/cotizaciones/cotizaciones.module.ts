import { Module } from '@nestjs/common';
import { CotizacionesService } from './cotizaciones.service';
import { CotizacionPaqueteService } from './cotizacion-paquete.service';
import { CotizacionEstimacionService } from './cotizacion-estimacion.service';
import { CotizacionesController } from './cotizaciones.controller';
import { PrismaModule } from '../../database/prisma.module';
import { ProduccionModule } from '../produccion/produccion.module';
import { StorageModule } from '../../common/storage.module';

@Module({
  imports: [PrismaModule, ProduccionModule, StorageModule],
  controllers: [CotizacionesController],
  providers: [
    CotizacionesService,
    CotizacionPaqueteService,
    CotizacionEstimacionService,
  ],
  exports: [CotizacionesService],
})
export class CotizacionesModule {}
