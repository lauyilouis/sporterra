import { FastifyInstance } from 'fastify';
import { eq, and } from 'drizzle-orm';
import { db } from '../db/index.js';
import { users, sections, datagrids, datagridColumns, datagridRows, tenants } from '../db/schema.js';

interface GetUserSectionParams {
  userId: string;
  sectionId: string;
}

interface GetUserSectionQuery {
  tenantId?: string;
}

export async function userSectionRoutes(fastify: FastifyInstance) {
  // GET /api/users/:userId/sections/:sectionId
  fastify.get<{
    Params: GetUserSectionParams;
    Querystring: GetUserSectionQuery;
  }>('/api/users/:userId/sections/:sectionId', async (request, reply) => {
    try {
      const { userId, sectionId } = request.params;
      const { tenantId } = request.query;

      // Validate UUIDs
      if (!isValidUUID(userId) || !isValidUUID(sectionId)) {
        return reply.status(400).send({
          error: 'Invalid UUID format',
          message: 'Both userId and sectionId must be valid UUIDs'
        });
      }

      // Get the section with tenant validation
      const section = await db.query.sections.findFirst({
        where: and(
          eq(sections.id, sectionId),
          tenantId ? eq(sections.tenantId, tenantId) : undefined
        ),
        with: {
          datagrids: {
            with: {
              columns: {
                orderBy: (columns, { asc }) => [asc(columns.order)]
              },
              rows: {
                where: eq(datagridRows.userId, userId),
                orderBy: (rows, { asc }) => [asc(rows.order)]
              }
            },
            orderBy: (datagrids, { asc }) => [asc(datagrids.order)]
          }
        }
      });

      if (!section) {
        return reply.status(404).send({
          error: 'Section not found',
          message: 'The specified section does not exist or you do not have access to it'
        });
      }

      // Get user information
      const user = await db.query.users.findFirst({
        where: and(
          eq(users.id, userId),
          tenantId ? eq(users.tenantId, tenantId) : undefined
        )
      });

      if (!user) {
        return reply.status(404).send({
          error: 'User not found',
          message: 'The specified user does not exist or you do not have access to them'
        });
      }

      // Transform the data for the response
      const sectionData = {
        id: section.id,
        name: section.name,
        description: section.description,
        order: section.order,
        datagrids: section.datagrids.map(datagrid => ({
          id: datagrid.id,
          name: datagrid.name,
          description: datagrid.description,
          order: datagrid.order,
          columns: datagrid.columns.map(column => ({
            key: column.key,
            label: column.label,
            type: column.type,
            required: column.required,
            order: column.order,
            validationRules: column.validation_rules,
            config: column.config
          })),
          rows: datagrid.rows.map(row => ({
            id: row.id,
            data: row.data,
            order: row.order,
            isActive: row.isActive,
            createdAt: row.createdAt,
            updatedAt: row.updatedAt
          }))
        }))
      };

      return {
        success: true,
        data: {
          user: {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            profileImageUrl: user.profileImageUrl
          },
          section: sectionData
        }
      };

    } catch (error) {
      fastify.log.error('Error fetching user section data:', error);
      return reply.status(500).send({
        error: 'Internal server error',
        message: 'An error occurred while fetching the user section data'
      });
    }
  });
}

// Helper function to validate UUID format
function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
} 