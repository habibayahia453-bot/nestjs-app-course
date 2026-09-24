import {
    Controller,
    Post,
    Body,
    Param,
    ParseIntPipe,
    UseGuards,
    Get,
    Put,
    Delete,
    Query
} from "@nestjs/common";

import { reviewsservice } from "./reviews.service.js";
import { CurrentUser } from "../users/decorators/current-user.decorator.js";
import { Roles } from "../users/decorators/user-role.decorator.js";
import { AuthRolesGuard } from "../users/guards/auth-roles.guard.js";
import { CreateReviewDto } from "./dtos/create-review.dto.js";
import type { JWTPayloadType } from "../utils/types.js";
import { usertype } from "../utils/enums.js";
import { UpdateReviewDto } from "./dtos/update-review.dto.js";

@Controller("api/reviews")
export class reviewscontroller {

    constructor(
        private readonly reviewsservice: reviewsservice,
    ) {}

    @Post(":productId")
    @UseGuards(AuthRolesGuard)
    @Roles(usertype.ADMIN, usertype.NORMAL_USER)
    public createNewReview(
        @Param("productId", ParseIntPipe) productId: number,
        @Body() body: CreateReviewDto,
        @CurrentUser() payload: JWTPayloadType
    ) {
        return this.reviewsservice.createReview(
            productId,
            payload.id,
            body
        );
    }

    @Get()
    @UseGuards(AuthRolesGuard)
    @Roles(usertype.ADMIN)
    public getALlReviews(
    @Query('pageNumber', ParseIntPipe) pageNumber: number,
    @Query('reviewPerPage', ParseIntPipe) reviewPerPage: number
    ) {
        return this.reviewsservice.getAll(pageNumber, reviewPerPage);
    }

    @Put(":id")
    @UseGuards(AuthRolesGuard)
    @Roles(usertype.ADMIN, usertype.NORMAL_USER)
    public updateReview(
        @Param("id", ParseIntPipe) id: number,
        @Body() body: UpdateReviewDto,
        @CurrentUser() payload: JWTPayloadType
    ) {
        return this.reviewsservice.update(
            id,
            payload.id,
            body
        );
    }

    @Delete(":id")
    @UseGuards(AuthRolesGuard)
    @Roles(usertype.ADMIN, usertype.NORMAL_USER)
    public deleteReview(
        @Param("id", ParseIntPipe) id: number,
        @CurrentUser() payload: JWTPayloadType
    ) {
        return this.reviewsservice.delete(
            id,
            payload
        );
    }
}