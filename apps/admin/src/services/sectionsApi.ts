import { api } from './api'
import type {
  Section,
  CreateSectionRequest,
  UpdateSectionRequest,
  ApiResponse,
} from '../types'

export const sectionsApi = {
  getAll: (tenantId?: string) =>
    api.get<ApiResponse<Section[]>>('/api/sections', {
      params: tenantId ? { tenantId } : {},
    }),

  getById: (sectionId: string) =>
    api.get<ApiResponse<Section>>(`/api/sections/${sectionId}`),

  create: (data: CreateSectionRequest) =>
    api.post<ApiResponse<Section>>('/api/sections', data),

  update: (sectionId: string, data: UpdateSectionRequest) =>
    api.put<ApiResponse<Section>>(`/api/sections/${sectionId}`, data),

  delete: (sectionId: string) =>
    api.delete<ApiResponse<{ message: string }>>(`/api/sections/${sectionId}`),
}