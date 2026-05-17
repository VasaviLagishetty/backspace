import { Router, Request, Response } from 'express'
import { prisma } from '../utils/prisma'
import { authenticate, AuthRequest } from '../middleware/auth'

const router = Router()
router.use(authenticate)

router.get('/', async (req: Request, res: Response) => { const authReq = req as AuthRequest;
  const favorites = await prisma.favorite.findMany({
    where: { userId: authReq.user!.userId },
    include: { spot: { include: { host: { select: { name: true } } } } },
    orderBy: { createdAt: 'desc' },
  })
  res.json(favorites)
})

router.post('/:spotId', async (req: Request, res: Response) => { const authReq = req as AuthRequest;
  const fav = await prisma.favorite.upsert({
    where: { userId_spotId: { userId: authReq.user!.userId, spotId: req.params.spotId } },
    create: { userId: authReq.user!.userId, spotId: req.params.spotId },
    update: {},
  })
  res.status(201).json(fav)
})

router.delete('/:spotId', async (req: Request, res: Response) => { const authReq = req as AuthRequest;
  await prisma.favorite.deleteMany({
    where: { userId: authReq.user!.userId, spotId: req.params.spotId },
  })
  res.json({ success: true })
})

export default router
