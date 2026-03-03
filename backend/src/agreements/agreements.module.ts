import { Module } from '@nestjs/common';
import { AgreementsService } from './agreements.service';
import { AgreementsController } from './agreements.controller';
import { PdfService } from '../pdf/pdf.service';

@Module({
  providers: [AgreementsService, PdfService],
  controllers: [AgreementsController],
})
export class AgreementsModule {}
