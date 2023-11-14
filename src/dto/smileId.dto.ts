export interface IStatusAndResponse {
  status: number;
  response: string;
}

// eslint-disable-next-line no-shadow
export enum SMILE_ErrorCodes {
  DataInvalid = '0001',
  InvalidSignature = '2405',
  ParameterErrorRequiredKeys = '2213',
  ParameterErrorFormat = '2204',
  AuthorizationErrorsInvalidSignature = '2205',
  AuthorizationErrorsKYCNotComplete = '2220',
  ParameterErrorInvalidJobType = '2212',
  InvalidID = '1013',
  InvalidIDNumberFormat = '1014',
  IDAuthorityUnavailable = '1015',
  AuthorizationErrorsProductNotActivated = '1016',
  NoMatch = '1022',
  UnableToVerifyDocumentExpired = '0811',
  UnableToVerifyDocumentUnusableImage = '0812',
  // ... any other error codes can be added here.
}

// eslint-disable-next-line no-shadow
export enum SMILE_SuccessCodes {
  ApprovedExactMatch = '1020',
  ApprovedPartialMatch = '1021',
  DocumentVerified = '0810',
  NoMatch = '1022', // Note that 'No Match' is mentioned as a success code, ensure it is correct as per your application logic.
  IDNumberValidated = '1012',
  // ... any other success codes can be added here.
}

export const SMILE_STATUS_CATEGORIES = {
  REJECTED: 'Rejected',
  AUTHORISATION_ERRORS: 'Authorisation_Errors',
  AVAILABILITY_ERROR: 'Avalability_Error',
  PARAMETER_ERROR: 'Parameter_Error',
  APPROVED: 'Approved',
};

// Now, let's expand the ERROR_MESSAGES Record to include all these errors:
export const SMILE_ERROR_MESSAGES: Record<SMILE_ErrorCodes, string> = {
  [SMILE_ErrorCodes.DataInvalid]: 'Rejected: Data Invalid',
  [SMILE_ErrorCodes.InvalidSignature]: 'Authorisation_Errors: An invalid signature was used to sign the request',
  [SMILE_ErrorCodes.ParameterErrorRequiredKeys]: 'Parameter_Error: Not all the required keys were submitted in the info.json or request payload',
  [SMILE_ErrorCodes.ParameterErrorFormat]: 'Parameter_Error: The format of one of the request values was wrong.',
  [SMILE_ErrorCodes.AuthorizationErrorsInvalidSignature]: 'Authorisation_Errors: An invalid signature was used to sign the request',
  [SMILE_ErrorCodes.AuthorizationErrorsKYCNotComplete]: 'Authorisation_Errors: You have not completed your KYC',
  [SMILE_ErrorCodes.ParameterErrorInvalidJobType]: 'Parameter_Error: An invalid value was inputted in the job_type key',
  [SMILE_ErrorCodes.InvalidID]: 'Rejected:Invalid_ID: The ID info was not found in the ID authority database.',
  [SMILE_ErrorCodes.InvalidIDNumberFormat]: 'Parameter_Error: The ID number submitted was of an invalid format',
  [SMILE_ErrorCodes.IDAuthorityUnavailable]: 'Avalability_Error: The ID authority is unavailable',
  [SMILE_ErrorCodes.AuthorizationErrorsProductNotActivated]: 'Authorisation_Errors:Need_to_Activate_Product: You do not have access to the ID Type',
  [SMILE_ErrorCodes.NoMatch]: 'Rejected:No_Match: None of the user submitted details partially/exactly match the ID info in the ID authority database',
  [SMILE_ErrorCodes.UnableToVerifyDocumentExpired]:
    'Rejected:Unable_to_Verify_Document: Document is expired || The selfie did not match the photo on document || Selfie failed liveness checks || Some security features were missing on the document || The information on document is inconsistent || A wrong document type was uploaded',
  [SMILE_ErrorCodes.UnableToVerifyDocumentUnusableImage]:
    'Rejected:Unable_to_Verify_Document: Document verification failed because the document image is unusable or an invalid document image was uploaded',
  // ... any other error messages can be added here.
};

// Now, let's expand the SUCCESS_MESSAGES Record to include all these success responses:
export const SMILE_SUCCESS_MESSAGES: Record<SMILE_SuccessCodes, string> = {
  [SMILE_SuccessCodes.ApprovedExactMatch]: 'Approved:Exact_Match: The user submitted details exactly match the ID info in the ID authority database',
  [SMILE_SuccessCodes.ApprovedPartialMatch]:
    'Approved:Partial_Match:At least one of the user submitted details partially/exactly match the ID info in the ID authority database',
  [SMILE_SuccessCodes.DocumentVerified]: 'Approved:Document_Verified:Images matched, no spoof was detected on Selfie and the document is valid',
  [SMILE_SuccessCodes.NoMatch]: 'Approved:No Match', // As with the error codes, ensure this message is correct for a success code labeled 'No Match'.
  [SMILE_SuccessCodes.IDNumberValidated]: 'Approved:Validated: ID_Number_Validated',
  // ... any other success messages can be added here.
};

// This enum along with the corresponding messages can be used to reference success states throughout your application.

export const isValidEnumValue = <T extends string>(value: string, enumType: { [key: string]: T }): value is T => {
  return Object.values(enumType).includes(value as T);
};
