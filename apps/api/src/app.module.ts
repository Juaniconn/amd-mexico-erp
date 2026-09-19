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
import { ConfiguracionModule } from './modules/configuracion/configuracion.module';
import { IngenieriaModule } from './modules/ingenieria/ingenieria.module';
import { UsuariosModule } from './modules/usuarios/usuarios.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    PrismaModule,
    AuthModule,
    UsuariosModule,
    ClientesModule,
    ProveedoresModule,
    CotizacionesModule,
    ProduccionModule,
    CalidadModule,
    InventarioModule,
    ComprasModule,
    ReportesModule,
    ConfiguracionModule,
    IngenieriaModule,
  ],
})
export class AppModule {}
