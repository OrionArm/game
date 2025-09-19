/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { ShortUrlService } from './shorten/short_url.service';
import { CreateShortUrlDto } from './shorten/create-short-url.dto';
import { ShortUrl } from './shorten/short_url.schema';
import { DrizzleModule } from './db/drizzle.module';
import { AppController } from './app.controller';
const mockShortUrl: ShortUrl = {
  id: 1,
  url: 'https://example.com',
  createdAt: new Date(),
  expiresAt: undefined,
  alias: 'abc123',
};

const mockCreateDto: CreateShortUrlDto = {
  url: 'https://example.com',
};

describe('AppController', () => {
  let controller: AppController;
  let shortUrlService: ShortUrlService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [DrizzleModule],
      controllers: [AppController],
      providers: [
        {
          provide: ShortUrlService,
          useValue: {
            create: jest.fn().mockResolvedValue(mockShortUrl),
          },
        },
      ],
    }).compile();

    controller = module.get<AppController>(AppController);
    shortUrlService = module.get<ShortUrlService>(ShortUrlService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createShortUrl', () => {
    it('should create a short URL without alias and expiration', async () => {
      const result = await controller.createShortUrl(mockCreateDto);
      expect(result).toEqual(mockShortUrl);
      expect(shortUrlService.create).toHaveBeenCalledTimes(1);
      expect(shortUrlService.create).toHaveBeenCalledWith({
        url: mockCreateDto.url,
        alias: undefined,
        expiresAt: undefined,
      });
    });

    it('should pass optional alias and expiration when provided', async () => {
      // Arrange
      const dtoWithOptions: CreateShortUrlDto = {
        url: 'https://example.com',
        alias: 'my-alias',
        expiresAt: new Date('2024-12-31').toISOString(),
      };

      // Act
      await controller.createShortUrl(dtoWithOptions);

      // Assert
      expect(shortUrlService.create).toHaveBeenCalledWith({
        url: dtoWithOptions.url,
        alias: dtoWithOptions.alias,
        expiresAt: dtoWithOptions.expiresAt,
      });
    });

    it('should handle service errors', async () => {
      const error = new Error('Service error');
      jest.spyOn(shortUrlService, 'create').mockRejectedValue(error);

      // Act & Assert
      await expect(controller.createShortUrl(mockCreateDto)).rejects.toThrow(
        error,
      );
    });
  });
});
