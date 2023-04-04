## First deployment 
- use `docker compose up -d`
- then `docker exec mcpod2_backend npm run db:migrate`
- then `docker exec mcpod2_backend npm run db:seed`

## Reseed the database after changing CSV files in data directory
- run `docker exec mcpod2_backend npm run db:seed`