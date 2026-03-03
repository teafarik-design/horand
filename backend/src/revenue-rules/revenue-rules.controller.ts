import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { RevenueRulesService } from './revenue-rules.service';
import { CreateRevenueRuleDto } from './dto/create-revenue-rule.dto';
import { UpdateRevenueRuleDto } from './dto/update-revenue-rule.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('revenue-rules')
@Controller('companies/:companyId/revenue-rules')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class RevenueRulesController {
  constructor(private revenueRulesService: RevenueRulesService) {}

  @Post()
  create(@Request() req, @Param('companyId') companyId: string, @Body() dto: CreateRevenueRuleDto) {
    return this.revenueRulesService.create(companyId, req.user.id, dto);
  }

  @Get()
  findAll(@Request() req, @Param('companyId') companyId: string) {
    return this.revenueRulesService.findAll(companyId, req.user.id);
  }

  @Patch(':id')
  update(@Request() req, @Param('companyId') companyId: string, @Param('id') id: string, @Body() dto: UpdateRevenueRuleDto) {
    return this.revenueRulesService.update(id, companyId, req.user.id, dto);
  }

  @Delete(':id')
  remove(@Request() req, @Param('companyId') companyId: string, @Param('id') id: string) {
    return this.revenueRulesService.remove(id, companyId, req.user.id);
  }
}
