/* eslint-disable @typescript-eslint/no-unused-vars */
import { getPreference, updatePreference, createPreference } from '../database/repositories/preferences.repo';
import { getSchool } from '../database/repositories/schools.repo';
import { NotFoundError, ValidationError, sendObjectResponse, ExistsError } from '../utils/errors';
import { theResponse } from '../utils/interface';

// eslint-disable-next-line no-shadow
enum NotificationMethod {
  Email = 'email',
  PhoneNumbers = 'phoneNumbers',
}

// eslint-disable-next-line no-shadow
enum TransactionType {
  Inflow = 'inflow',
  Outflow = 'outflow',
}

interface Configuration {
  Notification: {
    method: NotificationMethod[];
    phoneNumbers?: string[];
    emails?: string[];
    transactions: {
      notifyInflow: boolean;
      notifyOutflow: boolean;
    };
  };
}

const Service = {
  async addPhoneNumbersToConfig(data: { schoolId: number; phoneNumbers: string[] }): Promise<theResponse> {
    const { schoolId, phoneNumbers } = data;
    const schoolPreference = await getPreference({ entity: 'school', entity_id: schoolId }, [], []);
    if (!schoolPreference) throw new NotFoundError('School preference');

    (schoolPreference.configuration as any).Notification.phoneNumbers.push(phoneNumbers);

    await updatePreference({ id: schoolPreference.id }, { configuration: schoolPreference });

    return sendObjectResponse('Phone numbers added to the configuration successfully');
  },

  async updateConfiguration(data: any): Promise<theResponse> {
    const { schoolId, methods, notifyInflow, notifyOutflow, emails, phoneNumbers } = data;
    // Get the company preference with the provided company ID
    const schoolPreference = await getPreference({ entity: 'school', entity_id: schoolId }, [], []);
    if (!schoolPreference) throw new NotFoundError('Company preference');

    if (notifyInflow) (schoolPreference.configuration as any).Notification.transactions.notifyInflow = notifyInflow;
    if (notifyOutflow) (schoolPreference.configuration as any).Notification.transactions.notifyOutflow = notifyOutflow;
    // if (methods) {
    //   // eslint-disable-next-line array-callback-return
    //   methods.map((method: NotificationMethod) => {
    //     if (![NotificationMethod.Email, NotificationMethod.PhoneNumbers].includes(method)) (schoolPreference.configuration as any).Notification.method.push(method);
    //   });
    // }
    if (emails) (schoolPreference.configuration as any).Notification.emails.push(emails);
    if (phoneNumbers) (schoolPreference.configuration as any).Notification.phoneNumbers.push(phoneNumbers);

    // Update the company preference with the new configuration
    await updatePreference({ id: schoolPreference.id }, { configuration: schoolPreference });

    return sendObjectResponse('Configuration updated successfully');
  },

  async addEmailsToConfig(data: { schoolId: number; emails: string[]; notifyInflow: boolean; notifyOutflow: boolean }): Promise<theResponse> {
    const { schoolId, emails } = data;

    const schoolPreference = await getPreference({ entity: 'school', entity_id: schoolId }, [], []);
    if (!schoolPreference) throw new NotFoundError('School preference');

    (schoolPreference.configuration as any).Notification.emails.push(emails);

    await updatePreference({ id: schoolPreference.id }, { configuration: schoolPreference });

    return sendObjectResponse('Emails added to the configuration successfully');
  },

  async changePhoneNumber(data: { schoolId: number; index: number; newPhoneNumber: string; oldPhoneNumber: string }): Promise<theResponse> {
    const { schoolId, newPhoneNumber, oldPhoneNumber } = data;
    // Get the company preference with the provided company ID
    const schoolPreference = await getPreference({ entity: 'school', entity_id: schoolId }, [], []);
    if (!schoolPreference) throw new NotFoundError('Company preference');

    // Fetch the existing configuration from the company preference
    const { configuration } = schoolPreference;
    if (!(configuration as any).Notification.phoneNumbers || !(configuration as any).Notification.phoneNumbers.includes(oldPhoneNumber))
      throw new ValidationError('No phone number to update');

    // Update the phone number at the specified index
    const index = (configuration as any).Notification.phoneNumbers.indexOf(oldPhoneNumber);
    (configuration as any).Notification.phoneNumbers[index] = newPhoneNumber;

    await updatePreference({ id: schoolPreference.id }, { configuration });

    return sendObjectResponse('Phone number updated successfully');
  },

  async changeEmail(data: { schoolId: number; index: number; newEmail: string; oldEmail: string }): Promise<theResponse> {
    const { schoolId, newEmail, oldEmail } = data;
    // Get the company preference with the provided company ID
    const schoolPreference = await getPreference({ entity: 'school', entity_id: schoolId }, [], []);
    if (!schoolPreference) throw new NotFoundError('Company preference');

    // Fetch the existing configuration from the company preference
    const { configuration } = schoolPreference;
    if (!(configuration as any).Notification.emails) throw new ValidationError('No email to update');
    const { emails } = (configuration as any).Notification;
    if (!emails.includes(oldEmail)) throw new ValidationError('No email to update');

    // Update the phone number at the specified index
    const index = (configuration as any).Notification.emails.indexOf(oldEmail);
    (configuration as any).Notification.emails[index] = newEmail;

    await Service.updateConfiguration({ schoolId, configuration });

    return sendObjectResponse('Phone number updated successfully');
  },

  async createNotificationConfiguration(data: {
    owner: any;
    schoolId: number;
    phoneNumbers: string[];
    emails: string[];
    notifyInflow: NotificationMethod[];
    notifyOutflow: NotificationMethod[];
  }): Promise<theResponse> {
    const {
      owner,
      notifyOutflow = [NotificationMethod.Email],
      notifyInflow = [NotificationMethod.Email],
      schoolId,
      phoneNumbers = [],
      emails = [],
    } = data;

    // Get the company preference with the provided company ID
    const schoolPreference = await getPreference({ entity: 'school', entity_id: schoolId }, [], []);
    if (schoolPreference) throw new ExistsError('Company preference');

    const isCompanyHavingEmail =
      (notifyOutflow.includes(NotificationMethod.Email) || notifyInflow.includes(NotificationMethod.Email)) &&
      (!owner.email || owner.email.includes('@usersteward.com') || owner.email.includes('@studentsteward.com'));

    if (isCompanyHavingEmail) throw new ValidationError('An email has not been added to this account');

    // Create a new company preference
    const newschoolPreference = {
      entity: 'school',
      entity_id: schoolId,
      configuration: {
        Notification: {
          phoneNumbers,
          emails,
          transactions: {
            notifyInflow,
            notifyOutflow,
          },
        },
      },
    };

    // Save the new company preference
    await createPreference(newschoolPreference);

    return sendObjectResponse('Notification configuration created successfully');
  },

  async getNotificationContacts(schoolId: number): Promise<theResponse> {
    // Get the company preference with the provided company ID
    const schoolPreference = await getPreference({ entity: 'school', entity_id: schoolId }, [], []);
    if (!schoolPreference) throw new NotFoundError('Company preference');

    // Fetch the existing configuration from the company preference
    const { configuration } = schoolPreference;

    // Check if there is a notification method available
    if (
      !(configuration as any).Notification ||
      (configuration as any).Notification.transactions.notifyInflow.length === 0 ||
      (configuration as any).Notification.transactions.notifyOutflow.length === 0
    ) {
      const foundSchool = await getSchool({ id: schoolId }, [], ['phoneNumber']);
      if (!foundSchool) throw Error('School not found');
      // No notification method available
      if (foundSchool.phoneNumber) (configuration as any).Notification.phoneNumbers = [foundSchool.phoneNumber.internationalFormat];
      if (foundSchool.email) (configuration as any).Notification.emails = [foundSchool.email];
    }

    return sendObjectResponse('Notification contacts retrieved successfully', (configuration as any).Notification);
  },

  async deletePhoneOrEmail(data: { schoolId: number; phoneNumber?: string; email?: string; type: 'email' | 'phone' }): Promise<theResponse> {
    const { schoolId, phoneNumber, email, type } = data;
    // Get the company preference with the provided company ID
    const schoolPreference = await getPreference({ entity: 'school', entity_id: schoolId }, [], []);
    if (!schoolPreference) throw new NotFoundError('Company preference');

    // Fetch the existing configuration from the company preference
    const { configuration } = schoolPreference;
    if (!(configuration as any).Notification.phoneNumbers || !(configuration as any).Notification.phoneNumbers.includes(phoneNumber))
      throw new ValidationError('No phone number to remove');

    const notificationType = {
      phone: 'phoneNumbers',
      email: 'emails',
    };

    // Update the phone number at the specified index
    (configuration as any).Notification[notificationType[type]] = (configuration as any).Notification[notificationType[type]].filter(
      (num: string) => num !== (type === 'email' ? email : phoneNumber),
    );
    await Service.updateConfiguration({ schoolId, configuration });

    return sendObjectResponse('Notification contacts deleted successfully', configuration);
  },
};

export default Service;
