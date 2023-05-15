export default class FailedDependencyError extends Error {
  status: number;

  constructor(message: string) {
    super(message);
    this.name = 'FailedDependencyError';
    this.message = message;
    this.status = 424;
  }
}
