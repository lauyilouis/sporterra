import { api } from './api'
import type {
  Datagrid,
  CreateDatagridRequest,
  UpdateDatagridRequest,
  ApiResponse,
} from '../types'

export const datagridsApi = {
  getAll: (tenantId?: string, sectionId?: string) =>
    api.get<ApiResponse<Datagrid[]>>('/api/datagrids', {
      params: { tenantId, sectionId },
    }),

  getById: (datagridId: string) =>
    api.get<ApiResponse<Datagrid>>(`/api/datagrids/${datagridId}`),

  create: (data: CreateDatagridRequest) =>
    api.post<ApiResponse<Datagrid>>('/api/datagrids', data),

  update: (datagridId: string, data: UpdateDatagridRequest) =>
    api.put<ApiResponse<Datagrid>>(`/api/datagrids/${datagridId}`, data),

  delete: (datagridId: string) =>
    api.delete<ApiResponse<{ message: string }>>(`/api/datagrids/${datagridId}`),
}