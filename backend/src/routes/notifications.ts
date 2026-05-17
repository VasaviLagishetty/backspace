import { Router, Request, Response } from 'express'
import { prisma } from '../utils/prisma'
import { authenticate, AuthRequest } from '../middleware/auth'

const router = Router()
router.use(authenticate)

router.get('/', async (req: Request, res: Response) => { const authReq = req as AuthRequest;
  const notifications = await prisma.notification.findMany({
    where: { userId: authReq.user!.userId },
    orderBy: { createdAt: 'desc' },
    take: 50,
  })
  res.json(notifications)
})

router.patch('/:id/read', async (req: Request, res: Response) => { const authReq = req as AuthRequest;
  await prisma.notification.updateMany({
    where: { id: req.params.id, userId: authReq.user!.userId },
    data: { isRead: true },
  })
  res.json({ success: true })
})

router.patch('/read-all', async (req: Request, res: Response) => { const authReq = req as AuthRequest;
  await prisma.notification.updateMany({
    where: { userId: authReq.user!.userId, isRead: false },
    data: { isRead: true },
  })
  res.json({ success: true })
})

export default router
