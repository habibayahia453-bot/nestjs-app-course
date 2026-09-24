import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "./user.entity.js";
import { JwtService } from "@nestjs/jwt";
import { RegisterDto } from "./dtos/register.dto.js";
import * as bcrypt from 'bcryptjs';
import { LoginDto } from "./dtos/login.dto.js";
import { JWTPayloadType, AccessTokenType } from "../utils/types.js";
import { Repository } from "typeorm";
import { MailerService } from "@nestjs-modules/mailer";
import { MailService } from "../mail/mail.service.js";
import { randomBytes } from "node:crypto"; 
import { ConfigService } from "@nestjs/config";
import { ResetPasswordDto } from "./dtos/reset-password.dto.js";

@Injectable()
export class AuthProvider {
        constructor(
            @InjectRepository(User) private readonly userRepository: Repository<User>,
            private readonly jwtService: JwtService,
            private readonly mailService:MailService,
            private readonly config: ConfigService
        ) {}
    
        /**
         * create new user
         * @param registerDto data for creating user
         * @returns JWT (access token)
         */
        public async register(registerDto: RegisterDto) {
    const { email, password, username } = registerDto;

    const userFromDb = await this.userRepository.findOne({
        where: { email }
    });

    if (userFromDb) {
        throw new BadRequestException("user already exist");
    }

    const hashpassword = await this.hashPassword(password);

    let newUser = this.userRepository.create({
        email,
        username,
        password: hashpassword,
        verificationToken: randomBytes(32).toString("hex"),
    });

    newUser = await this.userRepository.save(newUser);

    if (!newUser.verificationToken) {
        throw new BadRequestException(
            "verification token was not generated"
        );
    }

    const link = this.generatelink(
        newUser.id,
        newUser.verificationToken
    );

    await this.mailService.sendVerifyEmailTemplate(
        email,
        link
    );

    return {
        message:
            "verification token has been sent to your email, please verify your email address",
    };
}
    
        /**
         * Log In user
         * @param loginDto data for log in to user acoount
         * @returns JWT (access token)
         */
        public async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    const user = await this.userRepository.findOne({ where: { email } });

    if (!user) {
        throw new BadRequestException("invalid email or password");
    }

    const isPasswordMatch = await bcrypt.compare(password, user.password);

    if (!isPasswordMatch) {
        throw new BadRequestException("invalid email or password");
    }

    if (!user.isaccountverified) {

        let verificationToken = user.verificationToken;

        if (!verificationToken) {
            user.verificationToken = randomBytes(32).toString("hex");

            const result = await this.userRepository.save(user);

            verificationToken = result.verificationToken;
        }

        if (!verificationToken) {
            throw new BadRequestException(
                "verification token was not generated"
            );
        }

        const link = this.generatelink(
            user.id,
            verificationToken
        );
        await this.mailService.sendVerifyEmailTemplate(email, link);

        return { message: "verification token has been sent to your email, please verify your email address" };

        // هنا بعدين هنرسل الإيميل
        // await this.mailService.sendVerifyEmailTemplate(user.email, link);
    }

    const accessToken = await this.generateJWT({
        id: user.id,
        userType: user.usertype
    });

    return { accessToken };
}

/**
 * sending reset password link to the client
 */
public async sendResetPasswordLink(email: string) {
    const user = await this.userRepository.findOne({ where: { email } });
    if(!user) throw new BadRequestException("user with given email doen not exist");

    user.resetPasswordToken = randomBytes(32).toString('hex');
    const result = await this.userRepository.save(user);

    const resetPasswordLink = `${this.config.get<string>("CLIENT_DOMAIN")}/reset-password/${user.id}/${result.resetPasswordToken}`;
    await this.mailService.sendResetPasswordTemplate(email, resetPasswordLink);

    return { message: "password reset link sent to your email, please check your inbox"};
}

/**
 * get reset password link
 */
public async getResetPasswordLink(userId: number, resetpasswordToken: string) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if(!user) throw new BadRequestException("invalid link");

    if(user.resetPasswordToken === null || user.resetPasswordToken !== resetpasswordToken)
        throw new BadRequestException("invalid link");

    return { message: 'invalid link' }
}

/**
 * reset the password
 */
public async resetPassword(dto: ResetPasswordDto) {
    const { userId, resetPasswordToken, newPassword} = dto;

    const user = await this.userRepository.findOne({ where: { id: userId } });
    if(!user) throw new BadRequestException("invalid link");

    if(user.resetPasswordToken === null || user.resetPasswordToken !== resetPasswordToken)
        throw new BadRequestException("invalid link");
    
    const hashedpassword = await this.hashPassword(newPassword);
    user.password = hashedpassword;
    user.resetPasswordToken = null;
    await this.userRepository.save(user);

    return { message: 'password reset successfully, please log in' };

}

        /**
     * hashing password
     * @param password plain text password 
     * @returns hashed password
     */
    public async hashPassword(password: string): Promise<string> {
        const salt = await bcrypt.genSalt(10);
        return bcrypt.hash(password, salt);
    }
    
    /**
     * generate json web token
     * @param payload jwt payload
     * @returns token
     */
    private generateJWT(payload: JWTPayloadType) : Promise<string> {
        return this.jwtService.signAsync(payload);
    }

    /**
     * generate email verification link
     */
    private generatelink(userId: number, verificationToken: string) {
        return `${this.config.get<string>("DOMAIN")}/api/users/verify-email/${userId}/${verificationToken}`;
    }
}