import { config } from "dotenv";
config({ path: ".env.local" });
console.log("MONDAY_API_KEY starts with:", process.env.MONDAY_API_KEY ? process.env.MONDAY_API_KEY.substring(0, 10) : "UNDEFINED");
