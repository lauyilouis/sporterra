import { FastifyInstance } from 'fastify';
import { eq, and, desc } from 'drizzle-orm';
import { db } from '../db/index.js';
import { datagridColumns, datagrids } from '../db/schema.js';

interface CreateDatagridColumnBody {
  tenantId: string;
  datagridId: string;
  key: string;
  label: string;
  type: string;
  required?: boolean;
  order?: number;
  validationRules?: any;
  config?: any;
}

interface GetDatagridColumnParams {
  columnId: string;
}

interface UpdateDatagridColumnParams {
  columnId: string;
}

interface UpdateDatagridColumnBody {
  key?: string;
  label?: string;
  type?: string;
  required?: boolean;
  order?: number;
  validationRules?: any;
  config?: any;
}

interface DeleteDatagridColumnParams {
  columnId: string;
}

interface ListDatagridColumnsQuery {
  tenantId?: string;
  datagridId?: string;
}

export async function datagridColumnRoutes(fastify: FastifyInstance) {
  // POST /api/datagrid-columns - Create a new datagrid column
  fastify.post<{
    Body: CreateDatagridColumnBody;
  }>('/api/datagrid-columns', async (request, reply) => {
    try {
      const { 
        tenantId, 
        datagridId, 
        key, 
        label, 
        type, 
        required = false, 
        order = 0, 
        validationRules, 
        config 
      } = request.body;

      // Validate required fields
      if (!tenantId || !datagridId || !key || !label || !type) {
        return reply.status(400).send({
          error: 'Missing required fields',
          message: 'tenantId, datagridId, key, label, and type are required'
        });
      }

      // Validate UUID formats
      if (!isValidUUID(tenantId) || !isValidUUID(datagridId)) {
        return reply.status(400).send({
          error: 'Invalid UUID format',
          message: 'tenantId and datagridId must be valid UUIDs'
        });
      }

      // Verify datagrid exists and belongs to tenant
      const datagrid = await db.query.datagrids.findFirst({
        where: and(
          eq(datagrids.id, datagridId),
          eq(datagrids.tenantId, tenantId)
        )
      });

      if (!datagrid) {
        return reply.status(404).send({
          error: 'Datagrid not found',
          message: 'The specified datagrid does not exist or does not belong to the tenant'
        });
      }

      // Create the datagrid column
      const [newColumn] = await db.insert(datagridColumns).values({
        tenantId,
        datagridId,
        key,
        label,
        type,
        required,
        order,
        validation_rules: validationRules,
        config
      }).returning();

      return {
        success: true,
        data: {
          ...newColumn,
          validationRules: newColumn.validation_rules
        }
      };

    } catch (error) {
      fastify.log.error('Error creating datagrid column:', error);
      return reply.status(500).send({
        error: 'Internal server error',
        message: 'An error occurred while creating the datagrid column'
      });
    }
  });

  // GET /api/datagrid-columns - List datagrid columns
  fastify.get<{
    Querystring: ListDatagridColumnsQuery;
  }>('/api/datagrid-columns', async (request, reply) => {
    try {
      const { tenantId, datagridId } = request.query;

      let whereConditions;
      if (tenantId && datagridId) {
        whereConditions = and(
          eq(datagridColumns.tenantId, tenantId),
          eq(datagridColumns.datagridId, datagridId)
        );
      } else if (tenantId) {
        whereConditions = eq(datagridColumns.tenantId, tenantId);
      } else if (datagridId) {
        whereConditions = eq(datagridColumns.datagridId, datagridId);
      }

      const columnsList = await db.query.datagridColumns.findMany({
        where: whereConditions,
        orderBy: [desc(datagridColumns.order), desc(datagridColumns.createdAt)],
        with: {
          datagrid: true
        }
      });

      // Transform the response to use camelCase for validationRules
      const transformedColumns = columnsList.map(column => ({
        ...column,
        validationRules: column.validation_rules
      }));

      return {
        success: true,
        data: transformedColumns
      };

    } catch (error) {
      fastify.log.error('Error fetching datagrid columns:', error);
      return reply.status(500).send({
        error: 'Internal server error',
        message: 'An error occurred while fetching datagrid columns'
      });
    }
  });

  // GET /api/datagrid-columns/:columnId - Get a specific datagrid column
  fastify.get<{
    Params: GetDatagridColumnParams;
  }>('/api/datagrid-columns/:columnId', async (request, reply) => {
    try {
      const { columnId } = request.params;

      // Validate UUID format
      if (!isValidUUID(columnId)) {
        return reply.status(400).send({
          error: 'Invalid UUID format',
          message: 'columnId must be a valid UUID'
        });
      }

      const column = await db.query.datagridColumns.findFirst({
        where: eq(datagridColumns.id, columnId),
        with: {
          datagrid: {
            with: {
              section: true
            }
          }
        }
      });

      if (!column) {
        return reply.status(404).send({
          error: 'Column not found',
          message: 'The specified datagrid column does not exist'
        });
      }

      // Transform the response to use camelCase for validationRules
      const transformedColumn = {
        ...column,
        validationRules: column.validation_rules
      };

      return {
        success: true,
        data: transformedColumn
      };

    } catch (error) {
      fastify.log.error('Error fetching datagrid column:', error);
      return reply.status(500).send({
        error: 'Internal server error',
        message: 'An error occurred while fetching the datagrid column'
      });
    }
  });

  // PUT /api/datagrid-columns/:columnId - Update a datagrid column
  fastify.put<{
    Params: UpdateDatagridColumnParams;
    Body: UpdateDatagridColumnBody;
  }>('/api/datagrid-columns/:columnId', async (request, reply) => {
    try {
      const { columnId } = request.params;
      const { validationRules, ...otherData } = request.body;

      // Validate UUID format
      if (!isValidUUID(columnId)) {
        return reply.status(400).send({
          error: 'Invalid UUID format',
          message: 'columnId must be a valid UUID'
        });
      }

      // Check if column exists
      const existingColumn = await db.query.datagridColumns.findFirst({
        where: eq(datagridColumns.id, columnId)
      });

      if (!existingColumn) {
        return reply.status(404).send({
          error: 'Column not found',
          message: 'The specified datagrid column does not exist'
        });
      }

      // Prepare update data with snake_case for database
      const updateData = {
        ...otherData,
        validation_rules: validationRules,
        updatedAt: new Date()
      };

      // Update the column
      const [updatedColumn] = await db.update(datagridColumns)
        .set(updateData)
        .where(eq(datagridColumns.id, columnId))
        .returning();

      // Transform the response to use camelCase for validationRules
      const transformedColumn = {
        ...updatedColumn,
        validationRules: updatedColumn.validation_rules
      };

      return {
        success: true,
        data: transformedColumn
      };

    } catch (error) {
      fastify.log.error('Error updating datagrid column:', error);
      return reply.status(500).send({
        error: 'Internal server error',
        message: 'An error occurred while updating the datagrid column'
      });
    }
  });

  // DELETE /api/datagrid-columns/:columnId - Delete a datagrid column
  fastify.delete<{
    Params: DeleteDatagridColumnParams;
  }>('/api/datagrid-columns/:columnId', async (request, reply) => {
    try {
      const { columnId } = request.params;

      // Validate UUID format
      if (!isValidUUID(columnId)) {
        return reply.status(400).send({
          error: 'Invalid UUID format',
          message: 'columnId must be a valid UUID'
        });
      }

      // Check if column exists
      const existingColumn = await db.query.datagridColumns.findFirst({
        where: eq(datagridColumns.id, columnId)
      });

      if (!existingColumn) {
        return reply.status(404).send({
          error: 'Column not found',
          message: 'The specified datagrid column does not exist'
        });
      }

      // Delete the column
      await db.delete(datagridColumns).where(eq(datagridColumns.id, columnId));

      return {
        success: true,
        message: 'Datagrid column deleted successfully'
      };

    } catch (error) {
      fastify.log.error('Error deleting datagrid column:', error);
      return reply.status(500).send({
        error: 'Internal server error',
        message: 'An error occurred while deleting the datagrid column'
      });
    }
  });
}

// Helper function to validate UUID format
function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}