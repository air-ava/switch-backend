export interface ControllerResponse {
  success: boolean;
  error?: string;
  message?: string;
}

export interface GetNotificationsRes {
  id: number;
  type: string;
  title?: string;
  body?: string;
  read: boolean;
  createdAt: Date;
  request?: {
    id: number;
    sender: boolean;
    recipientName?: string;
    recipientPhone: string;
    amount: number;
    narration: string;
    status: string;
    createdAt: Date;
  };
}
