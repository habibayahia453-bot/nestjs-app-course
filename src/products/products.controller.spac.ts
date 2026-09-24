import { Test, TestingModule } from "@nestjs/testing"
import { productcontoller } from "./products.controllers.js"
import { productservice } from "./products.service.js";
import { ConfigService } from "@nestjs/config";
import { usersservice } from "../users/users.service.js";
import { JwtService } from "@nestjs/jwt";
import { JWTPayloadType } from "../utils/types.js";
import { usertype } from "../utils/enums.js";
import { createproductdto } from "./dtos/create-product-dto.js";
import { title } from "process";
import { NotFoundException } from "@nestjs/common";
import { updateproductdto } from "./dtos/update-product.dto.js";
type ProductsTestType = {
  id: number;
  title: string;
  price: number;
};

describe('ProductsController', () => {
    let productsController: productcontoller;
    let productsService: productservice;
    const currentUser: JWTPayloadType = { id: 1, userType: usertype.ADMIN };
    const createProductDto: createproductdto = {
        title: 'book',
        description: 'about this book',
        price: 10
    };

    let products: ProductsTestType[];

    beforeEach(async () => {
        products = [
            { id: 1, title: 'book', price: 10},
            { id: 2, title: 'laptop', price: 500},
            { id: 3, title: 'carpet', price: 100},
            { id: 4, title: 'chair', price: 20},
        ]
        const module: TestingModule = await Test.createTestingModule({
            controllers: [productcontoller],
            providers: [
                { provide: ConfigService, useValue: {} },
                { provide: usersservice, useValue: {} },
                { provide: JwtService, useValue: {} },
                {
                    provide: productservice,
                    useValue: {
                        createProductDto: vi.fn((dto: createproductdto, userId: number) => Promise.resolve({ ...dto, id: 1 })),
                        getAll: vi.fn((title?: string, minPrice?: number, maxPrice?: number) => {
                            if(title) return Promise.resolve(products.filter(p => p.title === title));
                            if(minPrice && maxPrice) return Promise.resolve(products.filter(p => p.price >= minPrice && p.price <= maxPrice))    
                            return Promise.resolve(products);
                        }),
                        getOneBy: vi.fn((id: number) => {
                            const product = products.find(p => p.id === id);
                            if(!product) throw new NotFoundException('product not found');
                            return Promise.resolve(product);
                        }),
                        update: vi.fn((productId: number, dto: updateproductdto) => Promise.resolve({ ...dto, id: productId})),
                        delete: vi.fn((productId:  number) => true)
                    }
                }
            ]
        }).compile();

        productsController = module.get<productcontoller>(productcontoller);
        productsService = module.get<productservice>(productservice);
    })

    it("should productscontroller be defined", () => {
        expect(productcontoller).toBeDefined();
    });

    it("should productsservice be defined", () => {
        expect(productservice).toBeDefined();
    });

    // create new product
    describe('createNewProduct()', () => {
        it("should call 'createProduct' method in productsService", async () => {
            await productsController.createnewproduct(createProductDto, currentUser);
            expect(productsService.createnewproduct).toHaveBeenCalled();
            expect(productsService.createnewproduct).toHaveBeenCalledTimes(1);
            expect(productsService.createnewproduct).toHaveBeenCalledWith(createProductDto, currentUser.id);
        });

        it("should return new product with the given data", async () => {
            const result = await productsController.createnewproduct(createProductDto, currentUser);
            expect(result).toMatchObject(createProductDto);
            expect(result.id).toBe(1);
            });
    });

    // get all products
    describe('getAllProducts()', () => {
        it("it should call 'getAll' method in productsService", async () => {
            await productsController.getallproducts();
            expect(productsService.getall).toHaveBeenCalled();
            expect(productsService.getall).toHaveBeenCalledTimes(1);
        });

        it("it should return all products if no argument passed", async () => {
            const data =  await productsController.getallproducts();
            expect(data).toBe(products);
            expect(data).toHaveLength(4);
        });

        it("it should return products based on title", async () => {
            const data =  await productsController.getallproducts("book");
            expect(data[0]).toMatchObject({ title: 'book' });
            expect(data).toHaveLength(1);
        });

        it("it should return products based on minprice & maxprice", async () => {
            const data =  await productsController.getallproducts(undefined, "80", "900");
            expect(data).toHaveLength(2);
        });
    })

    // get single product be id
    describe('getSingleProduct()', () => {
    it("should call 'getOneBy' method in productsService", async () => {
        await productsController.getsingleproduct(2);
        expect(productsService.getoneby).toHaveBeenCalled();
        expect(productsService.getoneby).toHaveBeenCalledTimes(1);
        expect(productsService.getoneby).toHaveBeenCalledWith(2);
    });

    it("should return a product with the givin id", async () => {
        const product = await productsController.getsingleproduct(2);
        expect(product.id).toBe(2);
    });

    it("should throw NotFoundException if product was not found", async () => {
        expect.assertions(1);
        try {
            await productsController.getsingleproduct(20);
        } catch (error) {
            expect(error).toMatchObject({ message: 'product not found'})
        }
    });


    });

    // update product
    describe('updateProduct()', () => {
        const title = 'product updated';
        it("should call 'update' method in productsService", async () => {
            await productsController.updateproduct(2, { title });
            expect(productsService.update).toHaveBeenCalled();
            expect(productsService.update).toHaveBeenCalledTimes(1);
            expect(productsService.update).toHaveBeenCalledWith(2, { title });
        });

        it("should return the updated product", async () => {
            const result = await productsController.updateproduct(2, { title });
            expect(result.title).toBe(title);
            expect(result.id).toBe(2);
        });
    })

    // delete product
    describe('deleteProduct()', () => {
        it("should call 'delete' method in productsService", async () => {
            await productsController.deleteproduct(2);
            expect(productsService.delete).toHaveBeenCalled();
            expect(productsService.delete).toHaveBeenCalledTimes(1);
        })
    })
})


