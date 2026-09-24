import { Module } from "@nestjs/common";
import { productcontoller } from "./products.controllers.js";
import { productservice } from "./products.service.js";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Product } from "./product.entity.js";
import { usermodule } from "../users/users.module.js";
import { JwtModule } from "@nestjs/jwt";

@Module({
  controllers: [productcontoller],
  providers: [productservice],
  imports: [
    TypeOrmModule.forFeature([Product]),
    usermodule,
    JwtModule
  ],
  exports: [productservice]
})
export class productsmodule {}