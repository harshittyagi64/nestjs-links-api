import { Test, TestingModule } from '@nestjs/testing';
import { LinksController } from './links.controller';
import { LinksService } from './links.service';

describe('LinksController', () => {
  let controller: LinksController;

  const mockLinksService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    getStats: jest.fn(),
    getAnalytics: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [
        LinksController,
      ],
      providers: [
        {
          provide: LinksService,
          useValue: mockLinksService,
        },
      ],
    }).compile();

    controller = module.get<LinksController>(LinksController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});