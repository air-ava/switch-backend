export default class ForbiddenError extends Error {
  status: number;

  constructor(message: string) {
    super(message);
    this.name = 'ForbiddenError';
    this.message = message;
    this.status = 403;
  }
}
