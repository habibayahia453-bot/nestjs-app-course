import { JWTPayloadType } from "../utils/types.js";

declare global {
    namespace Express {
        interface Request {
            user?: JWTPayloadType;
        }
    }
}