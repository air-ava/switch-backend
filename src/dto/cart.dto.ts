import { createProductDTO } from './product.dto';

export interface CartedProductDTO {
  quantity: number;
  items: string;
}

export interface createCartDTO {
  products: CartedProductDTO;
  shopper: number;
  business: string;
}

export interface updateCartDTO {
  products: CartedProductDTO;
  cart: {
    reference: string;
    id: number;
  };
}

export interface getShopperCartDTO {
  reference: string;
  shopper: number;
}

export interface getBusinessCartDTO {
  reference?: string;
  owner: number;
  business: string;
}
