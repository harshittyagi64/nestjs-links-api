import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsIn, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class QueryQrDto {

  @ApiPropertyOptional({
    description: 'Output format of QR code',
    enum: ['png', 'svg'],
    default: 'png',
  })
  @IsOptional()
  @IsIn(['png', 'svg'])
  format?: 'png' | 'svg' = 'png';


  @ApiPropertyOptional({
    description: 'QR code width',
    default: 300,
    minimum: 100,
    maximum: 1000,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(100)
  @Max(1000)
  width?: number = 300;


  @ApiPropertyOptional({
    description: 'QR margin',
    default: 2,
    minimum: 0,
    maximum: 10,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(10)
  margin?: number = 2;

}