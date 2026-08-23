# EV Charger Server/Client Simulation

Simple TypeScript project that simulates an EV charger talking to a central WebSocket server.

- Fixed price: `Rs 10` per kWh
- Backend: Node.js, WebSocket, Redis, MongoDB, TypeScript
- Frontend: React, Vite, TypeScript
- Billing formula: `(last meter value - first meter value) * pricePerKwh`

## Folder Structure

```text
.
|-- backend
|   |-- src
|   |   |-- config                 # Environment and app config
|   |   |-- constants              # Shared enums/constants
|   |   |-- controllers
|   |   |   `-- transaction         # Transaction route, controller, service
|   |   |-- infrastructure
|   |   |   |-- mongodb             # Mongo connection and schemas
|   |   |   `-- redis               # Redis client and key builders
|   |   |-- protocol
|   |   |   `-- webSocket           # Message parser and protocol types
|   |   |-- server                  # WebSocket server setup
|   |   |-- types                   # Global backend types
|   |   |-- utils                   # Logger, socket helpers, responses
|   |   `-- index.ts                # Backend entry point
|   |-- test                        # Backend tests
|   |-- .env.example
|   |-- package.json
|   `-- tsconfig.json
|-- frontend
|   |-- src
|   |   |-- hooks                   # Global frontend hooks
|   |   |-- modules
|   |   |   `-- EVCharger           # Components, hooks, types, utils
|   |   |-- types                   # Global frontend types
|   |   |-- utils                   # Global frontend utilities
|   |   |-- App.tsx
|   |   `-- main.tsx
|   |-- .env.example
|   |-- package.json
|   `-- tsconfig.json
`-- docker-compose.yml
```

## Backend Setup

```bash
cd backend
npm install
cp .env.example .env
```

Important backend env:

```env
PORT=8080
ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
MONGODB_URI=mongodb://localhost:27017/ev_charger
REDIS_URL=redis://localhost:6379
REDIS_HOST=
REDIS_PORT=
REDIS_USERNAME=
REDIS_PASSWORD=
PRICE_PER_KWH=10
```

For Redis cloud, fill `REDIS_HOST`, `REDIS_PORT`, `REDIS_USERNAME`, and `REDIS_PASSWORD`.

## Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env
```

Frontend env:

```env
VITE_WS_URL=ws://localhost:8080
VITE_METER_INTERVAL_MS=60000
VITE_LOG_LEVEL=info
```

## Start Project

Start local Redis if needed, then run backend and frontend:

```bash
docker compose up -d
cd backend
npm run dev
cd frontend
npm run dev
```

Open `http://localhost:5173`.
