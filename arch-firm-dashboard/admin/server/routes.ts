import { Express } from 'express';
import { v4 as uuidv4 } from 'uuid';
import {
  getAllEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  getAllProjects,
  getProjectById,
  createProject,
  updateProject,
  getAllTasks,
  getTasksByProject,
  createTask,
  updateTask,
  getAllTimeEntries,
  getTimeEntriesByEmployee,
  createTimeEntry,
  updateTimeEntry,
  getActiveTimeEntries,
  getDashboardStats
} from './database';

export function setupRoutes(app: Express): void {
  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Dashboard
  app.get('/api/dashboard/stats', async (req, res) => {
    try {
      const stats = await getDashboardStats();
      res.json({ success: true, data: stats });
    } catch (error) {
      res.status(500).json({ success: false, error: String(error) });
    }
  });

  // Employees
  app.get('/api/employees', async (req, res) => {
    try {
      const employees = await getAllEmployees();
      res.json({ success: true, data: employees });
    } catch (error) {
      res.status(500).json({ success: false, error: String(error) });
    }
  });

  app.get('/api/employees/:id', async (req, res) => {
    try {
      const employee = await getEmployeeById(req.params.id);
      if (!employee) {
        return res.status(404).json({ success: false, error: 'Employee not found' });
      }
      res.json({ success: true, data: employee });
    } catch (error) {
      res.status(500).json({ success: false, error: String(error) });
    }
  });

  app.post('/api/employees', async (req, res) => {
    try {
      const now = new Date().toISOString();
      const employee = {
        id: uuidv4(),
        ...req.body,
        role: req.body.role || 'employee',
        createdAt: now,
        updatedAt: now
      };
      await createEmployee(employee);
      res.json({ success: true, data: employee });
    } catch (error) {
      res.status(500).json({ success: false, error: String(error) });
    }
  });

  app.put('/api/employees/:id', async (req, res) => {
    try {
      await updateEmployee(req.params.id, req.body);
      const employee = await getEmployeeById(req.params.id);
      res.json({ success: true, data: employee });
    } catch (error) {
      res.status(500).json({ success: false, error: String(error) });
    }
  });

  app.delete('/api/employees/:id', async (req, res) => {
    try {
      await deleteEmployee(req.params.id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ success: false, error: String(error) });
    }
  });

  // Projects
  app.get('/api/projects', async (req, res) => {
    try {
      const projects = await getAllProjects();
      res.json({ success: true, data: projects });
    } catch (error) {
      res.status(500).json({ success: false, error: String(error) });
    }
  });

  app.get('/api/projects/:id', async (req, res) => {
    try {
      const project = await getProjectById(req.params.id);
      if (!project) {
        return res.status(404).json({ success: false, error: 'Project not found' });
      }
      res.json({ success: true, data: project });
    } catch (error) {
      res.status(500).json({ success: false, error: String(error) });
    }
  });

  app.post('/api/projects', async (req, res) => {
    try {
      const now = new Date().toISOString();
      const project = {
        id: uuidv4(),
        ...req.body,
        status: req.body.status || 'active',
        startDate: req.body.startDate || now,
        createdAt: now,
        updatedAt: now
      };
      await createProject(project);
      res.json({ success: true, data: project });
    } catch (error) {
      res.status(500).json({ success: false, error: String(error) });
    }
  });

  app.put('/api/projects/:id', async (req, res) => {
    try {
      await updateProject(req.params.id, req.body);
      const project = await getProjectById(req.params.id);
      res.json({ success: true, data: project });
    } catch (error) {
      res.status(500).json({ success: false, error: String(error) });
    }
  });

  // Tasks
  app.get('/api/tasks', async (req, res) => {
    try {
      let tasks;
      if (req.query.projectId) {
        tasks = await getTasksByProject(req.query.projectId as string);
      } else {
        tasks = await getAllTasks();
      }
      res.json({ success: true, data: tasks });
    } catch (error) {
      res.status(500).json({ success: false, error: String(error) });
    }
  });

  app.post('/api/tasks', async (req, res) => {
    try {
      const now = new Date().toISOString();
      const task = {
        id: uuidv4(),
        ...req.body,
        status: req.body.status || 'todo',
        priority: req.body.priority || 'medium',
        createdAt: now,
        updatedAt: now
      };
      await createTask(task);
      res.json({ success: true, data: task });
    } catch (error) {
      res.status(500).json({ success: false, error: String(error) });
    }
  });

  app.put('/api/tasks/:id', async (req, res) => {
    try {
      await updateTask(req.params.id, req.body);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ success: false, error: String(error) });
    }
  });

  // Time Entries
  app.get('/api/time-entries', async (req, res) => {
    try {
      let entries;
      if (req.query.employeeId) {
        entries = await getTimeEntriesByEmployee(
          req.query.employeeId as string,
          req.query.startDate as string,
          req.query.endDate as string
        );
      } else {
        entries = await getAllTimeEntries(
          req.query.startDate as string,
          req.query.endDate as string
        );
      }
      res.json({ success: true, data: entries });
    } catch (error) {
      res.status(500).json({ success: false, error: String(error) });
    }
  });

  app.get('/api/time-entries/active', async (req, res) => {
    try {
      const entries = await getActiveTimeEntries();
      res.json({ success: true, data: entries });
    } catch (error) {
      res.status(500).json({ success: false, error: String(error) });
    }
  });

  app.post('/api/time-entries', async (req, res) => {
    try {
      const now = new Date().toISOString();
      const entry = {
        id: uuidv4(),
        ...req.body,
        createdAt: now,
        updatedAt: now
      };
      await createTimeEntry(entry);
      res.json({ success: true, data: entry });
    } catch (error) {
      res.status(500).json({ success: false, error: String(error) });
    }
  });

  app.put('/api/time-entries/:id', async (req, res) => {
    try {
      await updateTimeEntry(req.params.id, req.body);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ success: false, error: String(error) });
    }
  });

  // Reports
  app.get('/api/reports/summary', async (req, res) => {
    try {
      const { employeeId, projectId, startDate, endDate } = req.query;
      
      let entries;
      if (employeeId) {
        entries = await getTimeEntriesByEmployee(employeeId as string, startDate as string, endDate as string);
      } else {
        entries = await getAllTimeEntries(startDate as string, endDate as string);
      }

      if (projectId) {
        entries = entries.filter(e => e.projectId === projectId);
      }

      const totalSeconds = entries.reduce((sum, e) => sum + (e.duration || 0), 0);
      const billableSeconds = entries.filter(e => e.isBillable).reduce((sum, e) => sum + (e.duration || 0), 0);

      res.json({
        success: true,
        data: {
          entries,
          totalHours: Math.round(totalSeconds / 3600 * 10) / 10,
          billableHours: Math.round(billableSeconds / 3600 * 10) / 10,
          entryCount: entries.length
        }
      });
    } catch (error) {
      res.status(500).json({ success: false, error: String(error) });
    }
  });
}