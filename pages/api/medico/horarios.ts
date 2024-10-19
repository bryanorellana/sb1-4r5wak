import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getSession({ req });

  if (!session || (session.user.role !== 'MEDICO' && session.user.role !== 'ADMIN')) {
    return res.status(401).json({ error: 'No autorizado' });
  }

  if (req.method === 'GET') {
    try {
      const horarios = await prisma.horarioDisponible.findMany({
        where: {
          userId: parseInt(session.user.id),
        },
      });
      res.status(200).json(horarios);
    } catch (error) {
      res.status(500).json({ error: 'Error al obtener los horarios' });
    }
  } else if (req.method === 'POST') {
    const { start, end } = req.body;
    try {
      const horario = await prisma.horarioDisponible.create({
        data: {
          start: new Date(start),
          end: new Date(end),
          userId: parseInt(session.user.id),
        },
      });
      res.status(201).json(horario);
    } catch (error) {
      res.status(500).json({ error: 'Error al crear el horario' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}