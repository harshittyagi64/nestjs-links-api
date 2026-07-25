import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateLinkDto } from './dto/create-link.dto';
import { randomBytes } from 'crypto';
import { CacheService } from '../cache/cache.service';

export interface Link {
  id: number;
  code: string;
  long_url: string;
  principal_id: string;
  created_at: Date;
  expires_at?: Date | null;
  tags?: string[];
}

@Injectable()
export class LinksService {
  private links: Link[] = [];

  constructor(private readonly cacheService: CacheService) {}

  private generateShortCode(): string {
    return randomBytes(4).toString('hex');
  }

  create(createLinkDto: CreateLinkDto, principalId: string) {
    const code = this.generateShortCode();

    const link: Link = {
      id: this.links.length + 1,
      code,
      long_url: createLinkDto.long_url,
      principal_id: principalId,
      created_at: new Date(),
    };

    this.links.push(link);

    return link;
  }

  findAll(principalId: string, page: number, limit: number) {
    const userLinks = this.links.filter(
      (item) => item.principal_id === principalId,
    );

    return {
      page,
      limit,
      data: userLinks,
    };
  }

  findOne(id: number, principalId: string) {
    const link = this.links.find(
      (item) =>
        item.id === id &&
        item.principal_id === principalId,
    );

    if (!link) {
      throw new NotFoundException('Link not found');
    }

    return link;
  }

  findByCode(code: string) {
    const link = this.links.find(
      (item) => item.code === code,
    );

    if (!link) {
      throw new NotFoundException('Short URL not found');
    }

    return link;
  }

  async update(
    id: number,
    principalId: string,
    newUrl: string,
  ) {
    const link = this.links.find(
      (item) =>
        item.id === id &&
        item.principal_id === principalId,
    );

    if (!link) {
      throw new NotFoundException('Link not found');
    }

    link.long_url = newUrl;

    await this.cacheService.invalidateRedirectTarget(link.code);

    return link;
  }

  async remove(id: number, principalId: string) {
    const index = this.links.findIndex(
      (item) =>
        item.id === id &&
        item.principal_id === principalId,
    );

    if (index === -1) {
      throw new NotFoundException('Link not found');
    }

    const deletedLink = this.links[index];

    this.links.splice(index, 1);

    await this.cacheService.invalidateRedirectTarget(
      deletedLink.code,
    );
  }
}