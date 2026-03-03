import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { PartnersService } from './partners.service';
import { CreatePartnerDto } from './dto/create-partner.dto';
import { UpdatePartnerDto } from './dto/update-partner.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('partners')
@Controller('companies/:companyId/partners')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class PartnersController {
  constructor(private partnersService: PartnersService) {}

  @Post()
  @UseInterceptors(FileInterceptor('photo'))
  @ApiConsumes('multipart/form-data')
  create(@Request() req, @Param('companyId') companyId: string, @Body() dto: CreatePartnerDto, @UploadedFile() photo?) {
    const photoUrl = photo ? '/uploads/' + photo.filename : undefined;
    return this.partnersService.create(companyId, req.user.id, dto, photoUrl);
  }

  @Get()
  findAll(@Request() req, @Param('companyId') companyId: string) {
    return this.partnersService.findAll(companyId, req.user.id);
  }

  @Patch(':id')
  @UseInterceptors(FileInterceptor('photo'))
  @ApiConsumes('multipart/form-data')
  update(@Request() req, @Param('companyId') companyId: string, @Param('id') id: string, @Body() dto: UpdatePartnerDto, @UploadedFile() photo?) {
    const photoUrl = photo ? '/uploads/' + photo.filename : undefined;
    return this.partnersService.update(id, companyId, req.user.id, dto, photoUrl);
  }

  @Delete(':id')
  remove(@Request() req, @Param('companyId') companyId: string, @Param('id') id: string) {
    return this.partnersService.remove(id, companyId, req.user.id);
  }
}
