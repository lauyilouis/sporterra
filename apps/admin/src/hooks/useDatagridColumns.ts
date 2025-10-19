import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { datagridColumnsApi } from '../services/datagridColumnsApi'
import type { CreateDatagridColumnRequest, UpdateDatagridColumnRequest } from '../types'

export const useDatagridColumns = (tenantId?: string, datagridId?: string) => {
  return useQuery({
    queryKey: ['datagrid-columns', tenantId, datagridId],
    queryFn: () => datagridColumnsApi.getAll(tenantId, datagridId).then(res => res.data.data),
    enabled: !!tenantId,
  })
}

export const useDatagridColumn = (columnId: string) => {
  return useQuery({
    queryKey: ['datagrid-column', columnId],
    queryFn: () => datagridColumnsApi.getById(columnId).then(res => res.data.data),
    enabled: !!columnId,
  })
}

export const useCreateDatagridColumn = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data: CreateDatagridColumnRequest) => 
      datagridColumnsApi.create(data).then(res => res.data.data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['datagrid-columns', variables.tenantId] })
      queryClient.invalidateQueries({ queryKey: ['datagrid-columns', variables.tenantId, variables.datagridId] })
    },
  })
}

export const useUpdateDatagridColumn = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ columnId, data }: { columnId: string; data: UpdateDatagridColumnRequest }) =>
      datagridColumnsApi.update(columnId, data).then(res => res.data.data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['datagrid-columns', data.tenantId] })
      queryClient.invalidateQueries({ queryKey: ['datagrid-column', data.id] })
    },
  })
}

export const useDeleteDatagridColumn = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (columnId: string) => 
      datagridColumnsApi.delete(columnId).then(res => res.data),
    onSuccess: (_, columnId) => {
      queryClient.invalidateQueries({ queryKey: ['datagrid-columns'] })
      queryClient.removeQueries({ queryKey: ['datagrid-column', columnId] })
    },
  })
}