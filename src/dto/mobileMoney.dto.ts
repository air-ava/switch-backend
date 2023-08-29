import { NotificationHandler } from '../services/helper.service';

export interface mobileMoneyPaymentDTO {
  statusCode?: string;
  statusMessage?: string;
  thirdParty?: any;
  thirdPartySetup: NotificationHandler;
  slackSetup: NotificationHandler;
  success: boolean;
  data: any;
}
