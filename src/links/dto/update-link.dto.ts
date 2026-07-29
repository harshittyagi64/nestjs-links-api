import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsOptional,
  IsUrl,
  IsISO8601,
} from 'class-validator';

export class UpdateLinkDto {
  @ApiPropertyOptional({
    description: 'Updated destination URL',
    example: 'https://docs.nestjs.com',
  })
  @IsOptional()
  @IsUrl()
  long_url?: string;

  @ApiPropertyOptional({
    description: 'Updated expiration timestamp',
    example: '2026-12-31T23:59:59.000Z',
  })
  @IsOptional()
  @IsISO8601()
  expires_at?: string;
}