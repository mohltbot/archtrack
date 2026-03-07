import React, { useState, useEffect } from 'react';
import { useWebSocket } from '../contexts/WebSocketContext';
import type { Employee, Project, TimeEntry } from '@archtrack/shared';

export const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const { onlineEmployees, recentActivity } = useWebSocket();

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      const [statsRes, employeesRes, projectsRes] = await Promise.all([
        fetch('/api/dashboard/stats'),
        fetch('/api/employees'),
        fetch('/api/projects')
      ]);

      const statsData = await statsRes.json();
      const employeesData = await employeesRes.json();
      const projectsData = await projectsRes.json();

      if (statsData.success) setStats(statsData.data);
      if (employeesData.success) setEmployees(employeesData.data);
      if (projectsData.success) setProjects(projectsData.data);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div style={styles.loading}>Loading...</div>;
  }

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.title}>Dashboard</h1>
        <p style={styles.subtitle}>Real-time overview of your team</p>
      </header>

      <div style={styles.grid}>
        {/* Stats Cards */}
        <div style={styles.statsGrid}>
          <StatCard 
            title="Total Employees" 
            value={stats?.totalEmployees || 0} 
            icon="👥" 
            color="#3498db"
          />
          <StatCard 
            title="Active Projects" 
            value={stats?.activeProjects || 0} 
            icon="📁" 
            color="#27ae60"
          />
          <StatCard 
            title="Hours Today" 
            value={stats?.totalHoursToday || 0} 
            icon="⏱️" 
            color="#e74c3c"
          />
          <StatCard 
            title="Hours This Week" 
            value={stats?.totalHoursThisWeek || 0} 
            icon="📅" 
            color="#f39c12"
          />
        </div>

        {/* Online Employees */}
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>🔴 Live Activity</h2>
          <div style={styles.onlineList}>
            {employees.map(emp => {
              const online = onlineEmployees.has(emp.id);
              const info = onlineEmployees.get(emp.id);
              return (
                <div key={emp.id} style={styles.employeeCard(online)}>
                  <div style={styles.employeeHeader}>
                    <span style={styles.statusIndicator(online)} />
                    <span style={styles.employeeName}>{emp.name}</span>
                    {online && <span style={styles.onlineBadge}>ONLINE</span>}
                  </div>
                  {online && info?.currentTask && (
                    <div style={styles.currentTask}>Working on: {info.currentTask}</div>
                  )}
                  <div style={styles.employeeMeta}>
                    {emp.department} • ${emp.hourlyRate}/hr
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Activity */}
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>📡 Recent Activity</h2>
          <div style={styles.activityList}>
            {recentActivity.length === 0 ? (
              <p style={styles.emptyText}>No recent activity. Start the desktop app to see live updates!</p>
            ) : (
              recentActivity.slice(0, 20).map((activity, idx) => (
                <div key={idx} style={styles.activityItem}>
                  <span style={styles.activityType(activity.type)}>
                    {activity.type === 'online' && '🟢'}
                    {activity.type === 'offline' && '🔴'}
                    {activity.type === 'tracking' && '⏱️'}
                    {activity.type === 'stopped' && '⏹️'}
                    {activity.type === 'sync' && '📤'}
                  </span>
                  <span style={styles.activityText}>
                    <strong>{activity.employeeName}</strong> {activity.message}
                  </span>
                  <span style={styles.activityTime}>
                    {new Date(activity.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Time Entries */}
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>🕐 Recent Time Entries</h2>
          <div style={styles.entriesList}>
            {stats?.recentTimeEntries?.length === 0 ? (
              <p style={styles.emptyText}>No time entries yet</p>
            ) : (
              stats?.recentTimeEntries?.slice(0, 10).map((entry: TimeEntry) => (
                <div key={entry.id} style={styles.entryItem}>
                  <div>
                    <div style={styles.entryDescription}>
                      {entry.description || 'Untitled'}
                    </div>
                    <div style={styles.entryMeta}>
                      {new Date(entry.startTime).toLocaleString()}
                    </div>
                  </div>
                  <div style={styles.entryDuration}>
                    {entry.duration > 0 
                      ? `${Math.round(entry.duration / 60)} min` 
                      : 'In progress...'}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

interface StatCardProps {
  title: string;
  value: number;
  icon: string;
  color: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color }) => (
  <div style={{ ...styles.statCard, borderLeftColor: color }}>
    <div style={styles.statIcon(color)}>{icon}</div>
    <div>
      <div style={styles.statValue}>{value}</div>
      <div style={styles.statTitle}>{title}</div>
    </div>
  </div>
);

const styles: { [key: string]: React.CSSProperties | any } = {
  container: {
    padding: '32px'
  },
  loading: {
    padding: '40px',
    textAlign: 'center',
    color: '#666'
  },
  header: {
    marginBottom: '32px'
  },
  title: {
    fontSize: '32px',
    fontWeight: 600,
    color: '#2c3e50',
    margin: 0
  },
  subtitle: {
    fontSize: '16px',
    color: '#7f8c8d',
    marginTop: '4px'
  },
  grid: {
    display: 'grid',
    gap: '24px'
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '16px'
  },
  statCard: {
    backgroundColor: '#fff',
    padding: '24px',
    borderRadius: '12px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    borderLeft: '4px solid'
  },
  statIcon: (color: string) => ({
    fontSize: '32px',
    backgroundColor: `${color}20`,
    padding: '12px',
    borderRadius: '12px'
  }),
  statValue: {
    fontSize: '28px',
    fontWeight: 700,
    color: '#2c3e50'
  },
  statTitle: {
    fontSize: '14px',
    color: '#7f8c8d'
  },
  section: {
    backgroundColor: '#fff',
    padding: '24px',
    borderRadius: '12px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
  },
  sectionTitle: {
    fontSize: '18px',
    fontWeight: 600,
    marginBottom: '16px',
    color: '#2c3e50'
  },
  onlineList: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '12px'
  },
  employeeCard: (online: boolean) => ({
    padding: '16px',
    borderRadius: '8px',
    backgroundColor: online ? '#f0fff4' : '#f8f9fa',
    border: `1px solid ${online ? '#27ae60' : '#e0e0e0'}`,
    transition: 'all 0.2s'
  }),
  employeeHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '4px'
  },
  statusIndicator: (online: boolean) => ({
    width: '10px',
    height: '10px',
    borderRadius: '50%',
    backgroundColor: online ? '#27ae60' : '#95a5a6'
  }),
  employeeName: {
    fontWeight: 600,
    fontSize: '16px',
    color: '#2c3e50'
  },
  onlineBadge: {
    fontSize: '10px',
    fontWeight: 700,
    color: '#27ae60',
    backgroundColor: '#d4edda',
    padding: '2px 6px',
    borderRadius: '4px',
    marginLeft: 'auto'
  },
  currentTask: {
    fontSize: '13px',
    color: '#27ae60',
    marginTop: '4px',
    fontWeight: 500
  },
  employeeMeta: {
    fontSize: '12px',
    color: '#7f8c8d',
    marginTop: '4px'
  },
  activityList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  activityItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px',
    backgroundColor: '#f8f9fa',
    borderRadius: '8px'
  },
  activityType: (type: string) => ({
    fontSize: '16px'
  }),
  activityText: {
    flex: 1,
    fontSize: '14px',
    color: '#2c3e50'
  },
  activityTime: {
    fontSize: '12px',
    color: '#95a5a6'
  },
  entriesList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  entryItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px',
    backgroundColor: '#f8f9fa',
    borderRadius: '8px'
  },
  entryDescription: {
    fontSize: '14px',
    fontWeight: 500,
    color: '#2c3e50'
  },
  entryMeta: {
    fontSize: '12px',
    color: '#7f8c8d',
    marginTop: '2px'
  },
  entryDuration: {
    fontSize: '14px',
    fontWeight: 600,
    color: '#27ae60'
  },
  emptyText: {
    color: '#95a5a6',
    textAlign: 'center',
    padding: '20px'
  }
};