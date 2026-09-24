import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Review } from "./review.entity.js";
import { Repository } from "typeorm";
import { productservice } from "../products/products.service.js";
import { usersservice } from "../users/users.service.js";
import { CreateReviewDto } from "./dtos/create-review.dto.js";
import { UpdateReviewDto } from "./dtos/update-review.dto.js"; 
import { JWTPayloadType } from "../utils/types.js";
import { usertype } from "../utils/enums.js";

@Injectable()
export class reviewsservice {
    constructor(
        @InjectRepository(Review)
        private readonly reviewRepository: Repository<Review>,

        private readonly productService: productservice,
        private readonly userService: usersservice
    ) {}

    /**
     * create new review
     * @param productId id of the product
     * @param userId id of the user that created this review
     * @param dto data for creating new review
     * @returns the created review from the database
     */
    public async createReview(
        productId: number,
        userId: number,
        dto: CreateReviewDto
    ) {
        const product = await this.productService.getoneby(productId);
        const user = await this.userService.getCurrentUser(userId);

        const review = this.reviewRepository.create({
            ...dto,
            user,
            product
        });

        const result = await this.reviewRepository.save(review);

        return {
            id: result.id,
            rating: result.rating,
            Comment: result.comment,
            createdAt: result.createdat,
            userId: user.id,
            productId: product.id
        }
    }

    /**
     * get all reviews
     * @param pageNumber number of the current page
     * @param reviewPerPage data for page
     * @returns collection of reviews
     */
    public async getAll(pageNumber:number, reviewPerPage: number) {
        return this.reviewRepository.find({ 
            skip: reviewPerPage * (pageNumber - 1),
            take: reviewPerPage, 
            order: { createdat: "DESC" } 
        });
    } 

    /**
     * update reviews
     * @param reviewId id of the review 
     * @param userId id of the owner of the review
     * @param dto data for updating the review
     * @returns updated review
     */
    public async update(reviewId: number, userId:number, dto: UpdateReviewDto) {
        const review = await this.getreviewBy(reviewId);
        if(review.user.id != userId)
            throw new ForbiddenException("access denied, you are not allowed");
       
        review.rating = dto.rating ?? review.rating;
        review.comment = dto.comment ?? review.comment;

        return this.reviewRepository.save(review);
    }

    /**
     * delete review
     * @param reviewId id of the review
     * @param payload JWTPayload
     * @returns a success message
     */
    public async delete(reviewId: number, payload: JWTPayloadType) {
        const review = await this.getreviewBy(reviewId);

        if(review.user.id === payload.id || payload.userType === usertype.ADMIN) {
            await this.reviewRepository.remove(review);
            return { message: 'review has been deleted'};
        }

        throw new ForbiddenException("you are not allowed");
    }

    /**
     * get single review by id
     * @param id id of the review
     * @returns review from the database
     */
    private async getreviewBy(id: number) {
        const review = await this.reviewRepository.findOne({ where: { id } });
        if(!review) throw new NotFoundException("review not found");
        return review;
    }
}

