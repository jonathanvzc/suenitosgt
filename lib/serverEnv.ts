// Utilidades server-only para leer variables sensibles sin exponerlas al cliente.
// Utilidades server-only para leer variables sensibles sin exponerlas al cliente.
import "server-only";

type MailConfig = {
  smtpUser: string;
  smtpPass: string;
  smtpTo: string;
};

const requireEnv = (name: string) => {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(`Falta la variable de entorno ${name}`);
  }

  return value;
};

// Devuelve la configuración SMTP y el correo destino configurable para notificaciones.
export const getMailConfig = (): MailConfig => {
  const smtpUser = requireEnv("SMTP_USER");
  const smtpPass = requireEnv("SMTP_PASS");
  const smtpTo =
    process.env.ORDER_NOTIFICATION_EMAIL?.trim() ||
    process.env.SMTP_TO?.trim() ||
    "jonathanvzc@gmail.com";

  return {
    smtpUser,
    smtpPass,
    smtpTo,
  };
};
