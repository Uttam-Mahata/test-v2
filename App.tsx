
import React, { useState } from 'react';
import { User } from './types';
import { bankingApi } from './services/mockBankingApi';
import AssistantUI from './components/AssistantUI';
import { LogoIcon } from './components/icons';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [userId, setUserId] = useState<string>('user123');
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    const authenticatedUser = await bankingApi.authenticate(userId);
    if (authenticatedUser) {
      setUser(authenticatedUser);
    } else {
      setError('Invalid User ID. Please try again.');
    }
    setIsLoading(false);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-stone-950 text-white flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md bg-stone-900 rounded-2xl shadow-2xl p-8 border border-stone-800">
          <div className="flex flex-col items-center mb-6">
            <LogoIcon className="w-16 h-16 text-cyan-400 mb-4" />
            <h1 className="text-3xl font-bold text-stone-100">AI Financial Assistant</h1>
            <p className="text-stone-400 mt-2">Sign in to access your accounts.</p>
          </div>
          <form onSubmit={handleLogin}>
            <div className="mb-4">
              <label htmlFor="userId" className="block text-sm font-medium text-stone-300 mb-2">
                User ID
              </label>
              <input
                type="text"
                id="userId"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                className="w-full px-4 py-2 bg-stone-800 border border-stone-700 rounded-lg text-stone-100 focus:ring-2 focus:ring-cyan-500 focus:outline-none transition"
                placeholder="e.g., user123"
              />
            </div>
            {error && <p className="text-red-400 text-sm mb-4">{error}</p>}
            <button
              type="submit"
              disabled={isLoading || !userId}
              className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2 px-4 rounded-lg disabled:bg-stone-700 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center"
            >
              {isLoading ? (
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                'Sign In'
              )}
            </button>
          </form>
           <p className="text-xs text-stone-500 mt-6 text-center">For demonstration purposes, use User ID: <strong>user123</strong></p>
        </div>
      </div>
    );
  }

  return <AssistantUI user={user} onLogout={() => setUser(null)} />;
};

export default App;
