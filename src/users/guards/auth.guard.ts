import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { Request } from "express";
import { JWTPayloadType } from "../../utils/types.js";
import { CURRENT_USER_KEY } from "../../utils/constants.js";

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(
        private readonly jwtService: JwtService,
        private readonly configuarationService: ConfigService
    ) { }


    async canActivate(context: ExecutionContext) {
        const request: Request = context.switchToHttp().getRequest();
        const [type, token] = request.headers.authorization?.split(" ") ?? [];
        if(token && type === "Bearer") {
            try {
                const payload: JWTPayloadType = await this.jwtService.verifyAsync(
                token,
                {
                    secret: this.configuarationService.get<string>("JWT_SECRET")
                }
            );

            request[CURRENT_USER_KEY] = payload;
            } catch (error) {
                throw new UnauthorizedException("access denied, invalid token");
            }
        } else {
            throw new UnauthorizedException("access denied, no token provived");
        }
        
        return true;
    }
}