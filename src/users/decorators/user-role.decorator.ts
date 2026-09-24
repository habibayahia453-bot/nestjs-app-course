import { SetMetadata } from "@nestjs/common";
import { usertype } from "../../utils/enums.js";

// roles method decorator 
export const Roles = (...roles: usertype[]) => SetMetadata('roles', roles);
