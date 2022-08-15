export interface createProductDTO {
  description?: string;
  name: string;
  images: string[];
  business: string;
  product_categories: number;
  unit_price: number;
  quantity?: number;
  unlimited?: boolean;
  publish?: boolean;
}

export interface viewAllProductDTO {
  business: string;
  from?: string;
  to?: string;
  search?: string;
  quantity?: string;
}
