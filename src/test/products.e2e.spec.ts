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

describe("ProductController (e2e)", () => {
    let app: INestApplication;
    let datasource: DataSource;
    let productsToSave: createproductdto[];
    let accessToken: string;
    let dto: createproductdto;

    beforeEach(async () => {
        dto = {
            title: "book",
            description: "about this book",
            price: 10,
        };
        productsToSave = [
            {
                title: "book",
                description: "about this book",
                price: 10,
            },
            {
                title: "laptop",
                description: "about this laptop",
                price: 400,
            },
            {
                title: "carpet",
                description: "about this carpet",
                price: 70,
            },
            {
                title: "chair",
                description: "about this chair",
                price: 21,
            },
        ];

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
            .from(Product)
            .execute();
        await datasource
            .createQueryBuilder()
            .delete()
            .from(User)
            .execute();

        await app.close();
    });

    // POST: ~/api/products
    it("should create a new product and save it to the database", async () => {
    const response = await request(app.getHttpServer())
        .post("/api/products")
        .set("Authorization", `Bearer ${accessToken}`)
        .send(dto);

    expect(response.status).toBe(201);
    expect(response.body.id).toBeDefined();

    expect(response.body).toMatchObject(dto);
});

it("should return 400 status code if title less than 2 characters", async () => {
    dto.title = "b";
    const response = await request(app.getHttpServer())
        .post("/api/products")
        .set("Authorization", `Bearer ${accessToken}`)
        .send(dto);

    expect(response.status).toBe(400);

});

it("should return 400 status code if price was less than zero", async () => {
    dto.price = -1;
    const response = await request(app.getHttpServer())
        .post("/api/products")
        .set("Authorization", `Bearer ${accessToken}`)
        .send(dto);

    expect(response.status).toBe(400);
});

it("should return 401 status code if bearer token was not provided", async () => {
    const response = await request(app.getHttpServer())
        .post("/api/products")
        .send(dto);

    expect(response.status).toBe(401);
});

    describe("GET", () => {
        beforeEach(async () => {
            await datasource
                .createQueryBuilder()
                .insert()
                .into(Product)
                .values(productsToSave)
                .execute();
        });
        // Test 1
        it("should return all products from the database", async () => {
            const response = await request(app.getHttpServer())
                .get("/api/products");

            expect(response.status).toBe(200);

            expect(response.body).toHaveLength(4);
        });

        // Test 2
        it("should return all products based on title", async () => {
            const response = await request(app.getHttpServer())
                .get("/api/products?title=laptop");

            expect(response.status).toBe(200);

            expect(response.body).toHaveLength(1);
        });

        // Test 3
        it("should return all products based on minPrice & maxPrice", async () => {
            const response = await request(app.getHttpServer())
                .get("/api/products?minPrice=20&maxPrice=1000");

            expect(response.status).toBe(200);

            // laptop = 400
            // carpet = 70
            // chair = 21
            expect(response.body).toHaveLength(3);
        });
    });

    // get: ~/api/products/:id
    describe('GET /:id', () => {
        it("should return a product with tha givin id", async () => {
            const { body } = await request(app.getHttpServer())
            .post("/api/products")
            .set("Authorization", `Bearer ${accessToken}`)
            .send(dto);

            const response = await request(app.getHttpServer())
            .get(`/api/products/${body.id}`);

            expect(response.status).toBe(200);
            expect(response.body.id).toBe(body.id);
            expect(response.body).toMatchObject(dto);
        });

        it("should return 404 status code if product was not found", async () => {
            const response = await request(app.getHttpServer())
            .get(`/api/products/1`);
            expect(response.status).toBe(404);
        });

        it("should return 400 status code if invalid id passed", async () => {
            const response = await request(app.getHttpServer())
            .get(`/api/products/abc`);
            expect(response.status).toBe(400);
        });

        // Put: ~/api/products/:id
        describe('PUT /:id', () => {
            it("should update the product", async () => {
            const { body } = await request(app.getHttpServer())
            .post("/api/products")
            .set("Authorization", `Bearer ${accessToken}`)
            .send(dto);

            const response = await request(app.getHttpServer())
            .put(`/api/products/${body.id}`)
            .set("Authorization", `Bearer ${accessToken}`)
            .send({ title: "updated" });

            expect(response.status).toBe(200);
            expect(response.body.title).toBe("updated");
            });

            it("should return 400 status code if title was less than 2 characters", async () => {
            const { body } = await request(app.getHttpServer())
            .post("/api/products")
            .set("Authorization", `Bearer ${accessToken}`)
            .send(dto);

            const response = await request(app.getHttpServer())
            .put(`/api/products/${body.id}`)
            .set("Authorization", `Bearer ${accessToken}`)
            .send({ title: "u" });

            expect(response.status).toBe(400);
            });

            it("should return 404 status code if product was not found", async () => {
            const response = await request(app.getHttpServer())
            .put(`/api/products/1`)
            .set("Authorization", `Bearer ${accessToken}`)
            .send({ title: "updated" });

            expect(response.status).toBe(404);
            expect(response.body).toMatchObject({ message: 'product not found' });
            });

            it("should return 400 status code if invalid id passed", async () => {
            const response = await request(app.getHttpServer())
            .put(`/api/products/abc`)
            .set("Authorization", `Bearer ${accessToken}`)
            .send({ title: "updated" });

            expect(response.status).toBe(400);
            });
        })
    });
    // delete: ~/api/products/:id
    describe('Delete /:id', () => {
        it("should delete the product eith the givin id", async () => {
          const { body } = await request(app.getHttpServer())
            .post("/api/products")
            .set("Authorization", `Bearer ${accessToken}`)
            .send(dto);  

          const response = await request(app.getHttpServer())
          .delete(`/api/products/${body.id}`)
          .set("Authorization", `Bearer ${accessToken}`)

          expect(response.status).toBe(200);
          expect(response.body).toMatchObject({ message: "product deleted successfully" })
        });

        it("should return 401 status code if no token provided", async () => {
          const response = await request(app.getHttpServer())
          .delete(`/api/products/1`)

          expect(response.status).toBe(401);
        });

        it("should return 404 status code if product was not found", async () => {
          const response = await request(app.getHttpServer())
          .delete(`/api/products/1`)
          .set("Authorization", `Bearer ${accessToken}`)

          expect(response.status).toBe(404);
          expect(response.body).toMatchObject({ message: 'product not found' })
        });

        it("should dreturn 400 status code if invalid id passed", async () => {
          const { body } = await request(app.getHttpServer())
            .post("/api/products")
            .set("Authorization", `Bearer ${accessToken}`)

          const response = await request(app.getHttpServer())
          .delete(`/api/products/${body.id}`)
          .set("Authorization", `Bearer ${accessToken}`)

          expect(response.status).toBe(400);
        });
    });
});