export default class ExistsError extends Error {
  status: number;

  constructor(message: string) {
    super(message);
    this.name = 'ExistsError';
    this.message = `${message} already exists`;
    this.status = 409;
  }
}
