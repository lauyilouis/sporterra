import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { Container, AppBar, Toolbar, Typography, Box } from '@mui/material'
import { TenantSelector } from './components/TenantSelector'
import SectionsPage from './pages/SectionsPage'
import DatagridsPage from './pages/DatagridsPage'
import DatagridColumnsPage from './pages/DatagridColumnsPage'
import Navigation from './components/Navigation'

function App() {
  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Sporterra Admin
          </Typography>
        </Toolbar>
      </AppBar>
      
      <Container maxWidth="xl" sx={{ mt: 4 }}>
        <TenantSelector />
        <Navigation />
        
        <Routes>
          <Route path="/" element={<Navigate to="/sections" replace />} />
          <Route path="/sections" element={<SectionsPage />} />
          <Route path="/datagrids" element={<DatagridsPage />} />
          <Route path="/datagrid-columns" element={<DatagridColumnsPage />} />
        </Routes>
      </Container>
    </Box>
  )
}

export default App