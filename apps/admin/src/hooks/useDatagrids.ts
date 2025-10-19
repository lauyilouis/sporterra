import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { datagridsApi } from '../services/datagridsApi'
import type { CreateDatagridRequest, UpdateDatagridRequest } from '../types'

export const useDatagrids = (tenantId?: string, sectionId?: string) => {
  return useQuery({
    queryKey: ['datagrids', tenantId, sectionId],
    queryFn: () => datagridsApi.getAll(tenantId, sectionId).then(res => res.data.data),
    enabled: !!tenantId,
  })
}

export const useDatagrid = (datagridId: string) => {
  return useQuery({
    queryKey: ['datagrid', datagridId],
    queryFn: () => datagridsApi.getById(datagridId).then(res => res.data.data),
    enabled: !!datagridId,
  })
}

export const useCreateDatagrid = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data: CreateDatagridRequest) => 
      datagridsApi.create(data).then(res => res.data.data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['datagrids', variables.tenantId] })
      queryClient.invalidateQueries({ queryKey: ['datagrids', variables.tenantId, variables.sectionId] })
    },
  })
}

export const useUpdateDatagrid = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ datagridId, data }: { datagridId: string; data: UpdateDatagridRequest }) =>
      datagridsApi.update(datagridId, data).then(res => res.data.data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['datagrids', data.tenantId] })
      queryClient.invalidateQueries({ queryKey: ['datagrid', data.id] })
    },
  })
}

export const useDeleteDatagrid = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (datagridId: string) => 
      datagridsApi.delete(datagridId).then(res => res.data),
    onSuccess: (_, datagridId) => {
      queryClient.invalidateQueries({ queryKey: ['datagrids'] })
      queryClient.removeQueries({ queryKey: ['datagrid', datagridId] })
    },
  })
}