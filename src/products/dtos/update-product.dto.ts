import {
    IsString,
    IsNumber,
    IsOptional,
    IsNotEmpty,
    Min,
    Length,
    MinLength
} from "class-validator";
import { ApiPropertyOptional } from "@nestjs/swagger";
export class updateproductdto {

    @IsString({
        message: "title should be string, this is custom message"
    })
    @IsNotEmpty({
        message: "this is custom message"
    })
    @Length(2, 150)
    @IsOptional()
    @ApiPropertyOptional()
    title?: string;

    @IsString()
    @MinLength(5)
    @IsOptional()
    @ApiPropertyOptional()
    description?: string;

    @IsNumber()
    @Min(0, {
        message: "price should not be less than zero"
    })
    @IsNotEmpty()
    @IsOptional()
    @ApiPropertyOptional()
    price?: number;
}