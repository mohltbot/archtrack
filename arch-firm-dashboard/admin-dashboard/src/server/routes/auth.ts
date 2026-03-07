import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { Employee, RefreshToken } from '../database';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_EXPIRES_IN = '24h';
const REFRESH_TOKEN_EXPIRES_IN = 7 * 24 * 60 * 60 * 1000; // 7 days

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Use raw query to bypass TypeScript class field shadowing
    const employee = await Employee.findOne({ 
      where: { email },
      raw: true
    });
    
    if (!employee) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Access password from raw data
    const hashedPassword = (employee as any).password;
    
    if (!hashedPassword) {
      console.error('Password not found for employee:', email);
      return res.status(500).json({ error: 'Server configuration error - password not found' });
    }

    const isValidPassword = await bcrypt.compare(password, hashedPassword);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    if (!employee.isActive) {
      return res.status(401).json({ error: 'Account is deactivated' });
    }

    // Generate tokens
    const accessToken = jwt.sign(
      { employeeId: employee.id, role: employee.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    const refreshToken = uuidv4();
    await RefreshToken.create({
      token: refreshToken,
      employeeId: employee.id,
      expiresAt: new Date(Date.now() + REFRESH_TOKEN_EXPIRES_IN),
    });

    res.json({
      accessToken,
      refreshToken,
      employee: {
        id: employee.id,
        name: employee.name,
        email: employee.email,
        role: employee.role,
        department: employee.department,
        avatar: employee.avatar,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Refresh token
router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ error: 'Refresh token is required' });
    }

    const tokenRecord = await RefreshToken.findOne({ where: { token: refreshToken } });
    if (!tokenRecord || tokenRecord.expiresAt < new Date()) {
      return res.status(401).json({ error: 'Invalid or expired refresh token' });
    }

    const employee = await Employee.findByPk(tokenRecord.employeeId);
    if (!employee || !employee.isActive) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    // Generate new access token
    const accessToken = jwt.sign(
      { employeeId: employee.id, role: employee.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    res.json({ accessToken });
  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Logout
router.post('/logout', async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (refreshToken) {
      await RefreshToken.destroy({ where: { token: refreshToken } });
    }

    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get current user
router.get('/me', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, JWT_SECRET) as any;

    const employee = await Employee.findByPk(decoded.employeeId, {
      attributes: { exclude: ['password'] },
    });

    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    res.json(employee);
  } catch (error) {
    console.error('Get me error:', error);
    res.status(401).json({ error: 'Invalid token' });
  }
});

export { router as authRouter };
