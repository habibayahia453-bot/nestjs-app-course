import { IsNotEmpty, IsOptional, IsString, Length, MinLength } from "class-validator";

export class UpdateUserrDto {
    @IsString()
    @MinLength(6)
    @IsNotEmpty()
    @IsOptional()
    password?: string;

    @IsOptional()
    @IsString()
    @Length(2, 150)
    @IsOptional()
    username?: string;
}