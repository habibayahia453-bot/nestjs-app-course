import {
    Column,
    CreateDateColumn,
    Entity,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
    ManyToOne,
} from "typeorm";

import type { Relation } from "typeorm";

import { CURRENT_TIMESTAMP } from "../utils/constants.js";
import { Product } from "../products/product.entity.js";
import { User } from "../users/user.entity.js";

@Entity({ name: "reviews" })
export class Review {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    rating: number;

    @Column()
    comment: string;

    @CreateDateColumn({
        type: "timestamp",
        default: () => CURRENT_TIMESTAMP
    })
    createdat: Date;

    @UpdateDateColumn({
        type: "timestamp",
        default: () => CURRENT_TIMESTAMP,
        onUpdate: CURRENT_TIMESTAMP
    })
    updatedat: Date;

    @ManyToOne(
        () => Product,
        (product) => product.reviews,
        { onDelete: "CASCADE" }
    )
    product: Relation<Product>;

    @ManyToOne(
        () => User,
        (user) => user.reviews,
        {
            eager: true,
            onDelete: "CASCADE"
        }
    )
    user: Relation<User>;
}
