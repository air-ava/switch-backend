import { RequestHandler } from 'express';
import { log } from 'winston';
import { allBusinessAndProducts } from '../services/public.service';
import { ValidationError, oldSendObjectResponse } from '../utils/errors';
import { Log } from '../utils/logs';
import countries from '../miscillaneous/countries.json';
import { getScholarships } from '../services/scholarship.service';
import GuardianService from '../services/guardian.service';
import DirectorService from '../services/director.service';
import DocumentService from '../services/document.service';
import { Sanitizer } from '../utils/sanitizer';
import { getPartnership } from '../services/organisation.service';
import { getPublicSchoolDetails } from '../services/school.service';
import ResponseService from '../utils/response';
import { completeOfficerValidator } from '../validators/public.validator';
import { updateIndividual } from '../database/repositories/individual.repo';
import { STATUSES } from '../database/models/status.model';

export const allBusinessAndProductsCONTROLLER: RequestHandler = async (req, res) => {
  try {
    const { from, to, search, quantity } = req.query;

    const response = await allBusinessAndProducts({
      ...(from && { from: String(from) }),
      ...(to && { to: String(to) }),
      ...(search && { search: String(to) }),
      ...(quantity && { quantity: String(quantity) }),
    });
    const responseCode = response.success === true ? 200 : 400;
    return res.status(responseCode).json(response);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, error: 'Could not fetch beneficiaries.', data: error });
  }
};

export const countriesCONTROLLER: RequestHandler = async (req, res) => {
  try {
    return res.status(200).json(oldSendObjectResponse('Countries retrieved successfully', countries));
  } catch (error) {
    log(Log.fg.red, error);
    return res.status(500).json({ success: false, error: 'Could not fetch beneficiaries.', data: error });
  }
};

export const getScholarshipsCONTROLLER: RequestHandler = async (req, res) => {
  try {
    const response = await getScholarships();
    const responseCode = response.success === true ? 200 : 400;
    const { data, message, error } = response;
    return res.status(responseCode).json(oldSendObjectResponse(message || error, Sanitizer.sanitizeAllArray(data, Sanitizer.sanitizeScholarship)));
  } catch (error) {
    console.log({ error });
    return res.status(500).json({ success: false, error: 'Could not fetch beneficiaries.', data: error });
  }
};

export const getPartnershipScholarshipCONTROLLER: RequestHandler = async (req, res) => {
  try {
    const response = await getPartnership(req.params.slug);
    const responseCode = response.success === true ? 200 : 400;
    const { data, message, error } = response;
    return res.status(responseCode).json(oldSendObjectResponse(message || error, Sanitizer.sanitizePartner(data), true));
    // return res.status(responseCode).json(data);
  } catch (error) {
    console.log({ error });
    return res.status(500).json({ success: false, error: 'Could not fetch beneficiaries.', data: error });
  }
};

export const getPublicSchoolCONTROLLER: RequestHandler = async (req, res) => {
  const response = await getPublicSchoolDetails(req.params.code);
  const { data, message, error } = response;
  return ResponseService.success(res, message || error, data);
};

export const getGuardianWardCONTROLLER: RequestHandler = async (req, res) => {
  const payload = { guardian_username: req.params.username, school_slug: req.params.code };
  const response = await GuardianService.validateGuardianUsername(payload);
  const { data, message, error } = response;
  return ResponseService.success(res, message || error, data);
};

export const getInvitedOfficerCONTROLLER: RequestHandler = async (req, res) => {
  const payload = { director_username: req.params.username, organisation_slug: req.params.code };
  const response = await DirectorService.getInvitedOfficer(payload);
  const { data, message, error } = response;
  return ResponseService.success(res, message || error, data);
};

export const completeOrganisationOfficerInviteCONTROLLER: RequestHandler = async (req, res) => {
  const params = { director_username: req.params.username, organisation_slug: req.params.code };
  const payload = { ...req.body, ...params };

  const validation = completeOfficerValidator.validate(payload);
  if (validation.error) throw new ValidationError(validation.error.message);

  const { data: officer } = await DirectorService.getInvitedOfficer({ ...params, belongsToOrganisation: true });
  const { organisation, organisationOfficer } = officer;
  // get officer code
  const response = await DirectorService.updateOrganisationOfficer({
    ...payload,
    user: organisation.Owner,
    organisation,
    officerCode: organisationOfficer.code,
  });

  const { isAlldocumentsSubmitted } = await DocumentService.areAllRequiredDocumentsSubmitted({
    tag: 'DIRECTOR',
    process: 'onboarding',
    country: organisation.Owner.country.toUpperCase(),
  });
  if (isAlldocumentsSubmitted) await updateIndividual({ id: organisationOfficer.id }, { status: STATUSES.ACTIVE });

  const { data, message, error } = response;
  return ResponseService.success(res, message || error, data);
};
