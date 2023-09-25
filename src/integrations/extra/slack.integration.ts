import axios from 'axios';
import { SLACK_TOKEN } from '../../utils/secrets';
import Utils from '../../utils/utils';

function getSlackDetailsByFeature(feature: string, body: any): any {
  const slackBlocks = [];

  switch (feature) {
    case 'reserved_account_bank_code_not_found':
      slackBlocks.push({
        type: 'section',
        text: {
          text: `New Reserved Account Bank Name Detected`,
          type: 'mrkdwn',
        },
        fields: [
          {
            type: 'mrkdwn',
            text: '*Bank Name*',
          },
          {
            type: 'plain_text',
            text: `${body.bankName}`,
          },
          {
            type: 'mrkdwn',
            text: '*Processor*',
          },
          {
            type: 'plain_text',
            text: `${body.processor}`,
          },
        ],
      });
      return {
        channel: 'ourpass-backend',
        blocks: slackBlocks,
      };
    case 'otp':
      slackBlocks.push({
        type: 'section',
        text: {
          text: body.text || 'OTP',
          type: 'plain_text',
        },
        fields: [
          {
            type: 'mrkdwn',
            text: '*Channel*',
          },
          {
            type: 'plain_text',
            text: `${body.channel}`,
          },
          {
            type: 'mrkdwn',
            text: '*Recipient*',
          },
          {
            type: 'plain_text',
            text: `${body.recipient}`,
          },
          {
            type: 'mrkdwn',
            text: '*Token*',
          },
          {
            type: 'plain_text',
            text: `${body.code || 'N/A'}`,
          },
        ],
      });
      return {
        channel: 'otps',
        blocks: slackBlocks,
      };
    case 'payment_notification':
      slackBlocks.push({
        type: 'section',
        text: {
          text: `${Utils.isProd() ? 'PRODUCTION' : 'STAGING'} \n\n ⚠️ A Paymnet Needs your Attention Details are: \n\n *School name*: ${
            body.schoolName
          } \n *Reason*: ${body.reason}  \n *Account number*: ${body.accountNumber} \n *Initiated On*: ${body.createdAt}`,
          type: 'mrkdwn',
        },
        fields: [
          {
            type: 'mrkdwn',
            text: '*Payment Type*',
          },
          {
            type: 'plain_text',
            text: `${body.payment_type}`,
          },
          {
            type: 'mrkdwn',
            text: '*Processor*',
          },
          {
            type: 'plain_text',
            text: `${body.provider}`,
          },
          {
            type: 'mrkdwn',
            text: '*School Name*',
          },
          {
            type: 'plain_text',
            text: `${body.reference}`,
          },
          {
            type: 'mrkdwn',
            text: '*Event Type*',
          },
          {
            type: 'plain_text',
            text: `${body.event_type}`,
          },
          {
            type: 'mrkdwn',
            text: '*Event*',
          },
          {
            type: 'plain_text',
            text: `${body.event}`,
          },
        ],
      });
      return {
        channel: 'payment-notify',
        blocks: slackBlocks,
      };
    case 'bank_transfer':
      slackBlocks.push({
        type: 'section',
        text: {
          text: `A Bank Transfer has been initiated. Details are: \n\n *Account name*: ${body.accountName} \n *Account number*: ${body.accountNumber} \n *School Name*: ${body.schoolName} \n *Initiated On*: ${body.createdAt}`,
          type: 'mrkdwn',
        },
        fields: [
          {
            type: 'mrkdwn',
            text: '*Bank Name*',
          },
          {
            type: 'plain_text',
            text: `${body.bankName}`,
          },
          {
            type: 'mrkdwn',
            text: '*Reference*',
          },
          {
            type: 'plain_text',
            text: `${body.reference}`,
          },
          {
            type: 'mrkdwn',
            text: '*Narration*',
          },
          {
            type: 'plain_text',
            text: `${body.narration}`,
          },
          {
            type: 'mrkdwn',
            text: '*Amount*',
          },
          {
            type: 'plain_text',
            text: `${body.amount}`,
          },
          {
            type: 'mrkdwn',
            text: '*Initiator*',
          },
          {
            type: 'plain_text',
            text: `${body.initiator}`,
          },
        ],
      });
      return {
        channel: 'payout',
        blocks: slackBlocks,
      };
    case 'deposit_notification':
      slackBlocks.push({
        type: 'section',
        text: {
          text: `${Utils.isProd() ? 'PRODUCTION' : 'STAGING'} \n\n 🤑 We got a new Deposit: \n\n *Reference*: ${body.reference} \n *Description*: ${
            body.narration
          }  \n *Purpose*: ${body.purpose} \n *From*: ${body.from} \n *Initiated On*: ${body.createdAt}`,
          type: 'mrkdwn',
        },
        fields: [
          {
            type: 'mrkdwn',
            text: '*Payment Channel*',
          },
          {
            type: 'plain_text',
            text: `${body.channel}`,
          },
          {
            type: 'mrkdwn',
            text: '*Amount*',
          },
          {
            type: 'plain_text',
            text: `${body.amount}`,
          },
          {
            type: 'mrkdwn',
            text: '*School Name*',
          },
          {
            type: 'plain_text',
            text: `${body.schoolName}`,
          },
          {
            type: 'mrkdwn',
            text: '*For*',
          },
          {
            type: 'plain_text',
            text: `${body.For}`,
          },
          {
            type: 'mrkdwn',
            text: '*Class*',
          },
          {
            type: 'plain_text',
            text: `${body.class}`,
          },
        ],
      });
      return {
        channel: 'deposits',
        blocks: slackBlocks,
      };
    default:
      throw new Error('slack channel not available');
  }
}

export const sendSlackMessage = async ({ body, feature }: { body: any; feature: string }): Promise<any> => {
  console.log({ body, feature });
  const { channel, blocks } = getSlackDetailsByFeature(feature, body);
  if (feature === 'payment_notification' && body.payment_type === 'mobile-money') {
    blocks[0].text.text = blocks[0].text.text.replace('Account number', 'Phone number');
    blocks[0].text.text = blocks[0].text.text.replace(body.accountNumber, body.phoneNumber);
  }
  await axios.post(
    'https://slack.com/api/chat.postMessage',
    {
      channel,
      blocks,
    },
    { headers: { authorization: `Bearer ${SLACK_TOKEN}` } },
  );
  return { success: true };
};
