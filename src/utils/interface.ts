export interface Response {
  success: boolean;
  message?: string;
  error?: any;
}

export interface theResponse {
  success: boolean;
  message?: string;
  error?: any;
  data?: any;
}

export interface ControllerResponse {
  success: boolean;
  error?: string;
  message?: string;
}

export interface IOrder {
  id: number;
  pickup_address_id?: number;
  delivery_address_id?: number;
  payment_reference: string;
  reference: string;
  status: string;
  item_name?: string;
  item_amount?: number;
  processor: string;
  processor_reference?: string;
  pickup_name: string;
  pickup_email: string;
  delivery_name: string;
  delivery_email: string;
  description?: string;
  distance?: number;
  weight?: number;
  time?: number;
  fare?: number;
  cancelled: boolean;
  processed_at?: Date;
  cancelled_at?: Date;
  created_at: Date;
  updated_at?: Date;
  image_url?: string;
  product_id?: number;
  source: string;
  external_reference?: string;
}
