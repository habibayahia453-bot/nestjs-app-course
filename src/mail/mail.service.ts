import {
  Injectable,
  RequestTimeoutException,
} from "@nestjs/common";

import { MailerService } from "@nestjs-modules/mailer";

@Injectable()
export class MailService {
  constructor(
    private readonly mailerService: MailerService) {}

  public async sendLogInEmail(email: string) {
    try {
      const today = new Date();
      await this.mailerService.sendMail({
        to: email,
        from: "no-reply@my-nestjs-app.com",
        subject: "Log in",
        template: 'login',
        context: { email, today }
      });
    } catch (error) {
      console.log(error);
      throw new RequestTimeoutException();
    }
  }
  
  /**
   * sending verify email template
   * @param email email of the registered user
   * @param link link with id of the user and verification token
   */

public async sendVerifyEmailTemplate(email: string, link: string) {
  try {
    console.log("1- Starting send email...");
    console.log("EMAIL:", email);
    console.log("LINK:", link);

    await this.mailerService.sendMail({
      to: email,
      from: "no-reply@my-nestjs-app.com",
      subject: "Verify your account",
      template: "verify-email",
      context: { link },
    });

    console.log("2- Email sent successfully!");
  } catch (error) {
    console.log("3- EMAIL ERROR:");
    console.log(error);

    throw new RequestTimeoutException();
  }
}

/**
 * sending reset password template
 * @param email email of the password
 * @param resetPasswordLink link with id of the user and reset password token
 */
public async sendResetPasswordTemplate(email: string, resetPasswordLink: string) {
  try {
    console.log("1- Starting send email...");
    console.log("EMAIL:", email);
    console.log("LINK:", resetPasswordLink);

    await this.mailerService.sendMail({
      to: email,
      from: "no-reply@my-nestjs-app.com",
      subject: "Reset password",
      template: "reset-password",
      context: { resetPasswordLink },
    });

    console.log("2- Email sent successfully!");
  } catch (error) {
    console.log("3- EMAIL ERROR:");
    console.log(error);

    throw new RequestTimeoutException();
  }
}
}