import React, { useState } from 'react'
import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Chip,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material'
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material'
import { useTenantStore } from '../store/tenantStore'
import { useSections } from '../hooks/useSections'
import { useDatagrids, useCreateDatagrid, useUpdateDatagrid, useDeleteDatagrid } from '../hooks/useDatagrids'
import type { Datagrid, CreateDatagridRequest, UpdateDatagridRequest } from '../types'

const DatagridsPage: React.FC = () => {
  const { tenantId } = useTenantStore()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingDatagrid, setEditingDatagrid] = useState<Datagrid | null>(null)
  const [selectedSectionId, setSelectedSectionId] = useState('')
  const [formData, setFormData] = useState({
    sectionId: '',
    name: '',
    description: '',
    order: 0,
  })

  const { data: sections } = useSections(tenantId)
  const { data: datagrids, isLoading, error } = useDatagrids(tenantId, selectedSectionId || undefined)
  const createMutation = useCreateDatagrid()
  const updateMutation = useUpdateDatagrid()
  const deleteMutation = useDeleteDatagrid()

  const handleOpenDialog = (datagrid?: Datagrid) => {
    if (datagrid) {
      setEditingDatagrid(datagrid)
      setFormData({
        sectionId: datagrid.sectionId,
        name: datagrid.name,
        description: datagrid.description || '',
        order: datagrid.order,
      })
    } else {
      setEditingDatagrid(null)
      setFormData({
        sectionId: '',
        name: '',
        description: '',
        order: 0,
      })
    }
    setDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setDialogOpen(false)
    setEditingDatagrid(null)
  }

  const handleSubmit = async () => {
    if (!tenantId) {
      alert('Please enter a tenant ID')
      return
    }

    if (!formData.sectionId) {
      alert('Please select a section')
      return
    }

    try {
      if (editingDatagrid) {
        const updateData: UpdateDatagridRequest = {
          name: formData.name,
          description: formData.description || undefined,
          order: formData.order,
        }
        await updateMutation.mutateAsync({
          datagridId: editingDatagrid.id,
          data: updateData,
        })
      } else {
        const createData: CreateDatagridRequest = {
          tenantId,
          sectionId: formData.sectionId,
          name: formData.name,
          description: formData.description || undefined,
          order: formData.order,
        }
        await createMutation.mutateAsync(createData)
      }
      handleCloseDialog()
    } catch (error) {
      console.error('Error saving datagrid:', error)
    }
  }

  const handleDelete = async (datagridId: string) => {
    if (confirm('Are you sure you want to delete this datagrid?')) {
      try {
        await deleteMutation.mutateAsync(datagridId)
      } catch (error) {
        console.error('Error deleting datagrid:', error)
      }
    }
  }

  if (!tenantId) {
    return (
      <Alert severity="warning">
        Please enter a tenant ID to manage datagrids.
      </Alert>
    )
  }

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" mt={4}>
        <CircularProgress />
      </Box>
    )
  }

  if (error) {
    return (
      <Alert severity="error">
        Error loading datagrids: {error.message}
      </Alert>
    )
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Datagrids</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Add Datagrid
        </Button>
      </Box>

      <Box mb={3}>
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Filter by Section</InputLabel>
          <Select
            value={selectedSectionId}
            onChange={(e) => setSelectedSectionId(e.target.value)}
            label="Filter by Section"
          >
            <MenuItem value="">All Sections</MenuItem>
            {sections?.map((section) => (
              <MenuItem key={section.id} value={section.id}>
                {section.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Section</TableCell>
              <TableCell>Order</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Created</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {datagrids?.map((datagrid) => (
              <TableRow key={datagrid.id}>
                <TableCell>{datagrid.name}</TableCell>
                <TableCell>{datagrid.description || '-'}</TableCell>
                <TableCell>
                  {sections?.find(s => s.id === datagrid.sectionId)?.name || 'Unknown'}
                </TableCell>
                <TableCell>{datagrid.order}</TableCell>
                <TableCell>
                  <Chip
                    label={datagrid.isActive ? 'Active' : 'Inactive'}
                    color={datagrid.isActive ? 'success' : 'default'}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  {new Date(datagrid.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <IconButton
                    onClick={() => handleOpenDialog(datagrid)}
                    size="small"
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    onClick={() => handleDelete(datagrid.id)}
                    size="small"
                    color="error"
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingDatagrid ? 'Edit Datagrid' : 'Add Datagrid'}
        </DialogTitle>
        <DialogContent>
          <FormControl fullWidth margin="normal" disabled={!!editingDatagrid}>
            <InputLabel>Section</InputLabel>
            <Select
              value={formData.sectionId}
              onChange={(e) => setFormData({ ...formData, sectionId: e.target.value })}
              label="Section"
            >
              {sections?.map((section) => (
                <MenuItem key={section.id} value={section.id}>
                  {section.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            label="Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            fullWidth
            margin="normal"
            required
          />
          <TextField
            label="Description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            fullWidth
            margin="normal"
            multiline
            rows={3}
          />
          <TextField
            label="Order"
            type="number"
            value={formData.order}
            onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
            fullWidth
            margin="normal"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={!formData.name || !formData.sectionId || createMutation.isPending || updateMutation.isPending}
          >
            {createMutation.isPending || updateMutation.isPending ? (
              <CircularProgress size={20} />
            ) : (
              editingDatagrid ? 'Update' : 'Create'
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default DatagridsPage