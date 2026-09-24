import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { Request } from "express";
import { JWTPayloadType } from "../../utils/types.js";
import { CURRENT_USER_KEY } from "../../utils/constants.js";
import { Reflector } from "@nestjs/core";
import { usertype } from "../../utils/enums.js";
import { usersservice } from "../users.service.js";

@Injectable()
export class AuthRolesGuard implements CanActivate {
    constructor(
        private readonly jwtService: JwtService,
        private readonly configuarationService: ConfigService,
        private readonly reflector: Reflector,
        private readonly usersService: usersservice
    ) { }


    async canActivate(context: ExecutionContext) {
        const roles: usertype[] = this.reflector.getAllAndOverride('roles', 
            [context.getHandler(), context.getClass()]);
        
        if(!roles || roles.length === 0) return false;

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

            const user = await this.usersService.getCurrentUser(payload.id);
            if(!user) return false;
            
            if(roles.includes(user.usertype)) {
                request[CURRENT_USER_KEY] = payload;
                return true;
            }
            
            } catch (error) {
                throw new UnauthorizedException("access denied, invalid token");
            }
        } else {
            throw new UnauthorizedException("access denied, no token provived");
        }
        
        return false;
    }
}