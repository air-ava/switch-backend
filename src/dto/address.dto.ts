export interface createAddressDTO {
  street: string;
  country: string;
  state: string;
  area: string;
  city: string;
  reference: string;
  userId: number;
  default?: boolean;
  is_business?: boolean;
}

export interface getAddressDTO {
  reference?: string;
  owner?: string;
  public?: boolean;
}
