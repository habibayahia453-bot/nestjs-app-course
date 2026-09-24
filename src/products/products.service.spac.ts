import { Test, TestingModule } from "@nestjs/testing";
import { productservice } from "./products.service.js";
import { usersservice } from "../users/users.service.js";
import { getRepositoryToken } from "@nestjs/typeorm";
import { Product } from "./product.entity.js";
import { Repository } from "typeorm";
import { createproductdto } from "./dtos/create-product-dto.js";
import { vi } from "vitest";

type ProductsTestType = {
  id: number;
  title: string;
  price: number;
};

type Options = {
  where: {
    title?: string;
    minPrice?: number;
    maxPrice?: number;
  };
};

type FindOneParam = {
  where: {
    id: number;
  };
};

describe("ProductsService", () => {
  let productsService: productservice;
  let productsRepository: Repository<Product>;

  const REPOSITORY_TOKEN = getRepositoryToken(Product);

  const createProductDto: createproductdto = {
    title: "book",
    description: "about this book",
    price: 10,
  };

  let products: ProductsTestType[];

  beforeEach(async () => {
    products = [
      { id: 1, title: "p1", price: 10 },
      { id: 2, title: "p2", price: 10 },
      { id: 3, title: "p3", price: 10 },
      { id: 4, title: "p4", price: 10 },
    ];

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        productservice,

        {
          provide: usersservice,
          useValue: {
            getCurrentUser: vi.fn((userId: number) =>
              Promise.resolve({ id: userId }),
            ),
          },
        },

        {
          provide: REPOSITORY_TOKEN,
          useValue: {
            create: vi.fn((dto: createproductdto) => dto),

            save: vi.fn((dto: createproductdto) =>
              Promise.resolve({
                ...dto,
                id: 1,
              }),
            ),

            find: vi.fn((options?: Options) => {
              if (options?.where?.title) {
                return Promise.resolve([
                  products[0],
                  products[1],
                ]);
              }

              return Promise.resolve(products);
            }),

            findOne: vi.fn((param: FindOneParam) => {
              return Promise.resolve(
                products.find((p) => p.id === param.where.id),
              );
            }),

            remove: vi.fn((product: Product) => {
              const index = products.findIndex(
                (p) => p.id === product.id,
              );

              if (index !== -1) {
                return Promise.resolve(products.splice(index, 1));
              }

              return Promise.resolve([]);
            }),
          },
        },
      ],
    }).compile();

    productsService =
      module.get<productservice>(productservice);

    productsRepository =
      module.get<Repository<Product>>(REPOSITORY_TOKEN);
  });

  // Service
  it("should product service be defined", () => {
    expect(productsService).toBeDefined();
  });

  // Repository
  it("should productsRepository be defined", () => {
    expect(productsRepository).toBeDefined();
  });

  // Create new product
  describe("createProduct()", () => {
    it("should call 'create' method in product repository", async () => {
      await productsService.createnewproduct(
        createProductDto,
        1,
      );

      expect(productsRepository.create).toHaveBeenCalled();
      expect(productsRepository.create).toHaveBeenCalledTimes(1);
    });

    it("should call 'save' method in product repository", async () => {
      await productsService.createnewproduct(
        createProductDto,
        1,
      );

      expect(productsRepository.save).toHaveBeenCalled();
      expect(productsRepository.save).toHaveBeenCalledTimes(1);
    });

    it("should create a new product", async () => {
      const result =
        await productsService.createnewproduct(
          createProductDto,
          1,
        );

      expect(result.title).toBe("book");
      expect(result.id).toBe(1);
    });
  });

  // Get all products
  describe("getall()", () => {
    it("should call 'find' method in product repository", async () => {
      await productsService.getall();

      expect(productsRepository.find).toHaveBeenCalled();
      expect(productsRepository.find).toHaveBeenCalledTimes(1);
    });

    it("should return 2 products if an argument is passed", async () => {
      const data = await productsService.getall("book");

      expect(data).toHaveLength(2);
    });

    it("should return all products if no argument is passed", async () => {
      const data = await productsService.getall();

      expect(data).toHaveLength(4);
      expect(data).toBe(products);
    });
  });

  // Get single product by id
  describe("getoneby()", () => {
    it("should call 'findOne' method in product repository", async () => {
      await productsService.getoneby(1);

      expect(productsRepository.findOne).toHaveBeenCalled();
      expect(productsRepository.findOne).toHaveBeenCalledTimes(1);
    });

    it("should return a product with the given id", async () => {
      const product = await productsService.getoneby(1);

      expect(product).toMatchObject(products[0]);
    });

    it("should throw notFoundException if product was not found", async () => {
      expect.assertions(1);

      try {
        await productsService.getoneby(20);
      } catch (error) {
        expect(error).toMatchObject({
          message: "product not found",
        });
      }
    });
  });

  // Update product
  describe("update()", () => {
    const title = "product updated";

    it("should call 'save' method in product repository and update the product", async () => {
      const result = await productsService.update(1, {
        title,
      });

      expect(productsRepository.save).toHaveBeenCalled();
      expect(productsRepository.save).toHaveBeenCalledTimes(1);
      expect(result.title).toBe(title);
    });

    it("should throw notFoundException if product was not found", async () => {
      expect.assertions(1);

      try {
        await productsService.update(20, {
          title,
        });
      } catch (error) {
        expect(error).toMatchObject({
          message: "product not found",
        });
      }
    });
  });

  // delete product
  describe('delete(', () => {
    it("should call 'remove' method in products repository", async () => {
        await productsService.delete(1);
        expect(productsRepository.remove).toHaveBeenCalled();
        expect(productsRepository.remove).toHaveBeenCalledTimes(1);
    });

    it("should remove the product and return the success message", async () => {
        const result = await productsService.delete(1);
        expect(result).toMatchObject({ message: "product deleted successfully"});
    });

    it("should throw notFoundException if product was not found", async () => {
      expect.assertions(1);
      try {
        await productsService.delete(20);
      } catch (error) {
        expect(error).toMatchObject({
          message: "product not found",
        });
      }
    });
  })
});