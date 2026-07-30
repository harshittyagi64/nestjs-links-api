import { ApiProperty } from '@nestjs/swagger';
import {
  IsUrl,
  IsArray,
  IsIn,
  ArrayNotEmpty,
} from 'class-validator';

export class CreateWebhookDto {
  @ApiProperty({
    description: 'Target URL to receive webhook event POST requests',
    example: 'https://example.com/webhooks/nestjs',
  })
  @IsUrl()
  url: string;

  @ApiProperty({
    description: 'Array of event types to subscribe to',
    example: ['link.created', 'link.clicked'],
  })
  @IsArray()
  @ArrayNotEmpty()
  @IsIn(['link.created', 'link.clicked'], {
    each: true,
  })
  events: ('link.created' | 'link.clicked')[];
}