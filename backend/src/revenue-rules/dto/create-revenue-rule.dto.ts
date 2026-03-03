import { IsString, IsEnum, IsOptional, IsArray, ValidateNested, IsUUID, IsNumber, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { RevenueType } from '@prisma/client';

export class RevenueShareDto {
  @ApiProperty() @IsUUID() partnerId: string;
  @ApiProperty({ minimum: 0, maximum: 100 }) @IsNumber() @Min(0) @Max(100) share: number;
}

export class CreateRevenueRuleDto {
  @ApiProperty({ enum: RevenueType }) @IsEnum(RevenueType) type: RevenueType;
  @ApiProperty() @IsString() name: string;
  @ApiPropertyOptional() @IsOptional() @IsString() description?: string;
  @ApiProperty({ type: [RevenueShareDto] }) @IsArray() @ValidateNested({ each: true }) @Type(() => RevenueShareDto) shares: RevenueShareDto[];
}
