export interface createOrderDTO {
  image_url?: string;
  payment_reference: string;
  item_name: string;
  item_amount: number;
  description: string;
  weight?: number;
  user_id: number;
  seller_id: number;
}

// export interface createOrderDTO {
//     image_url?: string;
//     reference: string;
//     item_name: string;
//     item_amount: number;
//     description: string;
//     weight?: number;
//     user_id: number;
//     seller_id: number;
//   }
