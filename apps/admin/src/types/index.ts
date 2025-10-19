export interface Section {
  id: string
  tenantId: string
  name: string
  description?: string
  order: number
  isActive: boolean
  createdAt: string
  updatedAt: string
  datagrids?: Datagrid[]
}

export interface Datagrid {
  id: string
  tenantId: string
  sectionId: string
  name: string
  description?: string
  order: number
  isActive: boolean
  createdAt: string
  updatedAt: string
  section?: Section
  columns?: DatagridColumn[]
  rows?: DatagridRow[]
}

export interface DatagridColumn {
  id: string
  tenantId: string
  datagridId: string
  key: string
  label: string
  type: string
  required: boolean
  order: number
  validationRules?: any
  config?: any
  createdAt: string
  updatedAt: string
  datagrid?: Datagrid
}

export interface DatagridRow {
  id: string
  tenantId: string
  datagridId: string
  userId: string
  data: Record<string, any>
  order: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateSectionRequest {
  tenantId: string
  name: string
  description?: string
  order?: number
}

export interface UpdateSectionRequest {
  name?: string
  description?: string
  order?: number
  isActive?: boolean
}

export interface CreateDatagridRequest {
  tenantId: string
  sectionId: string
  name: string
  description?: string
  order?: number
}

export interface UpdateDatagridRequest {
  name?: string
  description?: string
  order?: number
  isActive?: boolean
}

export interface CreateDatagridColumnRequest {
  tenantId: string
  datagridId: string
  key: string
  label: string
  type: string
  required?: boolean
  order?: number
  validationRules?: any
  config?: any
}

export interface UpdateDatagridColumnRequest {
  key?: string
  label?: string
  type?: string
  required?: boolean
  order?: number
  validationRules?: any
  config?: any
}

export interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
}

export interface ApiError {
  error: string
  message: string
}