import { Router, Response, NextFunction } from 'express';
import prisma from '../../config/prisma';
import { successResponse, createdResponse } from '../../utils/response';
import { authenticate } from '../../middleware/auth.middleware';
import { AuthenticatedRequest } from '../../types';

const router = Router();

router.use(authenticate);

router.get('/tickets', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const tickets = await prisma.supportTicket.findMany({
      where: { userId: req.user!.id },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });
    return successResponse(res, tickets);
  } catch (error) {
    next(error);
  }
});

router.post('/tickets', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { subject, category, message } = req.body;
    const ticketNumber = `TKT-${Math.floor(10000 + Math.random() * 90000)}`;

    const ticket = await prisma.supportTicket.create({
      data: {
        ticketNumber,
        userId: req.user!.id,
        subject,
        category: category || 'General',
        messages: {
          create: {
            senderId: req.user!.id,
            body: message || subject,
          },
        },
      },
      include: { messages: true },
    });

    return createdResponse(res, ticket, 'Support ticket created.');
  } catch (error) {
    next(error);
  }
});

export default router;
