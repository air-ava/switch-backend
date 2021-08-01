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
