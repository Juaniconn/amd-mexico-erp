import { Controller, Get, UseGuards } from '@nestjs/common';
import { VpsService } from './vps.service';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller('vps')
@UseGuards(JwtAuthGuard, RolesGuard)
export class VpsController {
  constructor(private readonly vpsService: VpsService) {}

  @Get('disks')
  @Roles(Role.ADMIN, Role.GERENTE)
  getDisks() {
    return this.vpsService.getDiskInfo();
  }

  @Get('status')
  @Roles(Role.ADMIN, Role.GERENTE)
  getStatus() {
    return this.vpsService.getSystemStatus();
  }

  @Get('cpu-load')
  @Roles(Role.ADMIN, Role.GERENTE)
  getCpuLoad() {
    return this.vpsService.getCpuLoad();
  }

  @Get('docker')
  @Roles(Role.ADMIN, Role.GERENTE)
  getDocker() {
    return this.vpsService.getDockerContainers();
  }
}
