import { IsString, IsNumber, Min, Max, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class UpdatePartnerDto {
  @ApiPropertyOptional() @IsOptional() @IsString() fullName?: string;
  @ApiPropertyOptional({ minimum: 1, maximum: 99 }) @IsOptional() @Type(() => Number) @IsNumber() @Min(1) @Max(99) share?: number;
}
