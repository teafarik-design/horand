import { IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class ExportPdfDto {
  @ApiPropertyOptional({ description: 'Base64 encoded signature image' })
  @IsOptional() @IsString() signature?: string;
}
