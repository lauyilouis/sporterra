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
} from '@mui/material'
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material'
import { useTenantStore } from '../store/tenantStore'
import { useSections, useCreateSection, useUpdateSection, useDeleteSection } from '../hooks/useSections'
import type { Section, CreateSectionRequest, UpdateSectionRequest } from '../types'

const SectionsPage: React.FC = () => {
  const { tenantId } = useTenantStore()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingSection, setEditingSection] = useState<Section | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    order: 0,
  })

  const { data: sections, isLoading, error } = useSections(tenantId)
  const createMutation = useCreateSection()
  const updateMutation = useUpdateSection()
  const deleteMutation = useDeleteSection()

  const handleOpenDialog = (section?: Section) => {
    if (section) {
      setEditingSection(section)
      setFormData({
        name: section.name,
        description: section.description || '',
        order: section.order,
      })
    } else {
      setEditingSection(null)
      setFormData({
        name: '',
        description: '',
        order: 0,
      })
    }
    setDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setDialogOpen(false)
    setEditingSection(null)
  }

  const handleSubmit = async () => {
    if (!tenantId) {
      alert('Please enter a tenant ID')
      return
    }

    try {
      if (editingSection) {
        const updateData: UpdateSectionRequest = {
          name: formData.name,
          description: formData.description || undefined,
          order: formData.order,
        }
        await updateMutation.mutateAsync({
          sectionId: editingSection.id,
          data: updateData,
        })
      } else {
        const createData: CreateSectionRequest = {
          tenantId,
          name: formData.name,
          description: formData.description || undefined,
          order: formData.order,
        }
        await createMutation.mutateAsync(createData)
      }
      handleCloseDialog()
    } catch (error) {
      console.error('Error saving section:', error)
    }
  }

  const handleDelete = async (sectionId: string) => {
    if (confirm('Are you sure you want to delete this section?')) {
      try {
        await deleteMutation.mutateAsync(sectionId)
      } catch (error) {
        console.error('Error deleting section:', error)
      }
    }
  }

  if (!tenantId) {
    return (
      <Alert severity="warning">
        Please enter a tenant ID to manage sections.
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
        Error loading sections: {error.message}
      </Alert>
    )
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Sections</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Add Section
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Order</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Created</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sections?.map((section) => (
              <TableRow key={section.id}>
                <TableCell>{section.name}</TableCell>
                <TableCell>{section.description || '-'}</TableCell>
                <TableCell>{section.order}</TableCell>
                <TableCell>
                  <Chip
                    label={section.isActive ? 'Active' : 'Inactive'}
                    color={section.isActive ? 'success' : 'default'}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  {new Date(section.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <IconButton
                    onClick={() => handleOpenDialog(section)}
                    size="small"
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    onClick={() => handleDelete(section.id)}
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
          {editingSection ? 'Edit Section' : 'Add Section'}
        </DialogTitle>
        <DialogContent>
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
            disabled={!formData.name || createMutation.isPending || updateMutation.isPending}
          >
            {createMutation.isPending || updateMutation.isPending ? (
              <CircularProgress size={20} />
            ) : (
              editingSection ? 'Update' : 'Create'
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default SectionsPage