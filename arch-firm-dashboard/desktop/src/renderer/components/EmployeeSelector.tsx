import React, { useState, useEffect } from 'react';
import type { Employee } from '@archtrack/shared';

interface EmployeeSelectorProps {
  onSelect: (employee: Employee) => void;
  onCancel: () => void;
  currentEmployeeId?: string;
}

export const EmployeeSelector: React.FC<EmployeeSelectorProps> = ({ 
  onSelect, 
  onCancel,
  currentEmployeeId 
}) => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');

  useEffect(() => {
    loadEmployees();
  }, []);

  const loadEmployees = async () => {
    try {
      const result = await window.electronAPI.getEmployees();
      if (result.success) {
        setEmployees(result.data);
      }
    } catch (error) {
      console.error('Error loading employees:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSwitch = async (employeeId: string) => {
    try {
      const result = await window.electronAPI.switchEmployee(employeeId);
      if (result.success) {
        onSelect(result.data);
      }
    } catch (error) {
      console.error('Error switching employee:', error);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newEmail.trim()) return;
    
    try {
      const result = await window.electronAPI.createEmployee({
        name: newName.trim(),
        email: newEmail.trim()
      });
      
      if (result.success) {
        onSelect(result.data);
      }
    } catch (error) {
      console.error('Error creating employee:', error);
    }
  };

  if (showCreateForm) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <h2 style={styles.title}>Create New Profile</h2>
          <form onSubmit={handleCreate} style={styles.form}>
            <input
              type="text"
              placeholder="Full Name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              style={styles.input}
            />
            <input
              type="email"
              placeholder="Email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              style={styles.input}
            />
            <div style={styles.buttonRow}>
              <button type="button" onClick={() => setShowCreateForm(false)} style={styles.secondaryButton}>
                Back
              </button>
              <button type="submit" style={styles.primaryButton}>
                Create
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <h2 style={styles.title}>Switch Profile</h2>
          <button onClick={onCancel} style={styles.closeButton}>✕</button>
        </div>
        
        {isLoading ? (
          <div style={styles.loading}>Loading...</div>
        ) : (
          <>
            <div style={styles.list}>
              {employees.map((employee) => (
                <button
                  key={employee.id}
                  onClick={() => handleSwitch(employee.id)}
                  style={{
                    ...styles.employeeButton,
                    ...(employee.id === currentEmployeeId ? styles.activeEmployee : {})
                  }}
                >
                  <div style={styles.employeeName}>{employee.name}</div>
                  <div style={styles.employeeEmail}>{employee.email}</div>
                  {employee.id === currentEmployeeId && (
                    <span style={styles.currentBadge}>Current</span>
                  )}
                </button>
              ))}
            </div>
            
            <div style={styles.divider} />
            
            <button 
              onClick={() => setShowCreateForm(true)}
              style={styles.createButton}
            >
              + Create New Profile
            </button>
          </>
        )}
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
    maxWidth: '400px',
    padding: '24px'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px'
  },
  title: {
    fontSize: '20px',
    fontWeight: 600,
    margin: 0,
    color: '#2c3e50'
  },
  closeButton: {
    background: 'none',
    border: 'none',
    fontSize: '20px',
    cursor: 'pointer',
    color: '#95a5a6'
  },
  loading: {
    textAlign: 'center',
    padding: '40px',
    color: '#7f8c8d'
  },
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  employeeButton: {
    padding: '16px',
    border: '1px solid #e0e0e0',
    borderRadius: '8px',
    backgroundColor: '#fff',
    cursor: 'pointer',
    textAlign: 'left',
    position: 'relative',
    transition: 'all 0.2s'
  },
  activeEmployee: {
    borderColor: '#27ae60',
    backgroundColor: '#f0fff4'
  },
  employeeName: {
    fontSize: '16px',
    fontWeight: 500,
    color: '#2c3e50'
  },
  employeeEmail: {
    fontSize: '13px',
    color: '#7f8c8d',
    marginTop: '4px'
  },
  currentBadge: {
    position: 'absolute',
    top: '12px',
    right: '12px',
    padding: '2px 8px',
    backgroundColor: '#27ae60',
    color: '#fff',
    borderRadius: '12px',
    fontSize: '11px',
    fontWeight: 500
  },
  divider: {
    height: '1px',
    backgroundColor: '#e0e0e0',
    margin: '16px 0'
  },
  createButton: {
    width: '100%',
    padding: '12px',
    backgroundColor: 'transparent',
    border: '2px dashed #bdc3c7',
    borderRadius: '8px',
    color: '#7f8c8d',
    cursor: 'pointer',
    fontSize: '14px',
    transition: 'all 0.2s'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  input: {
    padding: '12px',
    fontSize: '16px',
    border: '1px solid #ddd',
    borderRadius: '8px'
  },
  buttonRow: {
    display: 'flex',
    gap: '12px',
    marginTop: '8px'
  },
  secondaryButton: {
    flex: 1,
    padding: '12px',
    backgroundColor: '#ecf0f1',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px'
  },
  primaryButton: {
    flex: 1,
    padding: '12px',
    backgroundColor: '#27ae60',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 500
  }
};