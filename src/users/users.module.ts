import { BadRequestException, Module } from "@nestjs/common";
import { userscontroller } from "./users.controller.js";
import { usersservice } from "./users.service.js";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "./user.entity.js";
import { JwtModule } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import { AuthProvider } from "./auth.provider.js";
import { MulterModule } from "@nestjs/platform-express";
import { diskStorage } from "multer";
import { MailerModule } from "@nestjs-modules/mailer";
import { mailModule } from "../mail/male.module.js";


@Module({
    controllers: [userscontroller],
    providers: [usersservice, AuthProvider],
    exports:[usersservice],
    imports: [
        mailModule,
        TypeOrmModule.forFeature([User]),
        JwtModule.registerAsync({
            inject: [ConfigService],
            useFactory: (config: ConfigService) => {
                return {
                    global: true,
                    secret: config.get<string>("JWT_SECRET"),
                    signOptions: { expiresIn: config.get<string>("JWT_EXPIRES_IN") as any}
                }
            }
        }),
        MulterModule.register({
              storage: diskStorage({
                destination: "./images/users",
        
                filename: (req, file, cb) => {
                  const prefix = `${Date.now()}-${Math.round(
                    Math.random() * 1000000,
                  )}`;
        
                  const filename = `${prefix}-${file.originalname}`;
        
                  cb(null, filename);
                },
              }),
        
              fileFilter: (req, file, cb) => {
                if (file.mimetype.startsWith("image")) {
                  cb(null, true);
                } else {
                  cb(
                    new BadRequestException(
                      "unsupported file format",
                    ),
                    false,
                  );
                }
              },
        
              limits: {
                fileSize: 1024 * 1024 * 3,
              },
            })
    ]
})
export class usermodule{}