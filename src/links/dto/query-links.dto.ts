import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  IsNumber,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class QueryLinksDto {
@ApiPropertyOptional({
  description: 'Sort by created_at or clicks_count',
  example: 'created_at',
})
@IsOptional()
@IsString()
sort?: 'created_at' | 'clicks_count';
  @ApiPropertyOptional({
    description: 'Page number',
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page: number = 1;


  @ApiPropertyOptional({
    description: 'Number of records per page',
    example: 10,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit: number = 10;


  @ApiPropertyOptional({
    description: 'Search by code or URL',
    example: 'nestjs',
  })
  @IsOptional()
  @IsString()
  search?: string;


  @ApiPropertyOptional({
    description: 'Filter links by tag',
    example: 'marketing',
  })
  @IsOptional()
  @IsString()
  tag?: string;


  // MODULE 19: DOMAIN FILTER
  @ApiPropertyOptional({
    description: 'Filter links by custom branded domain',
    example: 'go.brand.io',
  })
  @IsOptional()
  @IsString()
  domain?: string;

}