import React from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Box, Tabs, Tab } from '@mui/material'

const Navigation: React.FC = () => {
  const location = useLocation()
  const navigate = useNavigate()

  const currentTab = location.pathname

  const handleChange = (event: React.SyntheticEvent, newValue: string) => {
    navigate(newValue)
  }

  return (
    <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
      <Tabs value={currentTab} onChange={handleChange}>
        <Tab label="Sections" value="/sections" />
        <Tab label="Datagrids" value="/datagrids" />
        <Tab label="Datagrid Columns" value="/datagrid-columns" />
      </Tabs>
    </Box>
  )
}

export default Navigation