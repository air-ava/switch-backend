export default class CustomError extends Error {
  status: number;

  data: any;

  constructor(message: string, status = 400, data: any = null) {
    super(message);
    this.name = 'CustomError';
    this.message = message;
    this.status = status;
    this.data = data;
  }
}
