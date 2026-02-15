# Extended Tables

Extended tables support colspan using `||` for empty cells that merge with the previous column.

## Basic Colspan

| Feature | Description ||
|---------|-------------|
| Colspan | Merges cells horizontally |
| Standard | Normal table cell | Extra column |

## Project Status Dashboard

| Project | Q1 | Q2 | Q3 | Q4 |
|---------|:--:|:--:|:--:|:--:|
| Alpha | Done | Done | In Progress | Planned |
| Beta | Done | In Progress || Planned |
| Gamma | Planning ||||

## API Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/users` | List all users | Token |
| POST | `/api/users` | Create a user | Token |
| GET | `/api/users/:id` | Get user by ID | Token |
| DELETE | `/api/users/:id` | Delete a user | Admin |
| GET | `/api/health` | Health check | None |

## Comparison Matrix

| Feature | Free | Pro | Enterprise |
|---------|:----:|:---:|:----------:|
| Users | 5 | 50 | Unlimited |
| Storage | 1 GB | 100 GB | Unlimited |
| Support | Community | Email | Dedicated |
| SLA | - | 99.9% | 99.99% |
| SSO | - | - | Yes |
| Custom domain | - | Yes | Yes |
| API access | Limited | Full | Full |
| Audit logs | - | - | Yes |

## Standard Tables Still Work

Regular GFM tables work perfectly alongside extended features:

| Name | Language | Stars |
|------|----------|------:|
| React | JavaScript | 220k |
| Vue | JavaScript | 207k |
| Svelte | JavaScript | 78k |
| Angular | TypeScript | 95k |
