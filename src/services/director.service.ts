import randomstring from 'randomstring';
import { Not } from 'typeorm';
import { STATUSES } from '../database/models/status.model';
import { listDirectors, findIndividual, saveIndividual, updateIndividual } from '../database/repositories/individual.repo';
import { addOrganisationOfficerDTO, updateOrganisationOfficerDTO } from '../dto/school.dto';
import { sendObjectResponse } from '../utils/errors';
import ExistsError from '../utils/existsError';
import { theResponse } from '../utils/interface';
import NotFoundError from '../utils/notFounfError';
import ValidationError from '../utils/validationError';
import { findOrCreatePhoneNumber } from './helper.service';
import Settings from './settings.service';
import DocumentService from './document.service';
import { sendEmail } from '../utils/mailtrap';
import { getOneOrganisationREPO, updateOrganisationREPO } from '../database/repositories/organisation.repo';
import { sendSlackMessage } from '../integrations/extra/slack.integration';
import Utils from '../utils/utils';
import { Sanitizer } from '../utils/sanitizer';

const Service = {
  async listSchoolDirectors(data: any): Promise<theResponse> {
    const response = await listDirectors({ school_id: data.school, status: Not(STATUSES.DELETED) }, [], ['phoneNumber', 'Avatar', 'JobTitle']);
    return sendObjectResponse('All Officers retrieved successfully', response);
  },

  async addOrganisationOfficer(data: addOrganisationOfficerDTO): Promise<theResponse> {
    // eslint-disable-next-line prettier/prettier
    const { nationality, dob, school: foundSchool, organisation, documents, country = 'UGANDA', type = 'director', job_title, email, user, phone_number: reqPhone, firstName, lastName } = data;

    const phoneNumber = await findOrCreatePhoneNumber(reqPhone);
    const { id: phone_number } = phoneNumber.data;

    const school_id = foundSchool.id;
    const organisationOwner = await findIndividual({ school_id: foundSchool.id }, []);
    if (!organisationOwner) throw new NotFoundError('organisation owner');
    // eslint-disable-next-line prettier/prettier
    const organisationOfficer = await findIndividual([{ school_id, email }, { school_id, phoneNumber: phone_number }], []);
    if (organisationOfficer) throw new ExistsError('Director');

    const document_reference = `doc_ref_${randomstring.generate({ length: 12, capitalization: 'lowercase', charset: 'alphanumeric' })}`;
    const onboarding_reference =
      organisation.onboarding_reference || `onb_${randomstring.generate({ length: 20, capitalization: 'lowercase', charset: 'alphanumeric' })}`;

    const savedDirector = await saveIndividual({
      email,
      firstName,
      lastName,
      phone_number,
      job_title: job_title && Settings.get('JOB_TITLES')[job_title],
      school_id: foundSchool.id,
      onboarding_reference,
      ...(dob && { dob: new Date(dob) }),
      nationality,
      document_reference,
      type: type && type.toLowerCase(),
    });

    if (country === 'NIGERIA') {
      const tag = 'DIRECTOR';
      const process = 'onboarding';
      await DocumentService.addMultipleDocuments({
        documents,
        user,
        tag,
        process,
        country,
        incoming_reference: document_reference,
        verificationData: {
          queue: 'review:customer:submission',
          message: {
            onboarding_reference,
            document_reference,
            tag,
            process,
            school_id: foundSchool.code,
            org_id: organisation.code,
            user_id: savedDirector.code,
            table_type: 'individual',
          },
        },
      });
    }
    return sendObjectResponse('School Officer Information successfully added');
  },

  async updateOrganisationOfficer(data: updateOrganisationOfficerDTO): Promise<theResponse> {
    const {
      dob,
      user,
      school,
      organisation,
      officerCode,
      documents,
      type = 'director',
      job_title,
      email,
      phone_number: reqPhone,
      firstName,
      lastName,
    } = data;

    if (!school && !organisation) throw new ValidationError('Does not belong to any organisation');
    const organisationOfficer = await findIndividual(
      {
        code: officerCode,
        ...(organisation && { onboarding_reference: organisation.onboarding_reference }),
        ...(school && { school_id: school.id }),
        type: Not('guardian'),
        status: Not(STATUSES.DELETED),
      },
      [],
    );
    if (!organisationOfficer) throw new NotFoundError('Director');
    if (organisationOfficer.verification_status === STATUSES.VERIFIED) throw new ValidationError('Officer has been verified');
    const updatePayload = { ...organisationOfficer };
    if (!organisationOfficer.document_reference) updatePayload.document_reference = `doc_ref_${randomstring.generate({ length: 12, capitalization: 'lowercase', charset: 'alphanumeric' })}`;
    if (reqPhone) {
      const phoneNumber = await findOrCreatePhoneNumber(reqPhone);
      const { id: phone_number } = phoneNumber.data;
      updatePayload.phone_number = phone_number;
    }
    if (type) updatePayload.type = type.toLowerCase();
    if (job_title) updatePayload.job_title = Settings.get('JOB_TITLES')[job_title];
    if (email) updatePayload.email = email;
    if (firstName) updatePayload.firstName = firstName;
    if (lastName) updatePayload.lastName = lastName;
    if (dob) updatePayload.dob = new Date(dob);

    await updateIndividual({ id: organisationOfficer.id }, updatePayload);

    if (documents)
      await DocumentService.addMultipleDocuments({
        documents,
        user,
        tag: 'DIRECTOR',
        process: 'onboarding',
        ...(school && { country: school.country }),
        ...(organisation && { country: organisation.Owner.country }),
        incoming_reference: organisationOfficer.document_reference,
      });
    return sendObjectResponse('School Officer Information successfully updated');
  },

  async sendInviteToOfficer(data: any): Promise<theResponse> {
    const { type, school, organisation, email, firstName, lastName } = data;
    const onboarding_reference =
      organisation.onboarding_reference || `onb_${randomstring.generate({ length: 20, capitalization: 'lowercase', charset: 'alphanumeric' })}`;
    const username = randomstring.generate({ length: 8, capitalization: 'lowercase', charset: 'alphanumeric' });

    if (!organisation.onboarding_reference) await updateOrganisationREPO({ id: organisation.id }, { onboarding_reference });
    const organisationOfficer = await findIndividual({ email, type: Not('guardian'), status: Not(STATUSES.DELETED) }, []);
    if (organisationOfficer) throw new ExistsError('Officers');

    await saveIndividual({
      email,
      firstName,
      lastName,
      school_id: school.id,
      onboarding_reference,
      type,
      status: STATUSES.INVITED,
      username,
    });

    sendEmail({
      recipientEmail: email,
      purpose: 'director_invite',
      templateInfo: {
        supportEmail: 'support@joinsteward.com',
        organisationName: organisation.name,
        firstName,
        directorPageUrl: `${Utils.getDashboardURL()}/director/${organisation.slug}/${username}`,
      },
    });

    // director_invite
    sendSlackMessage({
      body: {
        name: `${firstName} ${lastName}`,
        organisation_name: organisation.name,
        url: `${Utils.getDashboardURL()}/director/${organisation.slug}/${username}`,
        type,
        email,
      },
      feature: 'director_invite',
    });

    return sendObjectResponse(`School ${type} has been successfully invited`);
  },

  async getInvitedOfficer(data: any): Promise<theResponse> {
    const { organisation_slug, director_username, belongsToOrganisation = false } = data;

    const organisation = await getOneOrganisationREPO({ slug: organisation_slug }, [], ['Owner']);
    if (!organisation) throw new NotFoundError('Organisation');

    const organisationOfficer = await findIndividual({ username: director_username, onboarding_reference: organisation.onboarding_reference }, []);
    if (!organisationOfficer) {
      if (belongsToOrganisation) throw new ValidationError('Director does not belong to this organisation');
      throw new NotFoundError('Director');
    }

    if (belongsToOrganisation) {
      if (organisationOfficer.status !== STATUSES.INVITED) throw new ValidationError('Directors Invite is not Valid');
      return sendObjectResponse(`Retrieved organisation and direcor details successfully`, { organisation, organisationOfficer });
    }

    return sendObjectResponse(
      `Organisation ${organisationOfficer.type} has been successfully retrieved`,
      Sanitizer.sanitizeIndividual(organisationOfficer),
    );
  },
};
// Get Officer Details
// Submitting Officer Details

export default Service;
