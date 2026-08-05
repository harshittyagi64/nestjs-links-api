import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { LinksService } from './links.service';
import { LinkEntity } from './entities/link.entity';
import { ClickLogEntity } from './entities/click-log.entity';
import { CacheService } from '../cache/cache.service';
import { WebhooksService } from '../webhooks/webhooks.service';


const mockRepository = {
  findOne: jest.fn(),
  find: jest.fn(),
  save: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};


describe('LinksService', () => {
  let service: LinksService;

  beforeEach(async () => {

    const module: TestingModule = await Test.createTestingModule({

      providers: [

        LinksService,

        {
          provide: getRepositoryToken(LinkEntity),
          useValue: mockRepository,
        },

        {
          provide: getRepositoryToken(ClickLogEntity),
          useValue: mockRepository,
        },

        {
          provide: CacheService,
          useValue: {
            get: jest.fn(),
            set: jest.fn(),
            del: jest.fn(),
          },
        },

        {
          provide: WebhooksService,
          useValue: {
            emit: jest.fn(),
          },
        },

      ],

    }).compile();


    service = module.get<LinksService>(LinksService);

  });


  it('should be defined', () => {
    expect(service).toBeDefined();
  });

});