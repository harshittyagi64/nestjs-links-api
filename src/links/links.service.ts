import { UpdateLinkDto } from './dto/update-link.dto';
import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';

import { CreateLinkDto } from './dto/create-link.dto';
import { randomBytes } from 'crypto';
import { CacheService } from '../cache/cache.service';

export interface ClickLog {
  timestamp: Date;
  userAgent?: string;
  ip?: string;
}

export interface Link {
  id: number;
  code: string;
  long_url: string;
  principal_id: string;
  created_at: Date;
  expires_at?: Date | null;
  tags?: string[];

  clicks_count?: number;
  last_accessed_at?: Date;
  logs?: ClickLog[];
}

@Injectable()
export class LinksService {
  private links: Link[] = [];

  constructor(
    private readonly cacheService: CacheService,
  ) {}

  private generateShortCode(): string {
    return randomBytes(4).toString('hex');
  }


  /**
   * Check link expiration
   */
  isExpired(link: Link): boolean {
    if (!link.expires_at) return false;

    return new Date() > new Date(link.expires_at);
  }


  /**
   * Create new short link
   * Supports:
   * - normal random code
   * - custom vanity alias
   * - expiration date
   */
  create(
    createLinkDto: CreateLinkDto,
    principalId: string,
  ) {
    let code =
      createLinkDto.custom_code ||
      this.generateShortCode();


    // Check custom code uniqueness
    if (createLinkDto.custom_code) {
      const existing = this.links.find(
        (link) =>
          link.code === createLinkDto.custom_code,
      );

      if (existing) {
        throw new ConflictException(
          `Short code "${createLinkDto.custom_code}" is already in use.`,
        );
      }
    }


    const link: Link = {
      id: this.links.length + 1,
      code,

      long_url:
        createLinkDto.long_url,

      principal_id:
        principalId,

      created_at:
        new Date(),

      expires_at:
        createLinkDto.expires_at
          ? new Date(createLinkDto.expires_at)
          : undefined,
          
    };


    this.links.push(link);

    return link;
  }


async findPaginated(
  principalId: string,
  page: number = 1,
  limit: number = 10,
  search?: string,
  tag?: string,
) {
  let userLinks = this.links.filter(
    (link) =>
      link.principal_id === principalId,
  );


  if (search) {
    const query = search.toLowerCase();

    userLinks = userLinks.filter(
      (link) =>
        link.code.toLowerCase().includes(query) ||
        link.long_url.toLowerCase().includes(query),
    );
  }


  if (tag) {
    const targetTag = tag.toLowerCase();

    userLinks = userLinks.filter((link) =>
      link.tags?.some(
        (t) => t.toLowerCase() === targetTag,
      ),
    );
  }


  const total = userLinks.length;

  const totalPages =
    Math.ceil(total / limit) || 1;


  const startIndex =
    (page - 1) * limit;


  const data =
    userLinks.slice(
      startIndex,
      startIndex + limit,
    );


  return {
    data,
    total,
    page,
    limit,
    totalPages,
  };
}


  findOne(
    id: number,
    principalId: string,
  ) {
    const link =
      this.links.find(
        (item) =>
          item.id === id &&
          item.principal_id === principalId,
      );


    if (!link) {
      throw new NotFoundException(
        'Link not found',
      );
    }

    return link;
  }



  findByCode(code: string) {
    const link =
      this.links.find(
        (item) =>
          item.code === code,
      );


    if (!link) {
      throw new NotFoundException(
        'Short URL not found',
      );
    }

    return link;
  }



  async update(
  id: number,
  principalId: string,
  updateData: UpdateLinkDto,
) {
  const link = this.links.find(
    (item) =>
      item.id === id &&
      item.principal_id === principalId,
  );

  if (!link) {
    throw new NotFoundException(
      'Link not found',
    );
  }

  if (updateData.long_url !== undefined) {
    link.long_url = updateData.long_url;
  }

  if (updateData.expires_at !== undefined) {
    link.expires_at = updateData.expires_at
      ? new Date(updateData.expires_at)
      : undefined;
      if (updateData.tags !== undefined) {
  link.tags = updateData.tags;
}
  }

  await this.cacheService.invalidateRedirectTarget(
    link.code,
  );

  return link;
}


  async remove(
    id: number,
    principalId: string,
  ) {
    const index =
      this.links.findIndex(
        (item) =>
          item.id === id &&
          item.principal_id === principalId,
      );


    if (index === -1) {
      throw new NotFoundException(
        'Link not found',
      );
    }


    const deletedLink =
      this.links[index];


    this.links.splice(
      index,
      1,
    );


    await this.cacheService.invalidateRedirectTarget(
      deletedLink.code,
    );
  }



  async recordClick(
    code: string,
    metadata: {
      userAgent?: string;
      ip?: string;
    },
  ): Promise<void> {

    const link =
      this.links.find(
        (l) =>
          l.code === code,
      );


    if (!link) {
      return;
    }


    link.clicks_count =
      (link.clicks_count || 0) + 1;


    link.last_accessed_at =
      new Date();



    if (!link.logs) {
      link.logs = [];
    }


    link.logs.unshift({
      timestamp:
        link.last_accessed_at,

      userAgent:
        metadata.userAgent,

      ip:
        metadata.ip,
    });


    if (link.logs.length > 50) {
      link.logs.pop();
    }
  }
  async createBulk(
  principalId: string,
  dtos: CreateLinkDto[],
): Promise<Link[]> {
  const createdLinks: Link[] = [];

  for (const dto of dtos) {
    const link = this.create(
      dto,
      principalId,
    );

    createdLinks.push(link);
  }

  return createdLinks;
}



  async getLinkStats(
    id: number,
    principalId: string,
  ): Promise<Link> {

    const link =
      this.links.find(
        (l) =>
          l.id === id,
      );


    if (!link) {
      throw new NotFoundException(
        'Link not found',
      );
    }


    if (link.principal_id !== principalId) {
      throw new UnauthorizedException(
        'Access denied to link statistics.',
      );
    }


    return link;
  }
}