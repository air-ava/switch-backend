export interface IAddress {
  id: number;
  user_mobile: string;
  address: string;
  country: string;
  state: string;
  city_name: string;
  city_code: string;
  town_name: string;
  town_id: string;
  lat: string;
  long: string;
  default: boolean;
  business_mobile?: string;
  is_business?: boolean;
  created_at: Date;
  deleted: boolean;
  deleted_at: Date;
}

export interface IUser {
  id: number;
  email: string;
  password: string;
  phone_number: number;
  first_name: string;
  last_name: string;
  enabled: boolean;
  is_business: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface IPhoneNumber {
  id: number;
  countryCode: string;
  localFormat: string;
  internationalFormat: string;
  active: boolean;
  is_verified: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface IBusiness {
  id: number;
  name: string;
  description: string;
  logo?: string;
  active: boolean;
  phone_number: string;
  reference: string;
  owner: number;
  // default: boolean;
  created_at: Date;
  updated_at: Date;
  // Owner: IUser;
}

export interface IImage {
  id: number;
  table_id: number;
  table_type: string;
  url: string;
  available: boolean;
  reference: string;
  created_at: Date;
  updated_at: Date;
}

export interface IProductCategory {
  id: number;
  image: number;
  name: string;
  description: string;
  created_at: Date;
  updated_at: Date;
}

export interface IProduct {
  id: number;
  reference: string;
  name: string;
  unit_price: number;
  quantity: number;
  weight: number;
  description?: string;
  image_reference: string;
  product_categories: number;
  business: number;
  publish: boolean;
  unlimited: boolean;
  expire_at: Date;
  created_at: Date;
  updated_at: Date;
}

export interface ITransactions {
  id: number;
  reference: string;
  description?: string;
  purpose: string;
  processor_reference: string;
  processor: string;
  response: string;
  amount: number;
  txn_type: 'debit' | 'credit';
  shopper: number;
  business: number;
  created_at: Date;
  updated_at: Date;
}

export interface IAddresses {
  id: number;
  street: string;
  country: string;
  state: string;
  city: string;
  active: boolean;
  default: boolean;
  shopper?: number;
  business?: number;
  deleted_at: Date;
  created_at: Date;
  updated_at: Date;
}

export interface ICart {
  id: number;
  reference: string;
  completed: boolean;
  shopper: number;
  business: number;
  amount: number;
  quantity: number;
  completed_at: Date;
  deleted_at: Date;
  created_at: Date;
  updated_at: Date;
}

export interface ICartProduct {
  id: number;
  quantity: number;
  product: number;
  cart: number;
  created_at: Date;
  updated_at: Date;
}

export interface IOrder {
  id: number;
  reference: string;
  payment_reference: string;
  shopper_address: number;
  business_address: number;
  shopper: number;
  business: number;
  external_reference?: string;
  cart_reference: string;
  metadata?: { [key: string]: any };
  processed_at: Date;
  created_at: Date;
  updated_at: Date;
}
