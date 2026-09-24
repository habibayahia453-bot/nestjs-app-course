import { Injectable, NotFoundException } from "@nestjs/common";
import { createproductdto } from "./dtos/create-product-dto.js";
import { updateproductdto } from "./dtos/update-product.dto.js";
import { Repository , Like, Between } from "typeorm";
import { Product } from "./product.entity.js";
import { InjectRepository } from "@nestjs/typeorm";
import { usersservice } from "../users/users.service.js";

@Injectable()
export class productservice {

    constructor(
        @InjectRepository(Product)
        private readonly productrepository: Repository<Product>,
        private readonly userService: usersservice
    ) {}

    /**
     * create new product
     * @param dto data for creating new product 
     * @param userId id of the logged in user (admin)
     * @returns  the created product from the database
     */
    public async createnewproduct(dto: createproductdto, userId: number) {
        const user = await this.userService.getCurrentUser(userId);
        const newproduct = this.productrepository.create({
            ...dto, 
            title: dto.title.toLowerCase(), 
            user
        });
        return await this.productrepository.save(newproduct);
    }

    /**
     * get all products
     * @returns collection of products 
     */
    public getall(title?: string, minPrice?: string, maxPrice?: string) {
        const filters = {
            ...(title ? { title:  Like(`%${title.toLocaleLowerCase()}%`)}: {}),
            ...(minPrice && maxPrice ? { price: Between(parseInt(minPrice), parseInt(maxPrice)) } : {})
        }
        return this.productrepository.find({ where: filters });
    }

    /**
     * get one product be id
     * @param id id of the product
     * @returns product from the database
     */
    public async getoneby(id: number) {
        const product = await this.productrepository.findOne({ where: { id } });

        if (!product) {
            throw new NotFoundException("product not found");
        }

        return product;
    }

    /**
     * update product
     * @param id id of the product
     * @param dto data fro updating the exsiting product
     * @returns the updated product
     */
    public async update(id: number, dto: updateproductdto) {

        const product = await this.getoneby(id);

        product.title = dto.title ?? product.title;
        product.description = dto.description ?? product.description;
        product.price = dto.price ?? product.price;

        return this.productrepository.save(product);
    }

    /**
     * delete product
     * @param id id of the product
     * @returns a success message
     */
    public async delete(id: number) {
        const product = await this.getoneby(id);
        await this.productrepository.remove(product);
        return {
            message: "product deleted successfully"
        };
    }
}