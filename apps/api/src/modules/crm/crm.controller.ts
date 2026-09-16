import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CrmService } from './crm.service';
import { CreateLeadDto } from './dto/create-lead.dto';
import { UpdateLeadDto } from './dto/update-lead.dto.dto';
import { CreateActividadLeadDto } from './dto/create-actividad-lead.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Role } from '@prisma/client';

@Controller('crm')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CrmController {
  constructor(private readonly crmService: CrmService) {}

  // ─── Leads (Oportunidades) ───────────────────────────────

  @Post('leads')
  @Roles(Role.ADMIN, Role.GERENTE, Role.VENDEDOR)
  async createLead(
    @Body() createLeadDto: CreateLeadDto,
    @CurrentUser('id') userId?: string,
  ) {
    return this.crmService.create(createLeadDto, userId);
  }

  @Get('leads')
  @Roles(Role.ADMIN, Role.GERENTE, Role.VENDEDOR)
  async findAllLeads(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 10;
    return this.crmService.findAll(pageNum, limitNum, search);
  }

  @Get('leads/stats')
  @Roles(Role.ADMIN, Role.GERENTE, Role.VENDEDOR)
  async getStats() {
    return this.crmService.getStats();
  }

  @Get('leads/:id')
  @Roles(Role.ADMIN, Role.GERENTE, Role.VENDEDOR)
  async findOneLead(@Param('id') id: string) {
    return this.crmService.findOne(id);
  }

  @Put('leads/:id')
  @Roles(Role.ADMIN, Role.GERENTE, Role.VENDEDOR)
  async updateLead(
    @Param('id') id: string,
    @Body() updateLeadDto: UpdateLeadDto,
  ) {
    return this.crmService.update(id, updateLeadDto);
  }

  @Delete('leads/:id')
  @Roles(Role.ADMIN, Role.GERENTE)
  async removeLead(@Param('id') id: string) {
    return this.crmService.remove(id);
  }

  // ─── Actividades ─────────────────────────────────────────

  @Post('actividades')
  @Roles(Role.ADMIN, Role.GERENTE, Role.VENDEDOR)
  async createActividad(
    @Body() createActividadDto: CreateActividadLeadDto,
    @CurrentUser('id') userId?: string,
  ) {
    return this.crmService.addActividad(createActividadDto, userId);
  }

  @Get('leads/:id/actividades')
  @Roles(Role.ADMIN, Role.GERENTE, Role.VENDEDOR)
  async getActividades(@Param('id') leadId: string) {
    return this.crmService.getActividades(leadId);
  }
}
