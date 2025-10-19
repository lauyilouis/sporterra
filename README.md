# Sporterra

WORK IN PROGRESS

A self-hosted athlete profile system:
- Multi-tenant: Allow multiple tenants on the platform
- Dynamic athlete profile: Profile layout change according to different sports
- Admin portal: Manage users and profile configuration

## 🏗️ Architecture

This monorepo contains three main applications:

- **`@sporterra/client`** - Customer-facing athlete resume app (Next.js)
- **`@sporterra/admin`** - Admin portal for layout configuration (Next.js)
- **`@sporterra/api`** - Backend API server (Node.js + Fastify)

## 🗄️ Database Conventions

### Naming Convention: Snake Case

**All database fields, table names, and schema elements MUST use snake_case naming convention.**

#### Rules:
- **Table names**: Use plural, lowercase snake_case (e.g., `users`, `athletes`, `achievements`)
- **Column names**: Use lowercase snake_case (e.g., `user_id`, `first_name`, `created_at`)
- **Foreign key columns**: Use `{table_name}_id` format (e.g., `athlete_id`, `user_id`)
- **Boolean columns**: Use descriptive names with `is_` prefix when appropriate (e.g., `is_active`, `is_current`)
- **Timestamp columns**: Use `created_at`, `updated_at` for audit fields
- **Date columns**: Use descriptive names with `_date` suffix (e.g., `date_of_birth`, `achievement_date`)

#### Examples:
```typescript
// ✅ Correct - snake_case in database
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(), // Note: camelCase in TypeScript, snake_case in DB
  firstName: varchar('first_name', { length: 100 }).notNull(), // Note: camelCase in TypeScript, snake_case in DB
  lastName: varchar('last_name', { length: 100 }).notNull(), // Note: camelCase in TypeScript, snake_case in DB
  profileImageUrl: text('profile_image_url'), // Note: camelCase in TypeScript, snake_case in DB
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// ❌ Incorrect - camelCase in database
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: varchar('passwordHash', { length: 255 }).notNull(), // Wrong!
  firstName: varchar('firstName', { length: 100 }).notNull(), // Wrong!
  createdAt: timestamp('createdAt').defaultNow().notNull(), // Wrong!
});
```

#### Important Notes:
- **TypeScript field names**: Use camelCase for TypeScript field names (Drizzle ORM convention)
- **Database column names**: Use snake_case for actual database column names
- **Consistency**: Maintain this convention across all new tables and migrations
- **Existing violations**: The current schema has some inconsistencies that should be fixed in future migrations

> 📖 **For detailed database conventions and guidelines, see [DATABASE_CONVENTIONS.md](./DATABASE_CONVENTIONS.md)**

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- pnpm

### Installation

```bash
# Install dependencies
pnpm install

# Start all applications in development mode
pnpm dev
```

### Individual App Development

```bash
# Start only the client app
pnpm dev:client

# Start only the admin portal
pnpm dev:admin

# Start only the API server
pnpm dev:api
```

## 📱 Applications

### Client App (`@sporterra/client`)
- **Port**: 3000
- **URL**: http://localhost:3000
- **Description**: LinkedIn-style athlete resume system

### Admin Portal (`@sporterra/admin`)
- **Port**: 3002
- **URL**: http://localhost:3002
- **Description**: Admin interface for layout configuration

### API Server (`@sporterra/api`)
- **Port**: 3001
- **URL**: http://localhost:3001
- **Description**: Backend API with Fastify

## 🛠️ Available Scripts

- `pnpm build` - Build all applications
- `pnpm dev` - Start all applications in development mode
- `pnpm lint` - Lint all applications
- `pnpm start` - Start all applications in production mode

## 📁 Project Structure

```
sporterra/
├── apps/
│   ├── client/          # Customer-facing app
│   ├── admin/           # Admin portal
│   └── api/             # Backend API
├── packages/            # Shared packages
├── turbo.json          # Turborepo configuration
└── package.json        # Root package.json
```

## 🐳 Docker Deployment

Coming soon...

## 📄 License

ISC
