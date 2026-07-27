import { Transform } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
} from 'class-validator';

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateLinkDto {
  @ApiProperty({
    description: 'Original URL to shorten',
    example: 'https://nestjs.com',
  })
  @IsNotEmpty()
  @IsString()
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @Matches(/^https?:\/\//i, {
    message: 'long_url must start with http:// or https://',
  })
  long_url: string;


  @ApiPropertyOptional({
    description: 'Optional expiration timestamp in ISO 8601 format',
    example: '2026-12-31T23:59:59.000Z',
  })
  @IsOptional()
  @IsDateString()
  expires_at?: string;


  @ApiPropertyOptional({
    description: 'Optional custom short code / vanity alias',
    example: 'my-promo',
  })
  @IsOptional()
  @IsString()
  @Matches(/^[a-zA-Z0-9_-]+$/, {
    message:
      'Custom code can only contain alphanumeric characters, hyphens, and underscores',
  })
  custom_code?: string;


  @ApiPropertyOptional({
    description: 'Optional tags',
    example: ['nestjs', 'backend'],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ArrayMaxSize(5)
  @MaxLength(20, { each: true })
  tags?: string[];
}