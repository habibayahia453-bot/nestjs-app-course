import { 
    Controller, 
    Get, 
    Post, 
    Delete, 
    Body, 
    Param, 
    Put,
    ParseIntPipe,
    UseGuards,
    Query
} from "@nestjs/common";
import { createproductdto } from "./dtos/create-product-dto.js";
import { updateproductdto } from "./dtos/update-product.dto.js";
import { productservice } from "./products.service.js";
import { AuthRolesGuard } from "../users/guards/auth-roles.guard.js";
import { CurrentUser } from "../users/decorators/current-user.decorator.js";
import type { JWTPayloadType } from "../utils/types.js";
import { Roles } from "../users/decorators/user-role.decorator.js";
import { usertype } from "../utils/enums.js";
import { ApiTags } from "@nestjs/swagger";
import { ApiQuery, ApiOperation, ApiResponse, ApiSecurity } from "@nestjs/swagger";
import { SkipThrottle, Throttle } from "@nestjs/throttler";
import { throttle } from "rxjs";

@Controller("/api/products")
export class productcontoller {
    constructor(
        private readonly productservice: productservice,
    ) {}

    @Post()
    @UseGuards(AuthRolesGuard)
    @Roles(usertype.ADMIN)
    @ApiSecurity('bearer')
    public createnewproduct(@Body() body: createproductdto, @CurrentUser() payload: JWTPayloadType) {
        return this.productservice.createnewproduct(body, payload.id);
    }

    @Get()
    @ApiResponse({ status: 200, description: 'products fetched successfully' })
    @ApiOperation({ summary: 'get a collection of products' })
    @ApiQuery({
        name: 'title',
        required: false,
        type: 'string',
        description: 'search based on product title',
        example: 'product title'
    })
    @ApiQuery({
        name: 'minprice',
        required: false,
        type: 'string',
        description: 'minimum price',
        example: 100
    })
    @ApiQuery({
        name: 'maxprice',
        required: false,
        type: 'string',
        description: 'maximum price',
        example: 200
    })
    public getallproducts(
        @Query('title') title?: string,
        @Query('minPrice') minPrice?: string,
        @Query('maxPrice') maxPrice?: string
    ) {
        return this.productservice.getall(title, minPrice, maxPrice);
    }

    @Get(":id")
    @Throttle({ default: { limit: 5, ttl: 10000 }})
    public getsingleproduct(
        @Param("id", ParseIntPipe) id: number
    ) {
        return this.productservice.getoneby(id);
    }

    @Put(":id")
    @UseGuards(AuthRolesGuard)
    @Roles(usertype.ADMIN)
    @ApiSecurity('bearer')
    public updateproduct(
        @Param("id", ParseIntPipe) id: number,
        @Body() body: updateproductdto
    ) {
        return this.productservice.update(id, body);
    }

    @Delete(":id")
    @UseGuards(AuthRolesGuard)
    @Roles(usertype.ADMIN)
    @ApiSecurity('bearer')
    public deleteproduct(
        @Param("id", ParseIntPipe) id: number
    ) {
        return this.productservice.delete(id);
    }
}