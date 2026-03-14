import { useState } from "react";
import api from "../utils/api";

export default function DebugAuth() {
  const [result, setResult] = useState(null);
  const [token, setToken] = useState("");

  const checkNoAuth = async () => {
    try {
      const { data } = await api.get("/debug/no-auth");
      setResult({ success: true, data });
    } catch (err) {
      setResult({ success: false, error: err.message, response: err.response?.data });
    }
  };

  const checkWithAuth = async () => {
    try {
      const { data } = await api.get("/debug/check-auth");
      setResult({ success: true, data });
    } catch (err) {
      setResult({ success: false, error: err.message, response: err.response?.data });
    }
  }; 

  const checkStoredToken = () => {
    const storedToken = localStorage.getItem("auth_token");
    setToken(storedToken || "NO TOKEN FOUND");
    setResult({ 
      token_exists: !!storedToken,
      token_preview: storedToken ? storedToken.substring(0, 50) + "..." : null,
      token_length: storedToken?.length || 0
    });
  };

  const clearAuth = () => {
    localStorage.clear();
    setToken("");
    setResult({ message: "Auth cleared" });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">🔍 Debug Authentication</h1>

        <div className="bg-white p-6 rounded-lg shadow mb-4">
          <h2 className="text-xl font-semibold mb-4">Actions:</h2>
          <div className="flex flex-wrap gap-3">
            <button onClick={checkStoredToken} className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
              Check Stored Token
            </button>
            <button onClick={checkNoAuth} className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">
              Test Public Endpoint
            </button>
            <button onClick={checkWithAuth} className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600">
              Test Protected Endpoint
            </button>
            <button onClick={clearAuth} className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600">
              Clear Auth
            </button>
          </div>
        </div>

        {result && (
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Result:</h2>
            <pre className="bg-gray-100 p-4 rounded overflow-auto text-sm">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}

        <div className="mt-8 bg-yellow-50 border border-yellow-200 p-4 rounded">
          <h3 className="font-semibold mb-2">Instructions:</h3>
          <ol className="list-decimal list-inside space-y-1 text-sm">
            <li>Click "Clear Auth" to start fresh</li>
            <li>Go to /login and log in with: roishamhrz@gmail.com</li>
            <li>Come back here and click "Check Stored Token"</li>
            <li>Then click "Test Protected Endpoint"</li>
            <li>If it shows authenticated = true, your auth is working!</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
