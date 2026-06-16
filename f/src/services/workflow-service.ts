import { BaseService } from './base-service';

export interface WorkflowConfig {
  id?: number;
  position: number;
  data: string; // JSON string
  created_at?: string;
  updated_at?: string;
}

export interface CreateWorkflowConfigPayload {
  position: number;
  data: string;
}

export class WorkflowService extends BaseService {
  // GET /api/workflow/config - Get all workflow configs (optionally filtered by position)
  static async getConfigs(
    accessToken: string,
    positionId?: number
  ): Promise<WorkflowConfig[]> {
    let url = '/api/workflow/config';
    if (positionId) {
      url += `?position=${positionId}`;
    }
    return this.makeAuthenticatedRequest<WorkflowConfig[]>(url, accessToken, {
      method: 'GET'
    });
  }

  // GET /api/workflow/config/[id] - Get a specific workflow config
  static async getConfig(
    accessToken: string,
    id: number
  ): Promise<WorkflowConfig> {
    return this.makeAuthenticatedRequest<WorkflowConfig>(
      `/api/workflow/config/${id}`,
      accessToken,
      {
        method: 'GET'
      }
    );
  }

  // POST /api/workflow/config - Create a new workflow config
  static async createConfig(
    accessToken: string,
    payload: CreateWorkflowConfigPayload
  ): Promise<WorkflowConfig> {
    return this.makeAuthenticatedRequest<WorkflowConfig>(
      '/api/workflow/config',
      accessToken,
      {
        method: 'POST',
        body: JSON.stringify(payload)
      }
    );
  }

  // PUT /api/workflow/config/[id] - Update a workflow config (full update)
  static async updateConfig(
    accessToken: string,
    id: number,
    payload: CreateWorkflowConfigPayload
  ): Promise<WorkflowConfig> {
    return this.makeAuthenticatedRequest<WorkflowConfig>(
      `/api/workflow/config/${id}`,
      accessToken,
      {
        method: 'PUT',
        body: JSON.stringify(payload)
      }
    );
  }

  // PATCH /api/workflow/config/[id] - Partially update a workflow config
  static async patchConfig(
    accessToken: string,
    id: number,
    payload: Partial<CreateWorkflowConfigPayload>
  ): Promise<WorkflowConfig> {
    return this.makeAuthenticatedRequest<WorkflowConfig>(
      `/api/workflow/config/${id}`,
      accessToken,
      {
        method: 'PATCH',
        body: JSON.stringify(payload)
      }
    );
  }
}
