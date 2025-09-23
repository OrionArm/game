import { Controller, Get, Post, Body, ValidationPipe } from '@nestjs/common';
import { ShopService } from './shop.service';
import { PurchaseItemDto, ShopResponseDto, PurchaseResponseDto } from './shop.dto';

@Controller('api/shop')
export class ShopController {
  constructor(private readonly shopService: ShopService) {}

  @Get()
  async getShopItems(): Promise<ShopResponseDto> {
    return this.shopService.getShopItems();
  }

  @Post('purchase')
  async purchaseItem(
    @Body(new ValidationPipe()) purchaseDto: PurchaseItemDto,
  ): Promise<PurchaseResponseDto> {
    // TODO: Получить userId из токена аутентификации
    const userId = 1; // Временная заглушка
    return this.shopService.purchaseItem(userId, purchaseDto);
  }
}
