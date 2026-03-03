import { IsString, IsEnum, IsOptional, MinLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { CompanyType } from '@prisma/client';

export class UpdateCompanyDto {
  @ApiPropertyOptional() @IsOptional() @IsString() @MinLength(1) name?: string;
  @ApiPropertyOptional({ enum: CompanyType }) @IsOptional() @IsEnum(CompanyType) type?: CompanyType;
}
