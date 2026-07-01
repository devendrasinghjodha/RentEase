# RentEase Setup

## Prerequisites

- Node.js 18+
- MongoDB running locally or a hosted MongoDB connection string

## Install

From the repository root:

```bash
npm run install:all
```

## Environment

Copy [server/.env.example](../server/.env.example) to [server/.env](../server/.env) and set your MongoDB URI and JWT secret.

## Run Development

- Server only: `npm run dev:server`
- Client only: `npm run dev:client`

## Build

```bash
npm run build
```

## Seed Demo Data

```bash
npm run seed
```
