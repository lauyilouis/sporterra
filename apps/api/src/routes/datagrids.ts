import { FastifyInstance } from 'fastify';
import { eq, and, desc } from 'drizzle-orm';
import { db } from '../db/index.js';
import { datagrids, sections } from '../db/schema.js';

interface CreateDatagridBody {
  tenantId: string;
  sectionId: string;
  name: string;
  description?: string;
  order?: number;
}

interface GetDatagridParams {
  datagridId: string;
}

interface UpdateDatagridParams {
  datagridId: string;
}

interface UpdateDatagridBody {
  name?: string;
  description?: string;
  order?: number;
  isActive?: boolean;
}

interface DeleteDatagridParams {
  datagridId: string;
}

interface ListDatagridsQuery {
  tenantId?: string;
  sectionId?: string;
}

export async function datagridRoutes(fastify: FastifyInstance) {
  // POST /api/datagrids - Create a new datagrid
  fastify.post<{
    Body: CreateDatagridBody;
  }>('/api/datagrids', async (request, reply) => {
    try {
      const { tenantId, sectionId, name, description, order = 0 } = request.body;

      // Validate required fields
      if (!tenantId || !sectionId || !name) {
        return reply.status(400).send({
          error: 'Missing required fields',
          message: 'tenantId, sectionId, and name are required'
        });
      }

      // Validate UUID formats
      if (!isValidUUID(tenantId) || !isValidUUID(sectionId)) {
        return reply.status(400).send({
          error: 'Invalid UUID format',
          message: 'tenantId and sectionId must be valid UUIDs'
        });
      }

      // Verify section exists and belongs to tenant
      const section = await db.query.sections.findFirst({
        where: and(
          eq(sections.id, sectionId),
          eq(sections.tenantId, tenantId)
        )
      });

      if (!section) {
        return reply.status(404).send({
          error: 'Section not found',
          message: 'The specified section does not exist or does not belong to the tenant'
        });
      }

      // Create the datagrid
      const [newDatagrid] = await db.insert(datagrids).values({
        tenantId,
        sectionId,
        name,
        description,
        order
      }).returning();

      return {
        success: true,
        data: newDatagrid
      };

    } catch (error) {
      fastify.log.error('Error creating datagrid:', error);
      return reply.status(500).send({
        error: 'Internal server error',
        message: 'An error occurred while creating the datagrid'
      });
    }
  });

  // GET /api/datagrids - List datagrids
  fastify.get<{
    Querystring: ListDatagridsQuery;
  }>('/api/datagrids', async (request, reply) => {
    try {
      const { tenantId, sectionId } = request.query;

      let whereConditions;
      if (tenantId && sectionId) {
        whereConditions = and(
          eq(datagrids.tenantId, tenantId),
          eq(datagrids.sectionId, sectionId)
        );
      } else if (tenantId) {
        whereConditions = eq(datagrids.tenantId, tenantId);
      } else if (sectionId) {
        whereConditions = eq(datagrids.sectionId, sectionId);
      }

      const datagridsList = await db.query.datagrids.findMany({
        where: whereConditions,
        orderBy: [desc(datagrids.order), desc(datagrids.createdAt)],
        with: {
          section: true
        }
      });

      return {
        success: true,
        data: datagridsList
      };

    } catch (error) {
      fastify.log.error('Error fetching datagrids:', error);
      return reply.status(500).send({
        error: 'Internal server error',
        message: 'An error occurred while fetching datagrids'
      });
    }
  });

  // GET /api/datagrids/:datagridId - Get a specific datagrid
  fastify.get<{
    Params: GetDatagridParams;
  }>('/api/datagrids/:datagridId', async (request, reply) => {
    try {
      const { datagridId } = request.params;

      // Validate UUID format
      if (!isValidUUID(datagridId)) {
        return reply.status(400).send({
          error: 'Invalid UUID format',
          message: 'datagridId must be a valid UUID'
        });
      }

      const datagrid = await db.query.datagrids.findFirst({
        where: eq(datagrids.id, datagridId),
        with: {
          section: true,
          columns: {
            orderBy: (columns, { asc }) => [asc(columns.order)]
          },
          rows: {
            orderBy: (rows, { asc }) => [asc(rows.order)]
          }
        }
      });

      if (!datagrid) {
        return reply.status(404).send({
          error: 'Datagrid not found',
          message: 'The specified datagrid does not exist'
        });
      }

      return {
        success: true,
        data: datagrid
      };

    } catch (error) {
      fastify.log.error('Error fetching datagrid:', error);
      return reply.status(500).send({
        error: 'Internal server error',
        message: 'An error occurred while fetching the datagrid'
      });
    }
  });

  // PUT /api/datagrids/:datagridId - Update a datagrid
  fastify.put<{
    Params: UpdateDatagridParams;
    Body: UpdateDatagridBody;
  }>('/api/datagrids/:datagridId', async (request, reply) => {
    try {
      const { datagridId } = request.params;
      const updateData = request.body;

      // Validate UUID format
      if (!isValidUUID(datagridId)) {
        return reply.status(400).send({
          error: 'Invalid UUID format',
          message: 'datagridId must be a valid UUID'
        });
      }

      // Check if datagrid exists
      const existingDatagrid = await db.query.datagrids.findFirst({
        where: eq(datagrids.id, datagridId)
      });

      if (!existingDatagrid) {
        return reply.status(404).send({
          error: 'Datagrid not found',
          message: 'The specified datagrid does not exist'
        });
      }

      // Update the datagrid
      const [updatedDatagrid] = await db.update(datagrids)
        .set({
          ...updateData,
          updatedAt: new Date()
        })
        .where(eq(datagrids.id, datagridId))
        .returning();

      return {
        success: true,
        data: updatedDatagrid
      };

    } catch (error) {
      fastify.log.error('Error updating datagrid:', error);
      return reply.status(500).send({
        error: 'Internal server error',
        message: 'An error occurred while updating the datagrid'
      });
    }
  });

  // DELETE /api/datagrids/:datagridId - Delete a datagrid
  fastify.delete<{
    Params: DeleteDatagridParams;
  }>('/api/datagrids/:datagridId', async (request, reply) => {
    try {
      const { datagridId } = request.params;

      // Validate UUID format
      if (!isValidUUID(datagridId)) {
        return reply.status(400).send({
          error: 'Invalid UUID format',
          message: 'datagridId must be a valid UUID'
        });
      }

      // Check if datagrid exists
      const existingDatagrid = await db.query.datagrids.findFirst({
        where: eq(datagrids.id, datagridId)
      });

      if (!existingDatagrid) {
        return reply.status(404).send({
          error: 'Datagrid not found',
          message: 'The specified datagrid does not exist'
        });
      }

      // Delete the datagrid (cascading will handle related columns and rows)
      await db.delete(datagrids).where(eq(datagrids.id, datagridId));

      return {
        success: true,
        message: 'Datagrid deleted successfully'
      };

    } catch (error) {
      fastify.log.error('Error deleting datagrid:', error);
      return reply.status(500).send({
        error: 'Internal server error',
        message: 'An error occurred while deleting the datagrid'
      });
    }
  });
}

// Helper function to validate UUID format
function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}