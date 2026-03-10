# Custom Lead-Calling Dashboard API

This is a full-stack Next.js project setup for a custom lead-calling dashboard.

## Tech Stack
- **Frontend**: Next.js (App Router), React, TypeScript
- **Styling**: TailwindCSS
- **Backend**: Node.js API Routes (Next.js route handlers)
- **Realtime Updates**: Socket.io 
- **Integrations**: Monday.com API, Twilio Voice SDK

## Project Structure
- `lib/`: Contains external client initializations (`mondayClient.ts`, `twilioClient.ts`)
- `services/`: Contains specific business logic and core functions (`mondayService.ts`, `twilioService.ts`)
- `app/api/`: Contains Next.js serverless route handlers

## First-time Setup
1. Copy the environment variables example and configure your variables:
   ```bash
   cp .env.example .env.local
   ```
2. Fill your `.env.local` with real values from Twilio and Monday.com.
3. Install dependencies:
   ```bash
   npm install
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```

## Available Endpoints
- **`GET /api/health`**: Verifies the API is online.
- **`GET /api/monday/lost-leads`**: Queries Monday.com GraphQL API for leads in the "Lost" group.
- **`POST /api/twilio/token`**: Generates passing an optional `{ "clientName": "..." }` body and returns a Twilio Access Token.

## Testing Locally
Run `npm run dev` and navigate to:
- http://localhost:3000/api/health
- http://localhost:3000/api/monday/lost-leads
