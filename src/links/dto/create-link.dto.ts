import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsUrl,
  IsNotEmpty,
  IsOptional,
  IsISO8601,
  IsString,
  Matches,
} from 'class-validator';

export class CreateLinkDto {
  @ApiProperty({
    description: 'The target original long URL to shorten',
    example: 'https://nestjs.com',
  })
  @IsUrl()
  @IsNotEmpty()
  long_url: string;

  @ApiPropertyOptional({
    description: 'Optional expiration timestamp',
    example: '2026-12-31T23:59:59.000Z',
  })
  @IsOptional()
  @IsISO8601()
  expires_at?: string;

  @ApiPropertyOptional({
    description: 'Optional custom short code',
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
    example: ['marketing', 'sale'],
  })
  @IsOptional()
  tags?: string[];
}