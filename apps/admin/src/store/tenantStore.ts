import { create } from 'zustand'

interface TenantState {
  tenantId: string
  setTenantId: (tenantId: string) => void
}

export const useTenantStore = create<TenantState>()((set) => ({
  tenantId: '',
  setTenantId: (tenantId: string) => set({ tenantId }),
}))