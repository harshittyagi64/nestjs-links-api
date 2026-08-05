import { Test, TestingModule } from '@nestjs/testing';
import { RedirectController } from './redirect.controller';
import { LinksService } from '../links/links.service';
import { CacheService } from '../cache/cache.service';

describe('RedirectController', () => {
  let controller: RedirectController;

  const mockLinksService = {
    findByCode: jest.fn(),
    getLinkByCode: jest.fn(),
    recordClick: jest.fn(),
  };

  const mockCacheService = {
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
  };

  const mockQueue = {
    add: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [
        RedirectController,
      ],
      providers: [
        {
          provide: LinksService,
          useValue: mockLinksService,
        },
        {
          provide: CacheService,
          useValue: mockCacheService,
        },
        {
          provide: 'BullQueue_click-events',
          useValue: mockQueue,
        },
      ],
    }).compile();

    controller = module.get<RedirectController>(RedirectController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});