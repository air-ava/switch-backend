import randomstring from 'randomstring';
import { FindOperator, Not, Raw } from 'typeorm';
import { STATUSES } from '../database/models/status.model';
import { Repo as DocumentRequirementREPO } from '../database/repositories/documentRequirement.repo';
import { Repo as DocumentREPO } from '../database/repositories/documents.repo';
import { sendObjectResponse, BadRequestException, ResourceNotFoundError, NotFoundError } from '../utils/errors';
import { theResponse } from '../utils/interface';
import { Sanitizer } from '../utils/sanitizer';
import { createObjectFromArray, toTitle } from '../utils/utils';
import { createAsset } from './assets.service';
import { findSchoolWithOrganization } from './helper.service';
import { saveLinkREPO } from '../database/repositories/link.repo';
import { getSchool, updateSchool } from '../database/repositories/schools.repo';
import { listDocuments, verifyDocument } from '../validators/document.validator';
import { publishMessage } from '../utils/amqpProducer';

const Service: any = {
  async listDocumentRequirements({
    process,
    country = 'UGANDA',
    tag,
  }: {
    process: string;
    country: 'UGANDA' | 'NIGERIA';
    tag: string;
  }): Promise<theResponse> {
    const query: {
      process: string;
      country: 'UGANDA' | 'NIGERIA';
      tag?: FindOperator<any>;
    } = { process, country };
    if (tag) query.tag = Raw((columnAlias) => `FIND_IN_SET('${tag}', ${columnAlias})`);

    const response = await DocumentRequirementREPO.listDocumentRequirements(query, []);
    if (!response.length) throw new NotFoundError('Document Requirement');

    return sendObjectResponse(
      `${toTitle(process)} Document Requirement retrieved successfully'`,
      Sanitizer.sanitizeAllArray(response, Sanitizer.sanitizeDocumentRequirement),
    );
  },

  async listDocuments({
    process = 'onboarding',
    country = 'UGANDA',
    reference,
  }: {
    process: string;
    country: 'UGANDA';
    reference: string;
  }): Promise<theResponse> {
    const validation = listDocuments.validate({ process, country });
    if (validation.error) return ResourceNotFoundError(validation.error);

    const response = await DocumentREPO.listDocuments(
      {
        ...(reference && { reference }),
        trigger: process,
        country,
      },
      [],
      ['Status', 'Asset'],
    );
    return sendObjectResponse(`Documents retrieved successfully'`, Sanitizer.sanitizeAllArray(response, Sanitizer.sanitizeDocument));
  },

  async verifyDocument({
    documentId,
    status = 'approved',
    reason,
  }: {
    reason: string;
    documentId: number;
    status: 'approved' | 'rejected';
  }): Promise<theResponse> {
    const validation = verifyDocument.validate({ documentId, status, reason });
    if (validation.error) return ResourceNotFoundError(validation.error);

    const response = await DocumentREPO.findDocument({ id: documentId }, [], []);
    if (!response) throw Error(`Document Not Found`);
    if (status === 'approved' && response.status === STATUSES.APPROVED) throw Error(`Document has been approved already`);
    if (status === 'rejected' && response.status === STATUSES.REJECTED) throw Error(`Document has been rejected already`);

    await DocumentREPO.updateDocuments(
      { id: documentId },
      {
        status: status === 'approved' ? STATUSES.APPROVED : STATUSES.REJECTED,
        processor: 'STEWARD',
        response: reason,
      },
    );

    return sendObjectResponse(`Documents ${status} successfully`);
  },

  async addOnboardingDocument(data: any): Promise<any> {
    const { documents, user, process = 'onboarding', tag, incoming_reference } = data;
    const {
      data: { school, organisation },
    } = await findSchoolWithOrganization({ owner: user.id });

    const reference = incoming_reference || `doc_ref_${randomstring.generate({ length: 12, capitalization: 'lowercase', charset: 'alphanumeric' })}`;

    const documentRequirement = await DocumentRequirementREPO.listDocumentRequirements({ process, ...(tag && { tag }) }, [], []);
    const requirementDocs = await createObjectFromArray(documentRequirement, 'id', 'requirement_type');

    // if (school.status === STATUSES.UNVERIFIED) throw Error('School not verified');
    await Service.callService('addDocument', documents, {
      reference,
      user,
      process,
      entity: 'document_requirements',
      organisation,
      requirementDocs,
      school,
    });
    await updateSchool({ id: school.id }, { document_reference: reference });
    return sendObjectResponse(`${toTitle(process)} Document submitted successfully'`);
  },

  async addMultipleDocuments(data: any): Promise<any> {
    const { documents, user, process = 'onboarding', incoming_reference, tag, country = 'UGANDA', verificationData } = data;
    const {
      data: { school, organisation },
    } = await findSchoolWithOrganization({ owner: user.id });

    const reference = incoming_reference || `doc_ref_${randomstring.generate({ length: 12, capitalization: 'lowercase', charset: 'alphanumeric' })}`;

    const documentRequirement = await DocumentRequirementREPO.listDocumentRequirements(
      { process, ...(tag && { tag }), ...(country && { country }) },
      [],
      [],
    );
    const requirementDocs = await createObjectFromArray(documentRequirement, 'id', 'requirement_type');

    await Service.callService('addDocument', documents, {
      reference,
      user,
      process,
      entity: 'document_requirements',
      organisation,
      requirementDocs,
      school,
      country,
      verificationData,
    });
    return sendObjectResponse(`${toTitle(process)} Document submitted successfully'`);
  },

  async addDocumentAdmin(data: any): Promise<any> {
    const { documents, schoolId, process = 'onboarding' } = data;

    const school = await getSchool(
      { id: schoolId },
      [],
      ['Address', 'phoneNumber', 'Organisation', 'Organisation.Owner', 'Logo', 'Organisation.Owner.phoneNumber'],
    );
    if (!school) throw Error('School not found');
    const { Organisation: organisation } = school;
    const user = (organisation as any).Owner;

    const reference =
      school.document_reference || `doc_ref_${randomstring.generate({ length: 12, capitalization: 'lowercase', charset: 'alphanumeric' })}`;

    const documentRequirement = await DocumentRequirementREPO.listDocumentRequirements({ process }, [], []);
    const requirementDocs = await createObjectFromArray(documentRequirement, 'id', 'requirement_type');

    await Service.callService('addDocument', documents, {
      reference,
      user,
      process,
      entity: 'document_requirements',
      organisation,
      requirementDocs,
      school,
    });
    await updateSchool({ id: school.id }, { document_reference: reference });
    return sendObjectResponse(`${toTitle(process)} Document submitted successfully'`);
  },

  async addDocument({
    requirementType: requirement_type,
    process,
    document,
    entity,
    requirementId: entity_id,
    type,
    expiryDate: expiry_date,
    issuingDate: issuing_date,
    processor = 'smileID',
    country = 'UGANDA',
    reference,
    metadata,
    organisation,
    school,
    user,
    requirementDocs,
    verificationData,
  }: any): Promise<theResponse> {
    const payload = {
      reference,
      ...(metadata && { metadata }),
      ...(country && { country }),
      ...(issuing_date && { issuing_date }),
      ...(expiry_date && { expiry_date }),
      processor,
      country,
      trigger: process,
      entity,
      entity_id,
      type,
      organisation,
      school,
      user,
      verificationData,
    };
    if (requirementDocs[entity_id] !== requirement_type) throw new Error('Wrong file type submitted');

    // todo: check if similar document exists for this school and delete it

    if (requirement_type === 'text' || requirement_type === 'number') payload.number = document;
    if (requirement_type === 'file') {
      const createdAsset = await createAsset({
        imagePath: document,
        user: user.id,
        trigger: `${process}:add_documents`,
        reference,
        organisation: organisation.id,
        entity,
        entity_id,
        customName: `process:${process}-add_documents|doc:${type}-${country}|ref:${reference}|org:${organisation.name}|submittedBy:${user.first_name}${user.last_name}`,
        name: `process:${process}-add_documents|doc:${type}-${country}|ref:${reference}|org:${organisation.name}|submittedBy:${user.first_name}${user.last_name}`,
      });
      payload.asset_id = createdAsset.data.id;
    }
    if (requirement_type === 'link') {
      const createdAsset = await saveLinkREPO({
        link: document,
        trigger: `${process}:add_documents`,
        organisation: organisation.id,
        reference,
        user: user.id,
        entity,
        entity_id,
      });
      payload.link_id = createdAsset.id;
    }

    // if document with same reference, entity, type and entity_id exists delete
    const existingDocumentQuery = { reference, entity, type, entity_id, trigger: process, status: Not(STATUSES.DELETED) };
    const existingDocument = await DocumentREPO.findDocument(existingDocumentQuery, [], []);
    if (existingDocument) await DocumentREPO.updateDocuments(existingDocumentQuery, { status: STATUSES.DELETED });

    const response = await DocumentREPO.saveDocuments(payload);
    if (verificationData) await publishMessage(verificationData.queue, { ...verificationData.message, documentId: response.id });
    return sendObjectResponse(`${toTitle(process)} Document Requirement retrieved successfully'`, response);
  },

  async runService(service: string, item: any, supportData: any) {
    return Service[service]({
      ...(typeof item === 'object' ? { ...Sanitizer.jsonify(item) } : { item }),
      ...supportData,
    });
  },

  async callService(service: string, payload: any, supportData: any): Promise<any> {
    if (payload.length) {
      return Promise.all(payload.map((item: any) => Service.runService(service, item, supportData)));
    }
    return Service.runService(service, payload, supportData);
  },

  // async checkDocumentRequirement(data: any[]): Promise<any> {
  //   const requiredDocumentRequirement = await DocumentRequirementREPO.listDocumentRequirements({ process, require: true }, ['id']);

  //   const submittedDocuments = await mapAnArray(data, 'requirementId');
  //   // if (!submittedDocuments.includes(requiredDocumentRequirement)) throw new Error('Number of required document needed to be submitted')

  // }
};

export default Service;
