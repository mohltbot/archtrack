import React, { useState, useEffect } from 'react';
import { Dashboard } from './pages/Dashboard';
import { Employees } from './pages/Employees';
import { Projects } from './pages/Projects';
import { Tasks } from './pages/Tasks';
import { Reports } from './pages/Reports';
import { WebSocketProvider } from './contexts/WebSocketContext';

type Page = 'dashboard' | 'employees' | 'projects' | 'tasks' | 'reports';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Check API health
    fetch('/api/health')
      .then(() => setIsConnected(true))
      .catch(() => setIsConnected(false));
  }, []);

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'employees':
        return <Employees />;
      case 'projects':
        return <Projects />;
      case 'tasks':
        return <Tasks />;
      case 'reports':
        return <Reports />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <WebSocketProvider>
      <div style={styles.container}>
        <aside style={styles.sidebar}>
          <div style={styles.logo}>
            <h1 style={styles.logoText}>ArchTrack</h1>
            <span style={styles.logoSubtext}>Admin</span>
          </div>
          
          <nav style={styles.nav}>
            <NavItem 
              label="Dashboard" 
              icon="📊" 
              active={currentPage === 'dashboard'}
              onClick={() => setCurrentPage('dashboard')}
            />
            <NavItem 
              label="Employees" 
              icon="👥" 
              active={currentPage === 'employees'}
              onClick={() => setCurrentPage('employees')}
            />
            <NavItem 
              label="Projects" 
              icon="📁" 
              active={currentPage === 'projects'}
              onClick={() => setCurrentPage('projects')}
            />
            <NavItem 
              label="Tasks" 
              icon="✓" 
              active={currentPage === 'tasks'}
              onClick={() => setCurrentPage('tasks')}
            />
            <NavItem 
              label="Reports" 
              icon="📈" 
              active={currentPage === 'reports'}
              onClick={() => setCurrentPage('reports')}
            />
          </nav>
          
          <div style={styles.connectionStatus}>
            <span style={styles.statusDot(isConnected)} />
            {isConnected ? 'Connected' : 'Disconnected'}
          </div>
        </aside>
        
        <main style={styles.main}>
          {renderPage()}
        </main>
      </div>
    </WebSocketProvider>
  );
};

interface NavItemProps {
  label: string;
  icon: string;
  active: boolean;
  onClick: () => void;
}

const NavItem: React.FC<NavItemProps> = ({ label, icon, active, onClick }) => (
  <button
    onClick={onClick}
    style={{
      ...styles.navItem,
      ...(active ? styles.navItemActive : {})
    }}
  >
    <span style={styles.navIcon}>{icon}</span>
    <span>{label}</span>
  </button>
);

const styles: { [key: string]: React.CSSProperties | any } = {
  container: {
    display: 'flex',
    height: '100vh'
  },
  sidebar: {
    width: '240px',
    backgroundColor: '#2c3e50',
    color: '#fff',
    display: 'flex',
    flexDirection: 'column'
  },
  logo: {
    padding: '24px',
    borderBottom: '1px solid rgba(255,255,255,0.1)'
  },
  logoText: {
    fontSize: '24px',
    fontWeight: 600,
    margin: 0
  },
  logoSubtext: {
    fontSize: '12px',
    color: '#95a5a6',
    textTransform: 'uppercase',
    letterSpacing: '1px'
  },
  nav: {
    flex: 1,
    padding: '16px 0'
  },
  navItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    width: '100%',
    padding: '12px 24px',
    background: 'none',
    border: 'none',
    color: '#bdc3c7',
    fontSize: '15px',
    cursor: 'pointer',
    textAlign: 'left',
    transition: 'all 0.2s'
  },
  navItemActive: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    color: '#fff',
    borderLeft: '3px solid #3498db'
  },
  navIcon: {
    fontSize: '18px'
  },
  connectionStatus: {
    padding: '16px 24px',
    borderTop: '1px solid rgba(255,255,255,0.1)',
    fontSize: '13px',
    color: '#95a5a6',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  statusDot: (isConnected: boolean) => ({
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    backgroundColor: isConnected ? '#27ae60' : '#e74c3c'
  }),
  main: {
    flex: 1,
    overflow: 'auto',
    backgroundColor: '#f5f5f5'
  }
};

export default App;