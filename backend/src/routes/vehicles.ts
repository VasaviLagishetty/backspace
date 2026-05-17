import { Router, Request, Response } from 'express'
import { body, validationResult } from 'express-validator'
import { prisma } from '../utils/prisma'
import { authenticate, AuthRequest } from '../middleware/auth'

const router = Router()
router.use(authenticate)

router.get('/', async (req: Request, res: Response) => { const authReq = req as AuthRequest;
  const vehicles = await prisma.vehicle.findMany({ where: { userId: authReq.user!.userId } })
  res.json(vehicles)
})

router.post('/',
  body('make').notEmpty(), body('model').notEmpty(),
  body('year').isInt({ min: 1990, max: 2030 }),
  body('type').isIn(['PETROL', 'DIESEL', 'EV', 'HYBRID']),
  body('licensePlate').notEmpty(),
  body('width').isFloat({ min: 1 }), body('length').isFloat({ min: 2 }),
  async (req: Request, res: Response) => { const authReq = req as AuthRequest;
    const errors = validationResult(req)
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() })
    const vehicle = await prisma.vehicle.create({ data: { ...req.body, userId: authReq.user!.userId } })
    res.status(201).json(vehicle)
  }
)

router.delete('/:id', async (req: Request, res: Response) => { const authReq = req as AuthRequest;
  await prisma.vehicle.deleteMany({ where: { id: req.params.id, userId: authReq.user!.userId } })
  res.json({ success: true })
})

export default router
