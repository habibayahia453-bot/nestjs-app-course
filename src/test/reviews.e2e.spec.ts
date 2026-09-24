import { Test, TestingModule } from "@nestjs/testing";
import { DataSource } from "typeorm";
import { INestApplication, ValidationPipe } from "@nestjs/common";
import request from "supertest";
import * as bcrypt from 'bcryptjs'
import { AppModule } from "../app.module.js";
import { Product } from "../products/product.entity.js";
import { createproductdto } from "../products/dtos/create-product-dto.js";
import { title } from "process";
import { User } from "../users/user.entity.js";
import { usertype } from "../utils/enums.js";
import { APP_PIPE } from "@nestjs/core";
import { CreateReviewDto } from "../reviews/dtos/create-review.dto.js";
import { Review } from "../reviews/review.entity.js";

describe("ReviewsController (e2e)", () => {
    let app: INestApplication;
    let datasource: DataSource;
    let accessToken: string;
    let createReviewDto: CreateReviewDto

    beforeEach(async () => {
        createReviewDto = { comment: 'thanks', rating: 4 };

        const module: TestingModule = await Test.createTestingModule({
            imports: [AppModule]
        }).compile();

        app = module.createNestApplication();
        await app.init();
        datasource = app.get(DataSource);

        // saving a new user (admin) to the database
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash("123456", salt);
        await datasource.createQueryBuilder().insert().into(User).values([
            { username: 'admin', email: 'admin@email.com', usertype: usertype.ADMIN, password: hash, isaccountverified: true }
        ]).execute();

        // login to admin account and get the token
        const { body } = await request(app.getHttpServer())
        .post("/api/users/auth/login")
        .send({
            email: "admin@email.com",
            password: "123456",
        });
        accessToken = body.accessToken;
    });

    afterEach(async () => {
        await datasource
            .createQueryBuilder()
            .delete()
            .from(Review)
            .execute();
        await datasource
            .createQueryBuilder()
            .delete()
            .from(Product)
            .execute();
        await datasource
            .createQueryBuilder()
            .delete()
            .from(User)
            .execute();
        await app.close();
    });

    // post: ~/api/reviews/:productId
    describe("POST()", () => {
    it("should create a new review and save it to the database", async () => {

        // Create a product first
        const { body } = await request(app.getHttpServer())
            .post("/api/products")
            .set("Authorization", `Bearer ${accessToken}`)
            .send({
                title: "book",
                description: "about this book",
                price: 10
            });

        const response = await request(app.getHttpServer())
            .post(`/api/reviews/${body.id}`)
            .set("Authorization", `Bearer ${accessToken}`)
            .send(createReviewDto);

        console.log(response.body);

        expect(response.status).toBe(201);
        expect(response.body.id).toBeDefined();
        expect(response.body).toMatchObject({
            rating: 4
        });    
});
});
});
