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
