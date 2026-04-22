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

export const getMailConfig = (): MailConfig => {
  const smtpUser = requireEnv("SMTP_USER");
  const smtpPass = requireEnv("SMTP_PASS");
  const smtpTo = process.env.SMTP_TO?.trim() || smtpUser;

  return {
    smtpUser,
    smtpPass,
    smtpTo,
  };
};
