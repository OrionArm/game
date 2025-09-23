import { IsNumber, IsNotEmpty, Min } from 'class-validator';

export class PurchaseItemDto {
  @IsNumber()
  @IsNotEmpty()
  itemId: number;

  @IsNumber()
  @IsNotEmpty()
  @Min(1)
  quantity: number;
}

export class ShopItemDto {
  id: number;
  itemId: number;
  price: string;
  stock: number;
  isAvailable: boolean;
  discount: string;
  item: {
    id: number;
    name: string;
    description: string;
    type: string;
    rarity: string;
    stats: any;
    value: number;
    stackable: boolean;
  };
}

export class ShopResponseDto {
  items: ShopItemDto[];
  totalItems: number;
}

export class PurchaseResponseDto {
  success: boolean;
  purchaseId: number;
  totalCost: string;
  remainingGold: number;
  message: string;
}
