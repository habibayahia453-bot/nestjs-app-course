import { Module } from "@nestjs/common";
import { MailerModule } from "@nestjs-modules/mailer";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { MailService } from "./mail.service.js";
import { join, dirname } from "node:path";
import { EjsAdapter } from "@nestjs-modules/mailer/adapters/ejs.adapter";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

@Module({
  imports: [
    ConfigModule,

    MailerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],

      useFactory: (config: ConfigService) => ({
        transport: {
          host: config.get<string>("SMTP_HOST"),
          port: config.get<number>("SMTP_PORT"),
          secure: false,

          auth: {
            user: config.get<string>("SMTP_USERNAME"),
            pass: config.get<string>("SMTP_PASSWORD"),
          },
        },

        template: {
          dir: join(__dirname, "templates"),
          adapter: new EjsAdapter({
            inlineCssEnabled: true,
          }),
        },
      }),
    }),
  ],

  providers: [MailService],
  exports: [MailService],
})
export class mailModule {}