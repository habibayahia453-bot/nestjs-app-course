import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { RegisterDto } from "./dtos/register.dto.js";
import { Repository } from "typeorm";
import { User } from "./user.entity.js";
import { InjectRepository } from "@nestjs/typeorm";
import { LoginDto } from "./dtos/login.dto.js";
import { JWTPayloadType, AccessTokenType } from "../utils/types.js";
import { UpdateUserrDto } from "./dtos/update-user.dto.js";
import { usertype } from "../utils/enums.js";
import { AuthProvider } from "./auth.provider.js";
import { join } from "path";
import { unlinkSync } from "fs";
import { registerHooks } from "module";
import { ResetPasswordDto } from "./dtos/reset-password.dto.js";

@Injectable()
export class usersservice {
    constructor(
        @InjectRepository(User) private readonly userRepository: Repository<User>,
        private readonly authProvider: AuthProvider
    ) {}

    /**
     * create new user
     * @param registerDto data for creating user
     * @returns JWT (access token)
     */
    public register(registerDto: RegisterDto) {
    return this.authProvider.register(registerDto);
    }

    /**
     * Log In user
     * @param loginDto data for log in to user acoount
     * @returns JWT (access token)
     */
    public async login(loginDto: LoginDto) {
    return this.authProvider.login(loginDto);
    }

    /**
     * get current user (logged in user)
     * @param id id of the logged in user
     * @returns the user from the database
     */
    public async getCurrentUser(id: number): Promise<User> {
        const user = await this.userRepository.findOne({ where: { id }});
        if(!user) throw new NotFoundException("user not found");
        return user;
    }

    /**
     * get all users from the database 
     * @returns collection of users
     */
    public getAll(): Promise<User[]> {
        return this.userRepository.find();
    }

    /**
     * update user
     * @param id id of the logged in user
     * @param updateUserrDto data for updating the user
     * @returns updated user from the database
     */
    public async update(id: number, updateUserrDto: UpdateUserrDto) {
        const { password, username } = updateUserrDto;
        const user = await this.userRepository.findOne({ where: { id }});

        if (!user) {
            throw new NotFoundException("user not found");
        }

        user.username = username ?? user?.username;
        if(password) {
            user.password = await this.authProvider.hashPassword(password);
        }

        return this.userRepository.save(user);
    }

    /**
     * delete user
     * @param userId id of the user
     * @param payload jwtpayload
     * @returns a success message
     */
    public async delete(userId: number, payload: JWTPayloadType) {
        const user = await this.getCurrentUser(userId);
        if(user.id === payload?.id || payload.userType === usertype.NORMAL_USER) {
            await this.userRepository.remove(user);
            return { message: 'User has been deleted'}
        }

        throw new ForbiddenException("access denied, you are not allowed");
    }

    public async setProfileImage(userId: number, newProfileImage: string){
        const user = await this.getCurrentUser(userId);

        if(user.profileImage === null){
        user.profileImage = newProfileImage;
        } else {
            await this.removeProfileImage(userId);
            user.profileImage = newProfileImage;
        }

        return this.userRepository.save(user);
    }
    public async removeProfileImage(userId: number) {
const user = await this.getCurrentUser(userId);

if (!user.profileImage) {
throw new BadRequestException("there is no profile image");
}

const imagePath = join(
process.cwd(),
"images",
"users",
user.profileImage,
);

try {
unlinkSync(imagePath);
console.log("profile image deleted:", user.profileImage);
} catch (error: any) {
if (error.code === "ENOENT") {
console.log(
"profile image file does not exist:",
user.profileImage,
);
} else {
throw error;
}
}

user.profileImage = null;

return this.userRepository.save(user);
}

/**
 * verify email
 * @param userId id of the user from the link
 * @param verificationToken verification token from the link 
 * @returns success message
 */
public async verifyEmail(userId: number, verificationToken: string) {
    const user = await this.getCurrentUser(userId);
    if(user.verificationToken === null)
        throw new NotFoundException("there is no verification token");

    if(user.verificationToken !== verificationToken)
        throw new BadRequestException("inavlid link");

    user.isaccountverified = true;
    user.verificationToken = null;

    await this.userRepository.save(user);
    return { message: "your email has been verified, please log in to your account"};
}

/**
 * sending reset password template
 * @param email email of the user
 * @returns a success message
 */
public sendResetPassword(email: string) {
    return this.authProvider.sendResetPasswordLink(email);
}

/**
 * get reset password link
 * @param userId user idfrom the link
 * @param resetPasswordToken reset password token from the link
 * @returns a success massage
 */
public getResetpassword(userId: number, resetPasswordToken: string) {
    return this.authProvider.getResetPasswordLink(userId, resetPasswordToken);
}

/**
 * reset the password
 * @param dto data fro reset the password
 * @returns a success message
 */
public resetPassword(dto: ResetPasswordDto) {
    return this.authProvider.resetPassword(dto);
}
}