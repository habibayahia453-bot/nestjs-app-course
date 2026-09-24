import { Module } from "@nestjs/common";
import { reviewscontroller } from "./reviews.controller.js";
import { reviewsservice } from "./reviews.service.js";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Review } from "./review.entity.js";
import { productsmodule } from "../products/products.module.js";
import { usermodule } from "../users/users.module.js";
import { JwtModule } from "@nestjs/jwt";

@Module({
    controllers: [reviewscontroller],
    providers: [reviewsservice],
    imports: [TypeOrmModule.forFeature([Review]), productsmodule, usermodule, JwtModule]
})
export class reviewmodule{}