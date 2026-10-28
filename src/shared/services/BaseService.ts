// Base Service
// A base class for other services to extend, providing common functionality.

import { apiClient } from '../../core/api/client';

export class BaseService {
  protected client = apiClient;
  protected resource: string;

  constructor(resource: string) {
    this.resource = resource;
  }

  getAll() {
    return this.client.get(`/${this.resource}`);
  }
}
