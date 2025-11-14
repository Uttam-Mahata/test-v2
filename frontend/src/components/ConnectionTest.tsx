import React, { useState } from 'react';
import axios from 'axios';

const ConnectionTest: React.FC = () => {
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const testConnection = async () => {
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await axios.post('http://localhost:3000/api/v1/auth/login', {
        email: 'demo@example.com',
        password: 'Password123!'
      });

      console.log('Raw response:', response);
      setResult(response.data);
    } catch (err: any) {
      console.error('Connection error:', err);
      setError(err.message || 'Connection failed');
      if (err.response) {
        console.error('Error response:', err.response);
        setResult(err.response.data);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-950 text-white p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Backend Connection Test</h1>

        <button
          onClick={testConnection}
          disabled={loading}
          className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 rounded text-white disabled:bg-gray-500"
        >
          {loading ? 'Testing...' : 'Test Login API'}
        </button>

        {error && (
          <div className="mt-4 p-4 bg-red-900/30 border border-red-500 rounded">
            <h2 className="font-bold">Error:</h2>
            <p>{error}</p>
          </div>
        )}

        {result && (
          <div className="mt-4 p-4 bg-stone-800 rounded">
            <h2 className="font-bold mb-2">Response:</h2>
            <pre className="text-xs overflow-auto">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}

        <div className="mt-8 p-4 bg-stone-800 rounded">
          <h2 className="font-bold mb-2">Instructions:</h2>
          <ol className="list-decimal list-inside space-y-1 text-sm">
            <li>Make sure backend is running on http://localhost:3000</li>
            <li>Click "Test Login API" button</li>
            <li>Check browser console for detailed logs</li>
            <li>Verify response structure matches expected format</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default ConnectionTest;
