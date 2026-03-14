import { useState, useEffect } from "react";
import api from "../utils/api";

export default function TestAuth() {
  const [status, setStatus] = useState("checking...");
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      const storedToken = localStorage.getItem("auth_token");
      const storedUser = localStorage.getItem("user");
      
      setToken(storedToken);
      setUser(storedUser);

      if (!storedToken) {
        setStatus("❌ No token found - You need to log in");
        return;
      }

      try {
        // Test with backend endpoint
        const res = await api.get("/test-auth");
        setStatus("✅ Authenticated! " + JSON.stringify(res.data));
      } catch (e) {
        console.error("Auth check failed:", e);
        if (e?.response?.status === 401) {
          setStatus("❌ Token invalid or expired - Server says: " + (e.response?.data?.message || "Unauthenticated"));
        } else {
          setStatus("❌ Error: " + (e.response?.data?.message || e.message));
        }
      }
    };

    checkAuth();
  }, []);

  const handleClearAuth = () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user");
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold mb-4">Authentication Test</h1>
        
        <div className="space-y-4">
          <div>
            <h2 className="font-semibold">Status:</h2>
            <p className="text-lg">{status}</p>
          </div>

          <div>
            <h2 className="font-semibold">Token:</h2>
            <p className="text-xs break-all bg-gray-100 p-2 rounded">
              {token || "No token"}
            </p>
          </div>

          <div>
            <h2 className="font-semibold">User Data:</h2>
            <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto">
              {user || "No user data"}
            </pre>
          </div>

          <div className="flex gap-4">
            <button
              onClick={handleClearAuth}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Clear Auth & Reload
            </button>
            
            <a
              href="/login"
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 inline-block"
            >
              Go to Login
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
