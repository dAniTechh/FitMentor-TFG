import express, { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import cors from 'cors';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const app = express();

// --- CONFIGURACIÓN ---
const JWT_SECRET = process.env.JWT_SECRET || 'clave_secreta_tfg_fitmentor'; 
const PORT = 3000;

app.use(cors());
app.use(express.json());

// --- MIDDLEWARE DE AUTENTICACIÓN ---
// Esto sirve para proteger las rutas: solo usuarios logueados pueden ver recetas o rutinas
const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ error: "Acceso denegado. Token no proporcionado." });

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) return res.status(403).json({ error: "Token no válido o expirado." });
    (req as any).user = user;
    next();
  });
};

// --- RUTAS DE USUARIO ---

// Registro de usuario con campos de Fitness
app.post('/register', async (req: Request, res: Response) => {
  const { email, password, name } = req.body;
  
  if (!email || !password) return res.status(400).json({ error: "Email y contraseña obligatorios" });

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const user = await prisma.user.create({
      data: { 
        email, 
        password: hashedPassword, 
        name,
        // Datos iniciales de fitness (Ya no dan error gracias a la migración)
        age: 0, 
        weight: 0, 
        height: 0, 
        goal: 'Mantenimiento' 
      },
    });
    
    res.status(201).json({ message: "Usuario creado con éxito", userId: user.id });
  } catch (error) {
    console.error("Error en registro:", error);
    res.status(400).json({ error: "El email ya existe o hay un problema con los datos." });
  }
});

// Login y generación de Token
app.post('/login', async (req: Request, res: Response) => {
  const { email, password } = req.body;
  
  try {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: "Credenciales inválidas" });
    }

    // Generamos el token que el móvil guardará
    const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    
    res.json({ 
      token, 
      user: { id: user.id, email: user.email, name: user.name } 
    });
  } catch (error) {
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// --- RUTAS DE DATOS (PROTEGIDAS) ---

// Obtener todas las rutinas con sus ejercicios
app.get('/routines', authenticateToken, async (req: Request, res: Response) => {
  try {
    const routines = await prisma.routine.findMany({
      include: { 
        exercises: { 
          include: { exercise: true } 
        } 
      },
    });
    res.json(routines);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener rutinas" });
  }
});

// Obtener recetas con sus ingredientes (Filtrado por ingrediente opcional)
app.get('/recipes', authenticateToken, async (req: Request, res: Response) => {
  const { ingredient } = req.query;
  
  try {
    const recipes = await prisma.recipe.findMany({
      where: ingredient ? {
        ingredients: { some: { name: { contains: String(ingredient) } } }
      } : {},
      include: { ingredients: true }, // VITAL para el Modal de la App
    });
    res.json(recipes);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener recetas" });
  }
});

// --- INICIO DEL SERVIDOR ---
app.listen(PORT, () => {
  console.log(`🚀 Servidor de FitMentor listo en: http://localhost:${PORT}`);
});