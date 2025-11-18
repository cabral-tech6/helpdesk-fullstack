import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_troca_isso_depois';

// POST /auth/register
export const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ message: 'Nome, e-mail e senha são obrigatórios.' });
    }

    // Verifica se já existe usuário com esse e-mail
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(409).json({ message: 'E-mail já cadastrado.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        // garante valor válido do enum
        role: role === 'TECHNICIAN' ? 'TECHNICIAN' : 'USER',
      },
    });

    const { password: _, ...userWithoutPassword } = user;

    return res.status(201).json({
      message: 'Usuário criado com sucesso.',
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error('Erro no register:', error);

    // Trata erro de e-mail duplicado
    if (error.code === 'P2002') {
      return res.status(409).json({ message: 'E-mail já cadastrado.' });
    }

    return res.status(500).json({ message: 'Erro interno no servidor.' });
  }
};

// POST /auth/login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: 'E-mail e senha são obrigatórios.' });
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(401).json({ message: 'Credenciais inválidas.' });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({ message: 'Credenciais inválidas.' });
    }

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      JWT_SECRET,
      { expiresIn: '8h' }
    );

    const { password: _, ...userWithoutPassword } = user;

    return res.json({
      message: 'Login realizado com sucesso.',
      token,
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error('Erro no login:', error);
    return res.status(500).json({ message: 'Erro interno no servidor.' });
  }
};
