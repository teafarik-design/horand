import { Controller, Get, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { AgreementsService } from './agreements.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ExportPdfDto } from './dto/export-pdf.dto';

@ApiTags('agreements')
@Controller('companies/:companyId/agreements')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AgreementsController {
  constructor(private agreementsService: AgreementsService) {}

  @Post('generate')
  generate(@Request() req, @Param('companyId') companyId: string) {
    return this.agreementsService.generate(companyId, req.user.id);
  }

  @Get()
  findAll(@Request() req, @Param('companyId') companyId: string) {
    return this.agreementsService.findAll(companyId, req.user.id);
  }

  @Get(':id')
  findOne(@Request() req, @Param('id') id: string) {
    return this.agreementsService.findOne(id, req.user.id);
  }

  @Post(':id/export-pdf')
  exportPdf(@Request() req, @Param('id') id: string, @Body() dto: ExportPdfDto) {
    return this.agreementsService.exportPdf(id, req.user.id, dto.signature);
  }
}
