export default class FailedDependencyError extends Error {
  status: number;

  dependency?: string;

  event?: string;

  endpoint?: string;

  data?: any;

  school?: any;

  method: number;

  constructor(message: string, dependency?: string, data?: { method: number; school?: any; payload?: any; event?: string; endpoint?: string }) {
    super(message);
    this.name = 'FailedDependencyError';
    this.message = message;
    this.status = 424;
    this.dependency = dependency;
    this.event = data?.event || '';
    this.endpoint = data ? data.endpoint : dependency || '';
    this.data = data?.payload || null;
    this.school = data?.school || null;
    this.method = data ? data.method : 1;
  }
}
