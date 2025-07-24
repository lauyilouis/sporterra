# Database Conventions

## 🗄️ Snake Case Naming Convention

**MANDATORY RULE: All database fields, table names, and schema elements MUST use snake_case naming convention.**

## 📋 Rules

### Table Names
- Use **plural**, **lowercase** snake_case
- Examples: `users`, `athletes`, `achievements`, `skills`, `experiences`

### Column Names
- Use **lowercase** snake_case
- Examples: `user_id`, `first_name`, `created_at`, `is_active`

### Foreign Key Columns
- Use `{table_name}_id` format
- Examples: `athlete_id`, `user_id`, `organization_id`

### Boolean Columns
- Use descriptive names with `is_` prefix when appropriate
- Examples: `is_active`, `is_current`, `is_verified`

### Timestamp Columns
- Use `created_at`, `updated_at` for audit fields
- Use descriptive names with `_at` suffix for other timestamps

### Date Columns
- Use descriptive names with `_date` suffix
- Examples: `date_of_birth`, `achievement_date`, `start_date`, `end_date`

### Numeric Columns
- Use descriptive names with appropriate suffixes
- Examples: `height_cm`, `weight_kg`, `jersey_number`

## ✅ Correct Examples

```typescript
// Users table
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  firstName: varchar('first_name', { length: 100 }).notNull(),
  lastName: varchar('last_name', { length: 100 }).notNull(),
  profileImageUrl: text('profile_image_url'),
  bio: text('bio'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Athletes table
export const athletes = pgTable('athletes', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  sport: varchar('sport', { length: 100 }).notNull(),
  position: varchar('position', { length: 100 }),
  heightCm: integer('height_cm'),
  weightKg: decimal('weight_kg', { precision: 5, scale: 2 }),
  dateOfBirth: date('date_of_birth'),
  nationality: varchar('nationality', { length: 100 }),
  team: varchar('team', { length: 255 }),
  jerseyNumber: integer('jersey_number'),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
```

## ❌ Incorrect Examples

```typescript
// WRONG - camelCase in database
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: varchar('passwordHash', { length: 255 }).notNull(), // ❌
  firstName: varchar('firstName', { length: 100 }).notNull(), // ❌
  lastName: varchar('lastName', { length: 100 }).notNull(), // ❌
  profileImageUrl: text('profileImageUrl'), // ❌
  createdAt: timestamp('createdAt').defaultNow().notNull(), // ❌
  updatedAt: timestamp('updatedAt').defaultNow().notNull(), // ❌
});

// WRONG - inconsistent naming
export const athletes = pgTable('athletes', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('userId').references(() => users.id, { onDelete: 'cascade' }).notNull(), // ❌
  heightCm: integer('heightCm'), // ❌
  weightKg: decimal('weightKg', { precision: 5, scale: 2 }), // ❌
  dateOfBirth: date('dateOfBirth'), // ❌
  jerseyNumber: integer('jerseyNumber'), // ❌
  isActive: boolean('isActive').default(true), // ❌
});
```

## 🔧 Drizzle ORM Specific Notes

### TypeScript Field Names vs Database Column Names
- **TypeScript field names**: Use camelCase (Drizzle ORM convention)
- **Database column names**: Use snake_case (PostgreSQL convention)

```typescript
// ✅ Correct - camelCase in TypeScript, snake_case in database
export const users = pgTable('users', {
  // TypeScript field name (camelCase)
  firstName: varchar('first_name', { length: 100 }).notNull(), // Database column name (snake_case)
  lastName: varchar('last_name', { length: 100 }).notNull(),
  profileImageUrl: text('profile_image_url'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
```

### Relations
- Use camelCase for relation field names in TypeScript
- Database foreign key columns should be snake_case

```typescript
// ✅ Correct
export const athletesRelations = relations(athletes, ({ one, many }) => ({
  user: one(users, { // camelCase relation name
    fields: [athletes.userId], // camelCase field reference
    references: [users.id],
  }),
  achievements: many(achievements), // camelCase relation name
}));
```

## 🚨 Current Schema Violations

The current schema has some inconsistencies that should be addressed:

1. **Table names**: All are correctly using snake_case ✅
2. **Most column names**: Correctly using snake_case ✅
3. **Some inconsistencies**: Need to be fixed in future migrations

### Areas for Improvement:
- Ensure all foreign key columns follow `{table_name}_id` pattern
- Verify all boolean columns use `is_` prefix when appropriate
- Check all timestamp columns use `_at` suffix
- Validate all date columns use `_date` suffix

## 📝 Migration Guidelines

When creating new migrations:

1. **Always use snake_case** for database column names
2. **Use camelCase** for TypeScript field names
3. **Follow the naming patterns** outlined above
4. **Test migrations** to ensure they work correctly
5. **Update this document** if new patterns emerge

## 🔍 Validation Checklist

Before committing schema changes:

- [ ] All table names use plural, lowercase snake_case
- [ ] All column names use lowercase snake_case
- [ ] Foreign key columns use `{table_name}_id` format
- [ ] Boolean columns use `is_` prefix when appropriate
- [ ] Timestamp columns use `created_at`, `updated_at` or `_at` suffix
- [ ] Date columns use `_date` suffix
- [ ] TypeScript field names use camelCase
- [ ] Database column names use snake_case
- [ ] Relations use camelCase names
- [ ] No camelCase in actual database column names 