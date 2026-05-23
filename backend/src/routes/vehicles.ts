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

router.patch('/:id', async (req: Request, res: Response) => { const authReq = req as AuthRequest;
  try {
    const { make, model, year, type, licensePlate, width, length } = req.body
    const vehicle = await prisma.vehicle.updateMany({ where: { id: req.params.id, userId: authReq.user!.userId }, data: { make, model, year, type, licensePlate, width, length } })
    if (vehicle.count === 0) return res.status(404).json({ error: 'Vehicle not found' })
    const updated = await prisma.vehicle.findUnique({ where: { id: req.params.id } })
    res.json(updated)
  } catch (e: any) {
    res.status(500).json({ error: 'Update failed' })
  }
})

export default router
