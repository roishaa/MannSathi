/**
 * ⚠️ DEPRECATED: This file is no longer used.
 * 
 * All API requests should use:
 *   import api from "../../utils/api"
 * 
 * NOT this file. This has been kept for reference only.
 * 
 * ❌ OLD (localhost:8000 - WRONG):
 *    const api = axios.create({ baseURL: "http://localhost:8000/api" });
 * 
 * ✅ NEW (127.0.0.1:8000 - CORRECT):
 *    import api from "../../utils/api"; // baseURL: "http://127.0.0.1:8000/api"
 */

// Re-export from correct location for backward compatibility
export { default as api } from "../utils/api";
export { default } from "../utils/api";

