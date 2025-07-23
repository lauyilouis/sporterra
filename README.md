# Sporterra

A self-hosted athlete resume system with LinkedIn-like profiles and an admin portal for layout configuration.

## 🏗️ Architecture

This monorepo contains three main applications:

- **`@sporterra/client`** - Customer-facing athlete resume app (Next.js)
- **`@sporterra/admin`** - Admin portal for layout configuration (Next.js)
- **`@sporterra/api`** - Backend API server (Node.js + Fastify)

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
