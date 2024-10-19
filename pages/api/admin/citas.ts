import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getSession({ req });

  if (!session || session.user.role !== 'ADMIN') {
    return res.status(401).json({ error: 'No autorizado' });
  }

  if (req.method === 'GET') {
    try {
      const citas = await prisma.cita.findMany({
        include: {
          user: {
            select: {
              name: true,
              email: true,
            },
          },
        },
      });
      res.status(200).json(citas);
    } catch (error) {
      res.status(500).json({ error: 'Error al obtener las citas' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}