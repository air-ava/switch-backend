export default class NotFoundError extends Error {
  status: number;

  constructor(message: string) {
    super(message);
    this.name = 'NotFoundError';
    this.message = `${message} not found`;
    this.status = 404;
  }
}
