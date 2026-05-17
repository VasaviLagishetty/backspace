import { Router, Request, Response } from 'express'
import { body, validationResult } from 'express-validator'
import { prisma } from '../utils/prisma'
import { authenticate, requireRole, AuthRequest } from '../middleware/auth'

const router = Router()
router.use(authenticate)

router.post('/',
  body('spotId').notEmpty(),
  body('title').notEmpty(),
  body('description').notEmpty(),
  async (req: Request, res: Response) => { const authReq = req as AuthRequest;
    const errors = validationResult(req)
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() })

    const issue = await prisma.issue.create({
      data: { ...req.body, userId: authReq.user!.userId },
    })
    res.status(201).json(issue)
  }
)

router.get('/mine', async (req: Request, res: Response) => { const authReq = req as AuthRequest;
  const issues = await prisma.issue.findMany({
    where: { userId: authReq.user!.userId },
    include: { spot: { select: { title: true } } },
    orderBy: { createdAt: 'desc' },
  })
  res.json(issues)
})

// Admin: update issue status
router.patch('/:id', requireRole('ADMIN'), async (req: Request, res: Response) => { const authReq = req as AuthRequest;
  const issue = await prisma.issue.update({
    where: { id: req.params.id },
    data: { status: req.body.status, resolution: req.body.resolution },
  })
  res.json(issue)
})

export default router
