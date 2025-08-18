import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { protect, AuthRequest } from '../middleware/auth';

const router = Router();

// GET user settings
router.get('/', protect, async (req: AuthRequest, res) => {
  try {
    const settings = await prisma.userSettings.findUnique({
      where: { userId: req.user!.id }
    });
    res.json({ data: settings });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar configurações.' });
  }
});

// UPDATE user settings
router.put('/', protect, async (req: AuthRequest, res) => {
  try {
    const data = req.body;
    const updated = await prisma.userSettings.upsert({
      where: { userId: req.user!.id },
      update: data,
      create: { ...data, userId: req.user!.id }
    });
    res.json({ data: updated });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao atualizar configurações.' });
  }
});

export default router;
