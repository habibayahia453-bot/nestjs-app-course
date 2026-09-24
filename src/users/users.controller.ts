import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Put,
  UseGuards,
  UseInterceptors,
  ClassSerializerInterceptor,
  UploadedFile,
  BadRequestException,
  Res
} from "@nestjs/common";
import { usersservice } from "./users.service.js";
import { RegisterDto } from "./dtos/register.dto.js";
import { LoginDto } from "./dtos/login.dto.js";
import { AuthGuard } from "./guards/auth.guard.js";
import { AuthRolesGuard } from "./guards/auth-roles.guard.js";
import { CurrentUser } from "./decorators/current-user.decorator.js";
import type { JWTPayloadType } from "../utils/types.js";
import { Roles } from "./decorators/user-role.decorator.js";
import { usertype } from "../utils/enums.js";
import { UpdateUserrDto } from "./dtos/update-user.dto.js";
import { FileInterceptor } from "@nestjs/platform-express";
import { diskStorage } from "multer";
import type { Express, Response } from "express";
import { ForgetPasswordDto } from "./dtos/forget-password.dto.js";
import { ResetPasswordDto } from "./dtos/reset-password.dto.js";
import { ApiSecurity, ApiConsumes, ApiBody } from "@nestjs/swagger";
import { ImageUploadDto } from "./dtos/image-upload.dto.js";

@Controller("api/users")
export class userscontroller {
  constructor(
    private readonly usersservice: usersservice,
  ) {}

  // POST: ~/api/users/auth/register
  @Post("auth/register")
  public register(@Body() body: RegisterDto) {
    return this.usersservice.register(body);
  }

  // POST: ~/api/users/auth/login
  @Post("auth/login")
  @HttpCode(HttpStatus.OK)
  public login(@Body() body: LoginDto) {
    return this.usersservice.login(body);
  }

  // GET: ~/api/users/current-user
  @Get("current-user")
  @UseGuards(AuthGuard)
  public getCurrentUser(
    @CurrentUser() payload: JWTPayloadType,
  ) {
    console.log("get current user route handler called");

    return this.usersservice.getCurrentUser(payload.id);
  }

  // GET: ~/api/users
  @Get()
  @Roles(usertype.ADMIN)
  @UseGuards(AuthRolesGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  public getAllUsers() {
    return this.usersservice.getAll();
  }

  // PUT: ~/api/users
  @Put()
  @Roles(usertype.ADMIN, usertype.NORMAL_USER)
  @UseGuards(AuthRolesGuard)
  public updateUser(
    @CurrentUser() payload: JWTPayloadType,
    @Body() body: UpdateUserrDto,
  ) {
    return this.usersservice.update(payload.id, body);
  }

  // DELETE: ~/api/users/:id
  @Delete(":id")
  @Roles(usertype.ADMIN, usertype.NORMAL_USER)
  @UseGuards(AuthRolesGuard)
  public deleteUser(
    @Param("id", ParseIntPipe) id: number,
    @CurrentUser() payload: JWTPayloadType,
  ) {
    return this.usersservice.delete(id, payload);
  }

// POST: ~/api/users/upload-image
@Post("upload-image")
@UseGuards(AuthGuard)
@ApiSecurity('bearer')
@ApiConsumes("multerpart/form-data")
@ApiBody({ type: ImageUploadDto, description: 'profile image' })
@UseInterceptors(FileInterceptor("user-image", {
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
          new BadRequestException("unsupported file format"),
          false,
        );
      }
    },

    limits: {
      fileSize: 1024 * 1024 * 3,
    },
  }),
)
public async uploadProfileImage(
  @UploadedFile() file: Express.Multer.File,
  @CurrentUser() payload: JWTPayloadType,
) {
  if (!file) {
    throw new BadRequestException("no image provided");
  }
  return this.usersservice.setProfileImage(payload.id, file.filename);
}

// delete: ~/api/users/images/remove-profile-image
@Delete("images/remove-profile-image")
@UseGuards(AuthGuard)
public removeProfileImage(@CurrentUser() payload: JWTPayloadType) {
  return this.usersservice.removeProfileImage(payload.id);
}

// get: ~/api/users/images/:image
@Get("images/:image")
@UseGuards(AuthGuard)
public showProfileImage(@Param('image') image: string, @Res() res: Response) {
  return res.sendFile(image, { root: 'images/users'})
}

// get: `/api/users/verify-email/:id/:verificationToken
@Get("verify-email/:id/:verificationToken")
public verifyEmail(
  @Param('id', ParseIntPipe) id: number,
  @Param('verificationToken') verificationToken: string
) {
  return this.usersservice.verifyEmail(id, verificationToken);
}

// post: ~/api/users/forget-password
@Post("forgot-password")
@HttpCode(HttpStatus.OK)
public forgetPassword(@Body() body: ForgetPasswordDto){
  return this.usersservice.sendResetPassword(body.email);
}

// get: ~/api/users/reset-password/:id/:resetpasswordToken
@Get("reset-password/:id/:resetPasswordToken")
public getResetPassword(
  @Param("id", ParseIntPipe) id: number,
  @Param("resetPasswordToken") resetPasswordToken: string 
){
  return this.usersservice.getResetpassword(id, resetPasswordToken);
}

// post: ~/api/users/reset-password
@Post("reset-password")
public resetPassword(@Body() body: ResetPasswordDto) {
  return this.usersservice.resetPassword(body);
}
}