import { api } from './api'
import type {
  DatagridColumn,
  CreateDatagridColumnRequest,
  UpdateDatagridColumnRequest,
  ApiResponse,
} from '../types'

export const datagridColumnsApi = {
  getAll: (tenantId?: string, datagridId?: string) =>
    api.get<ApiResponse<DatagridColumn[]>>('/api/datagrid-columns', {
      params: { tenantId, datagridId },
    }),

  getById: (columnId: string) =>
    api.get<ApiResponse<DatagridColumn>>(`/api/datagrid-columns/${columnId}`),

  create: (data: CreateDatagridColumnRequest) =>
    api.post<ApiResponse<DatagridColumn>>('/api/datagrid-columns', data),

  update: (columnId: string, data: UpdateDatagridColumnRequest) =>
    api.put<ApiResponse<DatagridColumn>>(`/api/datagrid-columns/${columnId}`, data),

  delete: (columnId: string) =>
    api.delete<ApiResponse<{ message: string }>>(`/api/datagrid-columns/${columnId}`),
}