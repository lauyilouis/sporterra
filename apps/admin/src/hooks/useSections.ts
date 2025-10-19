import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { sectionsApi } from '../services/sectionsApi'
import type { CreateSectionRequest, UpdateSectionRequest } from '../types'

export const useSections = (tenantId?: string) => {
  return useQuery({
    queryKey: ['sections', tenantId],
    queryFn: () => sectionsApi.getAll(tenantId).then(res => res.data.data),
    enabled: !!tenantId,
  })
}

export const useSection = (sectionId: string) => {
  return useQuery({
    queryKey: ['section', sectionId],
    queryFn: () => sectionsApi.getById(sectionId).then(res => res.data.data),
    enabled: !!sectionId,
  })
}

export const useCreateSection = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data: CreateSectionRequest) => 
      sectionsApi.create(data).then(res => res.data.data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['sections', variables.tenantId] })
    },
  })
}

export const useUpdateSection = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ sectionId, data }: { sectionId: string; data: UpdateSectionRequest }) =>
      sectionsApi.update(sectionId, data).then(res => res.data.data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['sections', data.tenantId] })
      queryClient.invalidateQueries({ queryKey: ['section', data.id] })
    },
  })
}

export const useDeleteSection = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (sectionId: string) => 
      sectionsApi.delete(sectionId).then(res => res.data),
    onSuccess: (_, sectionId) => {
      queryClient.invalidateQueries({ queryKey: ['sections'] })
      queryClient.removeQueries({ queryKey: ['section', sectionId] })
    },
  })
}