export default class ValidationError extends Error {
  status: number;

  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
    this.message = message;
    this.status = 400;
  }
}
