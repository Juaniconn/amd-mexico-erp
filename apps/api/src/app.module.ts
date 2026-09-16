import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './database/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { ClientesModule } from './modules/clientes/clientes.module';
import { ProveedoresModule } from './modules/proveedores/proveedores.module';
import { CotizacionesModule } from './modules/cotizaciones/cotizaciones.module';
import { ProduccionModule } from './modules/produccion/produccion.module';
import { CalidadModule } from './modules/calidad/calidad.module';
import { InventarioModule } from './modules/inventario/inventario.module';
import { ComprasModule } from './modules/compras/compras.module';
import { ReportesModule } from './modules/reportes/reportes.module';
import { VentasModule } from './modules/ventas/ventas.module';
import { ConfiguracionModule } from './modules/configuracion/configuracion.module';
import { CrmModule } from './modules/crm/crm.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    PrismaModule,
    AuthModule,
    ClientesModule,
    ProveedoresModule,
    CotizacionesModule,
    ProduccionModule,
    CalidadModule,
    InventarioModule,
    ComprasModule,
    ReportesModule,
    VentasModule,
    ConfiguracionModule,
    CrmModule,
  ],
})
export class AppModule {}
