import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import { PrismaClient } from '@prisma/client';
import { sendConfirmationEmail } from '../../../utils/mailer';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getSession({ req });

  if (!session) {
    return res.status(401).json({ error: 'No autorizado' });
  }

  const { id } = req.query;

  if (req.method === 'PUT') {
    const { fecha, description } = req.body;
    try {
      const cita = await prisma.cita.update({
        where: { id: parseInt(id as string) },
        data: {
          fecha: new Date(fecha),
          description,
        },
      });
      
      // Enviar correo de confirmación de actualización
      await sendConfirmationEmail(session.user.email, cita);

      res.status(200).json(cita);
    } catch (error) {
      res.status(500).json({ error: 'Error al actualizar la cita' });
    }
  } else if (req.method === 'DELETE') {
    try {
      await prisma.cita.delete({
        where: { id: parseInt(id as string) },
      });
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ error: 'Error al cancelar la cita' });
    }
  } else {
    res.setHeader('Allow', ['PUT', 'DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}