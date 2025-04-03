const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Register a new user
exports.signup = async (req, res) => {
  try {
    const { email, password, name } = req.body;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name: name || '',
      }
    });

    // Remove password from response
    const { password: _, ...userWithoutPassword } = newUser;

    // Generate JWT token
    const token = jwt.sign(
      { userId: newUser.id, email: newUser.email },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      user: userWithoutPassword,
      token
    });
  } catch (error) {
    console.error('Error during signup:', error);
    res.status(500).json({ error: 'Failed to register user' });
  }
};

// Login user
exports.signin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Compare passwords
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    res.status(200).json({
      message: 'Login successful',
      user: userWithoutPassword,
      token
    });
  } catch (error) {
    console.error('Error during signin:', error);
    res.status(500).json({ error: 'Failed to login' });
  }
};

// Get current user
exports.getCurrentUser = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Remove password from response
    const { password, ...userWithoutPassword } = user;

    res.status(200).json(userWithoutPassword);
  } catch (error) {
    console.error('Error fetching current user:', error);
    res.status(500).json({ error: 'Failed to fetch user data' });
  }
};