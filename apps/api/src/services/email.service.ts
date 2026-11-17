export interface VerificationEmail {
  email: string;
  token: string;
}

export async function sendVerificationEmail({
  email,
  token,
}: VerificationEmail): Promise<void> {
  // Email delivery is disabled until an email provider is configured.
  // The token is a link-style verification token, not a numeric code.
  // const verificationUrl = `${process.env['WEB_ORIGIN'] ?? 'http://localhost:3000'}/verify-email?token=${token}`;
  // await mailer.send({
  //   to: email,
  //   subject: 'Verify your DocuMind account',
  //   html: `<a href="${verificationUrl}">Verify your email</a>`,
  // });
  void email;
  void token;
}
