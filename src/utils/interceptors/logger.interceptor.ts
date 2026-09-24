import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from "@nestjs/common";
import { Observable, tap, map } from "rxjs";

@Injectable()
export class LoggerInterceptor implements NestInterceptor{
    intercept(context: ExecutionContext, next: CallHandler<any>): Observable<any> | Promise<Observable<any>> {
        console.log("before route handler");

        return next.handle().pipe(map((dataFromRouteHandler) => {
            const { password, ...otherdata } = dataFromRouteHandler;
            return { ...otherdata };
        }));
    }

}