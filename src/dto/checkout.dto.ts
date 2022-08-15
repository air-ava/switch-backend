export interface completeCheckoutDTO {
  processor_reference: string;
  external_reference?: string;
  metadata: { [key: string]: any };
  cartReference: string;
  processor_response?: string;
  shopper: number;
  business: string;
  shopper_address: number;
  business_address: number;
}
