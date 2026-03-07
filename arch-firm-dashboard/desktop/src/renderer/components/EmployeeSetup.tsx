import React, { useState } from 'react';
import type { Employee } from '@archtrack/shared';

interface EmployeeSetupProps {
  onComplete: (employee: Employee) => void;
}

export const EmployeeSetup: React.FC<EmployeeSetupProps> = ({ onComplete }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!name.trim()) {
      setError('Please enter your name');
      return;
    }
    
    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid email');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const result = await window.electronAPI.createEmployee({
        name: name.trim(),
        email: email.trim()
      });
      
      if (result.success) {
        onComplete(result.data);
      } else {
        setError(result.error || 'Failed to create profile');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <h1 style={styles.title}>Welcome to ArchTrack</h1>
          <p style={styles.subtitle}>Time tracking for architectural firms</p>
        </div>
        
        <div style={styles.content}>
          <h2 style={styles.heading}>Create Your Profile</h2>
          <p style={styles.description}>
            Set up your employee profile to start tracking time.
          </p>
          
          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.field}>
              <label style={styles.label}>Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Mohammed"
                style={styles.input}
                disabled={isLoading}
              />
            </div>
            
            <div style={styles.field}>
              <label style={styles.label}>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g., mohammed@archfirm.com"
                style={styles.input}
                disabled={isLoading}
              />
            </div>
            
            {error && (
              <div style={styles.error}>{error}</div>
            )}
            
            <button
              type="submit"
              style={styles.button}
              disabled={isLoading}
            >
              {isLoading ? 'Creating...' : 'Get Started'}
            </button>
          </form>
        </div>
        
        <div style={styles.footer}>
          <p style={styles.footerText}>
            Your data is stored locally on this machine.
          </p>
        </div>
      </div>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    backgroundColor: '#f0f2f5',
    padding: '20px'
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: '12px',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
    width: '100%',
    maxWidth: '420px',
    overflow: 'hidden'
  },
  header: {
    backgroundColor: '#2c3e50',
    padding: '32px',
    textAlign: 'center'
  },
  title: {
    color: '#fff',
    fontSize: '28px',
    fontWeight: 600,
    margin: '0 0 8px 0'
  },
  subtitle: {
    color: '#bdc3c7',
    fontSize: '14px',
    margin: 0
  },
  content: {
    padding: '32px'
  },
  heading: {
    fontSize: '20px',
    fontWeight: 600,
    margin: '0 0 8px 0',
    color: '#2c3e50'
  },
  description: {
    fontSize: '14px',
    color: '#7f8c8d',
    margin: '0 0 24px 0'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px'
  },
  label: {
    fontSize: '14px',
    fontWeight: 500,
    color: '#34495e'
  },
  input: {
    padding: '12px 16px',
    fontSize: '16px',
    border: '1px solid #ddd',
    borderRadius: '8px',
    outline: 'none',
    transition: 'border-color 0.2s'
  },
  error: {
    padding: '12px',
    backgroundColor: '#fee',
    color: '#c33',
    borderRadius: '6px',
    fontSize: '14px'
  },
  button: {
    padding: '14px 24px',
    fontSize: '16px',
    fontWeight: 600,
    backgroundColor: '#27ae60',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    marginTop: '8px'
  },
  footer: {
    padding: '16px 32px',
    backgroundColor: '#f8f9fa',
    borderTop: '1px solid #e9ecef'
  },
  footerText: {
    fontSize: '12px',
    color: '#95a5a6',
    textAlign: 'center',
    margin: 0
  }
};