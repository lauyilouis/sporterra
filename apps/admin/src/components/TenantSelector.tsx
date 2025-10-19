import React from 'react'
import { TextField, Box, Typography } from '@mui/material'
import { useTenantStore } from '../store/tenantStore'

export const TenantSelector: React.FC = () => {
  const { tenantId, setTenantId } = useTenantStore()

  return (
    <Box sx={{ mb: 3, p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
      <Typography variant="h6" gutterBottom>
        Tenant Configuration
      </Typography>
      <TextField
        label="Tenant ID"
        value={tenantId}
        onChange={(e) => setTenantId(e.target.value)}
        fullWidth
        variant="outlined"
        placeholder="Enter tenant ID"
        helperText="All API calls will use this tenant ID"
      />
    </Box>
  )
}