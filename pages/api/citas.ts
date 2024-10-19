import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import { PrismaClient } from '@prisma/client';
import { sendConfirmationEmail } from '../../utils/mailer';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getSession({ req });

  if (!session) {
    return res.status(401).json({ error: 'No autorizado' });
  }

  if (req.method === 'GET') {
    try {
      const citas = await prisma.cita.findMany({
        where: {
          userId: parseInt(session.user.id),
        },
      });
      res.status(200).json(citas);
    } catch (error) {
      res.status(500).json({ error: 'Error al obtener las citas' });
    }
  } else if (req.method === 'POST') {
    const { fecha, description } = req.body;
    try {
      const cita = await prisma.cita.create({
        data: {
          fecha: new Date(fecha),
          description,
          userId: parseInt(session.user.id),
        },
      });
      
      // Enviar correo de confirmación
      await sendConfirmationEmail(session.user.email, cita);

      res.status(201).json(cita);
    } catch (error) {
      res.status(500).json({ error: 'Error al crear la cita' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}