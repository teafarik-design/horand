import { IsString, IsEnum, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { CompanyType } from '@prisma/client';

export class CreateCompanyDto {
  @ApiProperty() @IsString() @MinLength(1) name: string;
  @ApiProperty({ enum: CompanyType }) @IsEnum(CompanyType) type: CompanyType;
}
