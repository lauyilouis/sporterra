import { FastifyInstance } from 'fastify';
import { eq, and, desc } from 'drizzle-orm';
import { db } from '../db/index.js';
import { sections, tenants } from '../db/schema.js';

interface CreateSectionBody {
  tenantId: string;
  name: string;
  description?: string;
  order?: number;
}

interface GetSectionParams {
  sectionId: string;
}

interface UpdateSectionParams {
  sectionId: string;
}

interface UpdateSectionBody {
  name?: string;
  description?: string;
  order?: number;
  isActive?: boolean;
}

interface DeleteSectionParams {
  sectionId: string;
}

interface ListSectionsQuery {
  tenantId?: string;
}

export async function sectionRoutes(fastify: FastifyInstance) {
  // POST /api/sections - Create a new section
  fastify.post<{
    Body: CreateSectionBody;
  }>('/api/sections', async (request, reply) => {
    try {
      const { tenantId, name, description, order = 0 } = request.body;

      // Validate required fields
      if (!tenantId || !name) {
        return reply.status(400).send({
          error: 'Missing required fields',
          message: 'tenantId and name are required'
        });
      }

      // Validate UUID format
      if (!isValidUUID(tenantId)) {
        return reply.status(400).send({
          error: 'Invalid UUID format',
          message: 'tenantId must be a valid UUID'
        });
      }

      // Verify tenant exists
      const tenant = await db.query.tenants.findFirst({
        where: eq(tenants.id, tenantId)
      });

      if (!tenant) {
        return reply.status(404).send({
          error: 'Tenant not found',
          message: 'The specified tenant does not exist'
        });
      }

      // Create the section
      const [newSection] = await db.insert(sections).values({
        tenantId,
        name,
        description,
        order
      }).returning();

      return {
        success: true,
        data: newSection
      };

    } catch (error) {
      fastify.log.error('Error creating section:', error);
      return reply.status(500).send({
        error: 'Internal server error',
        message: 'An error occurred while creating the section'
      });
    }
  });

  // GET /api/sections - List all sections
  fastify.get<{
    Querystring: ListSectionsQuery;
  }>('/api/sections', async (request, reply) => {
    try {
      const { tenantId } = request.query;

      const sectionsList = await db.query.sections.findMany({
        where: tenantId ? eq(sections.tenantId, tenantId) : undefined,
        orderBy: [desc(sections.order), desc(sections.createdAt)]
      });

      return {
        success: true,
        data: sectionsList
      };

    } catch (error) {
      fastify.log.error('Error fetching sections:', error);
      return reply.status(500).send({
        error: 'Internal server error',
        message: 'An error occurred while fetching sections'
      });
    }
  });

  // GET /api/sections/:sectionId - Get a specific section
  fastify.get<{
    Params: GetSectionParams;
  }>('/api/sections/:sectionId', async (request, reply) => {
    try {
      const { sectionId } = request.params;

      // Validate UUID format
      if (!isValidUUID(sectionId)) {
        return reply.status(400).send({
          error: 'Invalid UUID format',
          message: 'sectionId must be a valid UUID'
        });
      }

      const section = await db.query.sections.findFirst({
        where: eq(sections.id, sectionId),
        with: {
          datagrids: {
            orderBy: (datagrids, { asc }) => [asc(datagrids.order)]
          }
        }
      });

      if (!section) {
        return reply.status(404).send({
          error: 'Section not found',
          message: 'The specified section does not exist'
        });
      }

      return {
        success: true,
        data: section
      };

    } catch (error) {
      fastify.log.error('Error fetching section:', error);
      return reply.status(500).send({
        error: 'Internal server error',
        message: 'An error occurred while fetching the section'
      });
    }
  });

  // PUT /api/sections/:sectionId - Update a section
  fastify.put<{
    Params: UpdateSectionParams;
    Body: UpdateSectionBody;
  }>('/api/sections/:sectionId', async (request, reply) => {
    try {
      const { sectionId } = request.params;
      const updateData = request.body;

      // Validate UUID format
      if (!isValidUUID(sectionId)) {
        return reply.status(400).send({
          error: 'Invalid UUID format',
          message: 'sectionId must be a valid UUID'
        });
      }

      // Check if section exists
      const existingSection = await db.query.sections.findFirst({
        where: eq(sections.id, sectionId)
      });

      if (!existingSection) {
        return reply.status(404).send({
          error: 'Section not found',
          message: 'The specified section does not exist'
        });
      }

      // Update the section
      const [updatedSection] = await db.update(sections)
        .set({
          ...updateData,
          updatedAt: new Date()
        })
        .where(eq(sections.id, sectionId))
        .returning();

      return {
        success: true,
        data: updatedSection
      };

    } catch (error) {
      fastify.log.error('Error updating section:', error);
      return reply.status(500).send({
        error: 'Internal server error',
        message: 'An error occurred while updating the section'
      });
    }
  });

  // DELETE /api/sections/:sectionId - Delete a section
  fastify.delete<{
    Params: DeleteSectionParams;
  }>('/api/sections/:sectionId', async (request, reply) => {
    try {
      const { sectionId } = request.params;

      // Validate UUID format
      if (!isValidUUID(sectionId)) {
        return reply.status(400).send({
          error: 'Invalid UUID format',
          message: 'sectionId must be a valid UUID'
        });
      }

      // Check if section exists
      const existingSection = await db.query.sections.findFirst({
        where: eq(sections.id, sectionId)
      });

      if (!existingSection) {
        return reply.status(404).send({
          error: 'Section not found',
          message: 'The specified section does not exist'
        });
      }

      // Delete the section (cascading will handle related datagrids)
      await db.delete(sections).where(eq(sections.id, sectionId));

      return {
        success: true,
        message: 'Section deleted successfully'
      };

    } catch (error) {
      fastify.log.error('Error deleting section:', error);
      return reply.status(500).send({
        error: 'Internal server error',
        message: 'An error occurred while deleting the section'
      });
    }
  });
}

// Helper function to validate UUID format
function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}