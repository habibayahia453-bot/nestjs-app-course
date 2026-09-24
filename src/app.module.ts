import { ClassSerializerInterceptor, Logger, MiddlewareConsumer, Module, NestModule, RequestMethod, ValidationPipe } from "@nestjs/common";
import { productsmodule } from "./products/products.module.js";
import { usermodule } from "./users/users.module.js";
import { reviewmodule } from "./reviews/reviews.module.js";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { Product } from "./products/product.entity.js";
import { User } from "./users/user.entity.js";
import { Review } from "./reviews/review.entity.js";
import { APP_GUARD, APP_INTERCEPTOR, APP_PIPE } from "@nestjs/core";
import { UploadsModule } from "./uploads/uploads.module.js";
import { mailModule } from "./mail/male.module.js";
import { LoggerMiddleware } from "./middlewares/logger.middleware.js";
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler'
import { dataSourceOptions } from "../db/data-source.js";
import { AppController } from "./app.controller.js";

@Module({
  controllers: [AppController],
  imports: [
    // Config أولاً
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: process.env.NODE_ENV !== 'production' ? `.env.${process.env.NODE_ENV}` : ".env",
    }),
    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: 4000,
        limit: 3,
      },
      {
        name: 'meduim',
        ttl: 10000, 
        limit: 7
      },
      {
        name: 'long',
        ttl: 60000,
        limit: 15
      }
  ]),

    // باقي الـ modules
    productsmodule,
    usermodule,
    reviewmodule,
    UploadsModule,
    mailModule,

    TypeOrmModule.forRoot(dataSourceOptions),
  ],

  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: ClassSerializerInterceptor,
    },
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard
    },
    {
      provide: APP_PIPE,
      useValue: new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true })
    }
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
    .apply(LoggerMiddleware)
    .exclude({path: 'api/products', method: RequestMethod.POST})
    .forRoutes({
      path: 'api/products',
      method: RequestMethod.ALL
    });

    /*consumer
    .apply(helmet())
    .forRoutes({
      path: 'api/products',
      method: RequestMethod.GET
    });*/
  }
}

/* local database
{
      inject: [ConfigService],

      useFactory: (config: ConfigService) => ({
        type: "postgres",
        database: config.get<string>("DB_DATABASE"),
        username: config.get<string>("DB_USERNAME"),
        password: config.get<string>("DB_PASSWORD"),
        port: config.get<number>("DB_PORT"),
        host: config.get<string>("DB_HOST") || "localhost",
        synchronize: process.env.NODE_ENV !== "production",
        entities: [Product, User, Review],
      }),
    }*/