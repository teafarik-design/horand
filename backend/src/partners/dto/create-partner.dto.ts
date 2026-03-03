import { IsString, IsNumber, Min, Max, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreatePartnerDto {
  @ApiProperty() @IsString() @MinLength(2) fullName: string;
  @ApiProperty({ minimum: 1, maximum: 99 }) @Type(() => Number) @IsNumber() @Min(1) @Max(99) share: number;
}
