import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller('dashboard')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('stats')
  @Roles(Role.ADMIN, Role.GERENTE)
  getStats() {
    return this.dashboardService.getStats();
  }

  @Get('activity')
  @Roles(Role.ADMIN, Role.GERENTE)
  getRecentActivity(@Query('from') from?: string, @Query('to') to?: string) {
    return this.dashboardService.getRecentActivity(from, to);
  }

  @Get('alerts')
  @Roles(Role.ADMIN, Role.GERENTE)
  getAlerts() {
    return this.dashboardService.getAlerts();
  }
}
