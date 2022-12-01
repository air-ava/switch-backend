export interface findAndCreatePhoneNumberDTO {
  localFormat: string;
  countryCode: string;
}

export interface findAndCreateImageDTO {
  url: string;
  table_type: 'image' | 'business' | 'cart' | 'order' | 'product' | 'transactions';
  table_id: number;
  reference?: string;
}

export interface findAndCreateAssetsDTO {
  name: string;
  file_name: string;
  status: number;
  file_type: string;
  organisation: number;
  user: string;
}

export interface findAndCreateOrganisationDTO {
  business_name?: string;
  organisation_email?: string;
  // owner: string;
  slug: string;
}

export interface findAndCreateAddressDTO {
  street: string;
  country: string;
  state: string;
  city: string;
  status?: number;
  area: string;
}

export interface businessCheckerDTO {
  owner?: number;
  reference?: string;
}
