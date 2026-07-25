import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request } from 'express';

const API_KEY_MAP: Record<string, string> = {
  'key-alpha-123': 'principal-1',
  'key-beta-456': 'principal-2',
};

@Injectable()
export class ApiKeyGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();

    const apiKey = request.headers['x-api-key'] as string;

    if (!apiKey) {
      throw new UnauthorizedException('X-API-Key header is missing');
    }

    const principalId = API_KEY_MAP[apiKey];

    if (!principalId) {
      throw new UnauthorizedException('Invalid API key');
    }

    request['principal_id'] = principalId;

    return true;
  }
}