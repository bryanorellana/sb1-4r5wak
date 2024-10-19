import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const sendConfirmationEmail = async (to: string, cita: any) => {
  await transporter.sendMail({
    from: '"Sistema de Citas" <noreply@sistemacitas.com>',
    to,
    subject: 'Confirmación de Cita',
    html: `
      <h1>Confirmación de Cita</h1>
      <p>Su cita ha sido confirmada para el ${new Date(cita.fecha).toLocaleString()}.</p>
      <p>Descripción: ${cita.description}</p>
      <p>Gracias por usar nuestro sistema de citas.</p>
    `,
  });
};

export const sendReminderEmail = async (to: string, cita: any) => {
  await transporter.sendMail({
    from: '"Sistema de Citas" <noreply@sistemacitas.com>',
    to,
    subject: 'Recordatorio de Cita',
    html: `
      <h1>Recordatorio de Cita</h1>
      <p>Le recordamos que tiene una cita programada para mañana ${new Date(cita.fecha).toLocaleString()}.</p>
      <p>Descripción: ${cita.description}</p>
      <p>Gracias por usar nuestro sistema de citas.</p>
    `,
  });
};