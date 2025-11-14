import React, { useState, useEffect } from 'react';
import { authService } from './services/auth.service';
import { userService, User } from './services/user.service';
import AssistantUI from './components/AssistantUI';
import { LogoIcon } from './components/icons';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [email, setEmail] = useState<string>('demo@example.com');
  const [password, setPassword] = useState<string>('Password123!');
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState<boolean>(true);

  // Check if user is already logged in
  useEffect(() => {
    const checkAuth = async () => {
      try {
        authService.loadTokens();
        const accessToken = localStorage.getItem('accessToken');

        if (accessToken) {
          const profile = await userService.getProfile();
          setUser(profile);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        authService.logout();
      } finally {
        setIsCheckingAuth(false);
      }
    };

    checkAuth();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await authService.login({ email, password });
      setUser(response.user);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Login failed. Please check your credentials.';
      setError(errorMessage);
      console.error('Login error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    await authService.logout();
    setUser(null);
  };

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-stone-950 text-white flex items-center justify-center">
        <div className="flex flex-col items-center">
          <LogoIcon className="w-16 h-16 text-cyan-400 mb-4 animate-pulse" />
          <p className="text-stone-400">Loading...</p>
        </div>
      </div>
    );
  }

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
              <label htmlFor="email" className="block text-sm font-medium text-stone-300 mb-2">
                Email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 bg-stone-800 border border-stone-700 rounded-lg text-stone-100 focus:ring-2 focus:ring-cyan-500 focus:outline-none transition"
                placeholder="demo@example.com"
                required
              />
            </div>
            <div className="mb-4">
              <label htmlFor="password" className="block text-sm font-medium text-stone-300 mb-2">
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 bg-stone-800 border border-stone-700 rounded-lg text-stone-100 focus:ring-2 focus:ring-cyan-500 focus:outline-none transition"
                placeholder="Enter your password"
                required
              />
            </div>
            {error && (
              <div className="mb-4 p-3 bg-red-900/30 border border-red-500/50 rounded-lg">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}
            <button
              type="submit"
              disabled={isLoading || !email || !password}
              className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2 px-4 rounded-lg disabled:bg-stone-700 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>
          <div className="mt-6 p-4 bg-stone-800/50 rounded-lg border border-stone-700">
            <p className="text-xs text-stone-400 mb-2">Demo credentials:</p>
            <p className="text-sm text-stone-300">
              <strong>Email:</strong> demo@example.com
            </p>
            <p className="text-sm text-stone-300">
              <strong>Password:</strong> Password123!
            </p>
            <p className="text-sm text-stone-300 mt-2">
              <strong>PIN:</strong> 1234 (for secure transactions)
            </p>
          </div>
        </div>
      </div>
    );
  }

  return <AssistantUI user={user} onLogout={handleLogout} />;
};

export default App;
