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
  FormControlLabel,
  Checkbox,
} from '@mui/material'
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material'
import { useTenantStore } from '../store/tenantStore'
import { useDatagrids } from '../hooks/useDatagrids'
import { useDatagridColumns, useCreateDatagridColumn, useUpdateDatagridColumn, useDeleteDatagridColumn } from '../hooks/useDatagridColumns'
import type { DatagridColumn, CreateDatagridColumnRequest, UpdateDatagridColumnRequest } from '../types'

const columnTypes = [
  'text',
  'number',
  'email',
  'url',
  'date',
  'datetime',
  'boolean',
  'select',
  'textarea',
]

const DatagridColumnsPage: React.FC = () => {
  const { tenantId } = useTenantStore()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingColumn, setEditingColumn] = useState<DatagridColumn | null>(null)
  const [selectedDatagridId, setSelectedDatagridId] = useState('')
  const [formData, setFormData] = useState({
    datagridId: '',
    key: '',
    label: '',
    type: 'text',
    required: false,
    order: 0,
    validationRules: '',
    config: '',
  })

  const { data: datagrids } = useDatagrids(tenantId)
  const { data: columns, isLoading, error } = useDatagridColumns(tenantId, selectedDatagridId || undefined)
  const createMutation = useCreateDatagridColumn()
  const updateMutation = useUpdateDatagridColumn()
  const deleteMutation = useDeleteDatagridColumn()

  const handleOpenDialog = (column?: DatagridColumn) => {
    if (column) {
      setEditingColumn(column)
      setFormData({
        datagridId: column.datagridId,
        key: column.key,
        label: column.label,
        type: column.type,
        required: column.required,
        order: column.order,
        validationRules: column.validationRules ? JSON.stringify(column.validationRules, null, 2) : '',
        config: column.config ? JSON.stringify(column.config, null, 2) : '',
      })
    } else {
      setEditingColumn(null)
      setFormData({
        datagridId: '',
        key: '',
        label: '',
        type: 'text',
        required: false,
        order: 0,
        validationRules: '',
        config: '',
      })
    }
    setDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setDialogOpen(false)
    setEditingColumn(null)
  }

  const handleSubmit = async () => {
    if (!tenantId) {
      alert('Please enter a tenant ID')
      return
    }

    if (!formData.datagridId) {
      alert('Please select a datagrid')
      return
    }

    try {
      let validationRules = null
      let config = null

      if (formData.validationRules.trim()) {
        try {
          validationRules = JSON.parse(formData.validationRules)
        } catch (e) {
          alert('Invalid JSON in validation rules')
          return
        }
      }

      if (formData.config.trim()) {
        try {
          config = JSON.parse(formData.config)
        } catch (e) {
          alert('Invalid JSON in config')
          return
        }
      }

      if (editingColumn) {
        const updateData: UpdateDatagridColumnRequest = {
          key: formData.key,
          label: formData.label,
          type: formData.type,
          required: formData.required,
          order: formData.order,
          validationRules,
          config,
        }
        await updateMutation.mutateAsync({
          columnId: editingColumn.id,
          data: updateData,
        })
      } else {
        const createData: CreateDatagridColumnRequest = {
          tenantId,
          datagridId: formData.datagridId,
          key: formData.key,
          label: formData.label,
          type: formData.type,
          required: formData.required,
          order: formData.order,
          validationRules,
          config,
        }
        await createMutation.mutateAsync(createData)
      }
      handleCloseDialog()
    } catch (error) {
      console.error('Error saving column:', error)
    }
  }

  const handleDelete = async (columnId: string) => {
    if (confirm('Are you sure you want to delete this column?')) {
      try {
        await deleteMutation.mutateAsync(columnId)
      } catch (error) {
        console.error('Error deleting column:', error)
      }
    }
  }

  if (!tenantId) {
    return (
      <Alert severity="warning">
        Please enter a tenant ID to manage datagrid columns.
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
        Error loading columns: {error.message}
      </Alert>
    )
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Datagrid Columns</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Add Column
        </Button>
      </Box>

      <Box mb={3}>
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Filter by Datagrid</InputLabel>
          <Select
            value={selectedDatagridId}
            onChange={(e) => setSelectedDatagridId(e.target.value)}
            label="Filter by Datagrid"
          >
            <MenuItem value="">All Datagrids</MenuItem>
            {datagrids?.map((datagrid) => (
              <MenuItem key={datagrid.id} value={datagrid.id}>
                {datagrid.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Key</TableCell>
              <TableCell>Label</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Datagrid</TableCell>
              <TableCell>Required</TableCell>
              <TableCell>Order</TableCell>
              <TableCell>Created</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {columns?.map((column) => (
              <TableRow key={column.id}>
                <TableCell>{column.key}</TableCell>
                <TableCell>{column.label}</TableCell>
                <TableCell>
                  <Chip label={column.type} size="small" variant="outlined" />
                </TableCell>
                <TableCell>
                  {datagrids?.find(d => d.id === column.datagridId)?.name || 'Unknown'}
                </TableCell>
                <TableCell>
                  <Chip
                    label={column.required ? 'Required' : 'Optional'}
                    color={column.required ? 'error' : 'default'}
                    size="small"
                  />
                </TableCell>
                <TableCell>{column.order}</TableCell>
                <TableCell>
                  {new Date(column.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <IconButton
                    onClick={() => handleOpenDialog(column)}
                    size="small"
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    onClick={() => handleDelete(column.id)}
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

      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingColumn ? 'Edit Column' : 'Add Column'}
        </DialogTitle>
        <DialogContent>
          <FormControl fullWidth margin="normal" disabled={!!editingColumn}>
            <InputLabel>Datagrid</InputLabel>
            <Select
              value={formData.datagridId}
              onChange={(e) => setFormData({ ...formData, datagridId: e.target.value })}
              label="Datagrid"
            >
              {datagrids?.map((datagrid) => (
                <MenuItem key={datagrid.id} value={datagrid.id}>
                  {datagrid.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            label="Key"
            value={formData.key}
            onChange={(e) => setFormData({ ...formData, key: e.target.value })}
            fullWidth
            margin="normal"
            required
            helperText="Unique identifier for this column (e.g., 'email', 'first_name')"
          />
          <TextField
            label="Label"
            value={formData.label}
            onChange={(e) => setFormData({ ...formData, label: e.target.value })}
            fullWidth
            margin="normal"
            required
            helperText="Display name for this column"
          />
          <FormControl fullWidth margin="normal">
            <InputLabel>Type</InputLabel>
            <Select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              label="Type"
            >
              {columnTypes.map((type) => (
                <MenuItem key={type} value={type}>
                  {type}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControlLabel
            control={
              <Checkbox
                checked={formData.required}
                onChange={(e) => setFormData({ ...formData, required: e.target.checked })}
              />
            }
            label="Required"
          />
          <TextField
            label="Order"
            type="number"
            value={formData.order}
            onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Validation Rules (JSON)"
            value={formData.validationRules}
            onChange={(e) => setFormData({ ...formData, validationRules: e.target.value })}
            fullWidth
            margin="normal"
            multiline
            rows={4}
            placeholder='{"min": 1, "max": 100}'
            helperText="Optional validation rules as JSON"
          />
          <TextField
            label="Config (JSON)"
            value={formData.config}
            onChange={(e) => setFormData({ ...formData, config: e.target.value })}
            fullWidth
            margin="normal"
            multiline
            rows={4}
            placeholder='{"placeholder": "Enter value..."}'
            helperText="Optional configuration as JSON"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={!formData.key || !formData.label || !formData.datagridId || createMutation.isPending || updateMutation.isPending}
          >
            {createMutation.isPending || updateMutation.isPending ? (
              <CircularProgress size={20} />
            ) : (
              editingColumn ? 'Update' : 'Create'
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default DatagridColumnsPage