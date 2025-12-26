import * as dotenv from "dotenv";
import * as path from "path";

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

console.log("🔍 Environment Debug:");
console.log("Current working directory:", process.cwd());
console.log(".env file path:", path.resolve(__dirname, '..', '.env'));
console.log("PRIVATE_KEY exists:", !!process.env.PRIVATE_KEY);
console.log("PRIVATE_KEY length:", process.env.PRIVATE_KEY?.length || 0);
console.log("PRIVATE_KEY starts with 0x:", process.env.PRIVATE_KEY?.startsWith('0x') || false);
console.log("RPC_URL:", process.env.RPC_URL);

if (process.env.PRIVATE_KEY) {
  console.log("PRIVATE_KEY first 10 chars:", process.env.PRIVATE_KEY.substring(0, 10) + "...");
} else {
  console.log("❌ PRIVATE_KEY not found!");
}