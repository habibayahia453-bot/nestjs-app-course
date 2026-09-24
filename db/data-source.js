import { DataSource } from "typeorm";
import { User } from "../src/users/user.entity.js";
import { Product } from "../src/products/product.entity.js";
import { Review } from "../src/reviews/review.entity.js";
import { config } from "dotenv";
config({ path: '.env' });
export const dataSourceOptions = {
    type: 'postgres',
    url: process.env.DATABASE_URL,
    entities: [User, Product, Review],
    migrations: ["dist/db/migrations/*.js"]
};
const dataSource = new DataSource(dataSourceOptions);
export default dataSource;
//# sourceMappingURL=data-source.js.map