import {
    Column,
    Entity,
    CreateDateColumn,
    UpdateDateColumn,
    PrimaryGeneratedColumn,
    OneToMany,
    ManyToOne
} from "typeorm";

import { CURRENT_TIMESTAMP } from "../utils/constants.js";
import { Review } from "../reviews/review.entity.js";
import { User } from "../users/user.entity.js";

@Entity({ name: "products" })
export class Product {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: "varchar", length: 150 })
    title: string;

    @Column()
    description: string;

    @Column({ type: "float" })
    price: number;

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

    @OneToMany(() => Review, (review) => review.product, { eager: true })
    reviews: any[];

    @ManyToOne(() => User, (user) => user.products, { eager: true})
    user: any;
}