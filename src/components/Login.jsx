import React, { useState } from 'react';

function Login({ onLogin }) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const API_BASE_URL = 'http://localhost:5000';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const endpoint = isSignUp ? '/api/auth/register' : '/api/auth/login';
    
    try {
      console.log('📤 Sending to:', `${API_BASE_URL}${endpoint}`);
      
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email, 
          password,
          name: name || undefined
        }),
      });

      console.log('📥 Status:', response.status);

      // Check if response is JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('❌ Received non-JSON response:', text);
        throw new Error('Server returned an error. Please check if backend is running.');
      }

      const data = await response.json();
      console.log('📦 Response:', data);

      if (!response.ok) {
        throw new Error(data.error || data.details || 'Authentication failed');
      }

      // Store token in localStorage
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      // Call the parent's onLogin callback
      onLogin(data.user);

    } catch (error) {
      console.error('❌ Login error:', error);
      setError(error.message || 'Failed to connect to server. Please make sure the backend is running on port 5000.');
    } finally {
      setIsLoading(false);
    }
  };

  const switchMode = () => {
    setIsSignUp(!isSignUp);
    setError('');
    setEmail('');
    setPassword('');
    setName('');
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Insurance Claims Portal</h2>
        <p style={styles.subtitle}>
          {isSignUp ? 'Create your account' : 'Sign in to your account'}
        </p>

        {error && <div style={styles.errorMessage}>{error}</div>}

        <form onSubmit={handleSubmit}>
          {isSignUp && (
            <div style={styles.inputGroup}>
              <label>Full Name (Optional)</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={styles.input}
                placeholder="Your full name"
              />
            </div>
          )}

          <div style={styles.inputGroup}>
            <label>Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={styles.input}
              placeholder="your@email.com"
              required
            />
          </div>

          <div style={styles.inputGroup}>
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={styles.input}
              placeholder={isSignUp ? 'Minimum 8 characters' : '••••••••'}
              required
              minLength={8}
            />
            {isSignUp && (
              <p style={styles.hint}>Password must be at least 8 characters</p>
            )}
          </div>

          <button 
            type="submit" 
            style={{
              ...styles.button,
              opacity: isLoading ? 0.7 : 1,
              cursor: isLoading ? 'not-allowed' : 'pointer'
            }}
            disabled={isLoading}
          >
            {isLoading ? 'Loading...' : (isSignUp ? 'Create Account' : 'Sign In')}
          </button>
        </form>

        <div style={styles.switchContainer}>
          <p style={styles.switchText}>
            {isSignUp ? 'Already have an account?' : "Don't have an account?"}
            <button 
              onClick={switchMode} 
              style={styles.switchButton}
              type="button"
            >
              {isSignUp ? 'Sign In' : 'Sign Up'}
            </button>
          </p>
        </div>

        {!isSignUp && (
          <p style={styles.demo}>Use any email + password (min 8 chars)</p>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  },
  card: {
    background: 'white',
    padding: '40px',
    borderRadius: '12px',
    boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
    width: '380px',
    maxWidth: '90%',
  },
  title: {
    textAlign: 'center',
    color: '#1a73e8',
    marginBottom: '5px',
    fontSize: '24px',
  },
  subtitle: {
    textAlign: 'center',
    color: '#666',
    marginBottom: '25px',
    fontSize: '14px',
  },
  inputGroup: {
    marginBottom: '18px',
  },
  input: {
    width: '100%',
    padding: '12px',
    border: '1px solid #ddd',
    borderRadius: '6px',
    fontSize: '14px',
    boxSizing: 'border-box',
    marginTop: '5px',
    transition: 'border-color 0.3s',
  },
  button: {
    width: '100%',
    padding: '12px',
    background: '#1a73e8',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontSize: '16px',
    fontWeight: '600',
    transition: 'background 0.3s',
  },
  errorMessage: {
    background: '#fee',
    color: '#d32f2f',
    padding: '10px',
    borderRadius: '6px',
    marginBottom: '15px',
    fontSize: '14px',
    textAlign: 'center',
  },
  switchContainer: {
    marginTop: '20px',
    textAlign: 'center',
    borderTop: '1px solid #eee',
    paddingTop: '20px',
  },
  switchText: {
    color: '#666',
    fontSize: '14px',
  },
  switchButton: {
    background: 'none',
    border: 'none',
    color: '#1a73e8',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '14px',
    marginLeft: '5px',
    padding: '0',
  },
  demo: {
    textAlign: 'center',
    color: '#999',
    fontSize: '12px',
    marginTop: '10px',
  },
  hint: {
    color: '#999',
    fontSize: '12px',
    marginTop: '5px',
    marginBottom: '0',
  },
};

export default Login;