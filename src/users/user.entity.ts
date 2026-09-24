import {
    Column,
    CreateDateColumn,
    Entity,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
    OneToMany,
} from "typeorm";

import type { Relation } from "typeorm";

import { CURRENT_TIMESTAMP } from "../utils/constants.js";
import { Product } from "../products/product.entity.js";
import { Review } from "../reviews/review.entity.js";
import { usertype } from "../utils/enums.js";
import { Exclude } from "class-transformer";

@Entity({ name: "users" })
export class User {

    static email(email: any) {
        throw new Error("Method not implemented.");
    }

    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        type: "varchar",
        length: 150,
        nullable: true
    })
    username: string;

    @Column({
        type: "varchar",
        length: 250,
        unique: true
    })
    email: string;

    @Column()
    @Exclude()
    password: string;

    @Column({
        type: "enum",
        enum: usertype,
        default: usertype.NORMAL_USER
    })
    usertype: usertype;

    @Column({ default: false })
    isaccountverified: boolean;

    @Column({
        nullable: true,
        default: null,
        type: "varchar"
    })
    verificationToken: string | null;

    @Column({
        nullable: true,
        default: null,
        type: "varchar"
    })
    resetPasswordToken: string | null;

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

    @Column({
        nullable: true,
        default: null,
        type: "varchar"
    })
    profileImage: string | null;

    @OneToMany(() => Product, (product) => product.user)
    products: Relation<Product[]>;

    @OneToMany(() => Review, (review) => review.user)
    reviews: Relation<Review[]>;
}