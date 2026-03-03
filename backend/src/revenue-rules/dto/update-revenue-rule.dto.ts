import { IsString, IsEnum, IsOptional, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { RevenueType } from '@prisma/client';
import { RevenueShareDto } from './create-revenue-rule.dto';

export class UpdateRevenueRuleDto {
  @ApiPropertyOptional({ enum: RevenueType }) @IsOptional() @IsEnum(RevenueType) type?: RevenueType;
  @ApiPropertyOptional() @IsOptional() @IsString() name?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() description?: string;
  @ApiPropertyOptional({ type: [RevenueShareDto] }) @IsOptional() @IsArray() @ValidateNested({ each: true }) @Type(() => RevenueShareDto) shares?: RevenueShareDto[];
}
