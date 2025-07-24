import { pgTable, uuid, varchar, text, timestamp, integer, decimal, date, boolean, jsonb } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Tenants table - for multi-tenant application
export const tenants = pgTable('tenants', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  subdomain: varchar('subdomain', { length: 100 }).notNull().unique(), // prefix of the tenant url (e.g., "https://<subdomain>.sporterra.com")
  domain: varchar('domain', { length: 255 }), // Custom domain (optional)
  isActive: boolean('is_active').default(true),
  settings: jsonb('settings'), // Tenant-specific settings (e.g., theme, branding)
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Users table
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').references(() => tenants.id, { onDelete: 'cascade' }).notNull(),
  email: varchar('email', { length: 255 }).notNull(),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  firstName: varchar('first_name', { length: 100 }).notNull(),
  lastName: varchar('last_name', { length: 100 }).notNull(),
  profileImageUrl: text('profile_image_url'),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Sections table - system-level sections defined by tenant
export const sections = pgTable('sections', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').references(() => tenants.id, { onDelete: 'cascade' }).notNull(),
  name: varchar('name', { length: 100 }).notNull(), // e.g., "Experience", "Achievements", "Skills"
  description: text('description'), // Optional description of what this section is for
  order: integer('order').notNull().default(0), // For ordering sections on the profile
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Datagrids table - custom datagrids within sections
export const datagrids = pgTable('datagrids', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').references(() => tenants.id, { onDelete: 'cascade' }).notNull(),
  sectionId: uuid('section_id').references(() => sections.id, { onDelete: 'cascade' }).notNull(),
  name: varchar('name', { length: 100 }).notNull(), // e.g., "Experience", "Competition History"
  description: text('description'), // Optional description of the datagrid
  order: integer('order').notNull().default(0), // For ordering datagrids within a section
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Datagrid columns table - defines the structure of each datagrid
export const datagridColumns = pgTable('datagrid_columns', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').references(() => tenants.id, { onDelete: 'cascade' }).notNull(),
  datagridId: uuid('datagrid_id').references(() => datagrids.id, { onDelete: 'cascade' }).notNull(),
  key: varchar('key', { length: 100 }).unique().notNull(), // This field is to be used as the key for the data rows data object e.g., "time_period", "team", "position"
  label: varchar('label', { length: 100 }).notNull(), // Display label for the column
  type: varchar('type', { length: 50 }).notNull(), // e.g., "text", "date", "number", "select", "boolean"
  required: boolean('required').default(false),
  order: integer('order').notNull().default(0), // For ordering columns within a datagrid
  validation_rules: jsonb('validation_rules'), // Extra validation rules for the column, e.g. min, max, pattern, etc.
  config: jsonb('config'), // The config for the column, e.g. select options, etc.
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Datagrid rows table - stores the actual data for each user's datagrid
export const datagridRows = pgTable('datagrid_rows', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').references(() => tenants.id, { onDelete: 'cascade' }).notNull(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  datagridId: uuid('datagrid_id').references(() => datagrids.id, { onDelete: 'cascade' }).notNull(),
  data: jsonb('data').notNull(), // Flexible JSON data matching the column structure
  order: integer('order').notNull().default(0), // For ordering rows within a datagrid
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Relations
export const tenantsRelations = relations(tenants, ({ many }) => ({
  users: many(users),
  sections: many(sections),
  datagrids: many(datagrids),
  datagridColumns: many(datagridColumns),
  datagridRows: many(datagridRows),
}));

export const usersRelations = relations(users, ({ one, many }) => ({
  tenant: one(tenants, {
    fields: [users.tenantId],
    references: [tenants.id],
  }),
  datagridRows: many(datagridRows),
}));

export const sectionsRelations = relations(sections, ({ one, many }) => ({
  tenant: one(tenants, {
    fields: [sections.tenantId],
    references: [tenants.id],
  }),
  datagrids: many(datagrids),
}));

export const datagridsRelations = relations(datagrids, ({ one, many }) => ({
  tenant: one(tenants, {
    fields: [datagrids.tenantId],
    references: [tenants.id],
  }),
  section: one(sections, {
    fields: [datagrids.sectionId],
    references: [sections.id],
  }),
  columns: many(datagridColumns),
  rows: many(datagridRows),
}));

export const datagridColumnsRelations = relations(datagridColumns, ({ one }) => ({
  tenant: one(tenants, {
    fields: [datagridColumns.tenantId],
    references: [tenants.id],
  }),
  datagrid: one(datagrids, {
    fields: [datagridColumns.datagridId],
    references: [datagrids.id],
  }),
}));

export const datagridRowsRelations = relations(datagridRows, ({ one }) => ({
  tenant: one(tenants, {
    fields: [datagridRows.tenantId],
    references: [tenants.id],
  }),
  user: one(users, {
    fields: [datagridRows.userId],
    references: [users.id],
  }),
  datagrid: one(datagrids, {
    fields: [datagridRows.datagridId],
    references: [datagrids.id],
  }),
})); 