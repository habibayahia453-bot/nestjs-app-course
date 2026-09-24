import { IsString, IsNumber, length, IsNotEmpty, Max, MaxLength,  Min, MinLength, Length, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class createproductdto {
    @IsString({message: 'title should be string , this is custom message'})
    @IsNotEmpty({message: 'this is custom message'})
    @Length(2, 150)
    @ApiProperty({ description: 'title of the product'})
    title: string;

    @IsString()
    @MinLength(5)
    @ApiProperty({ description: 'description of the product'})
    description: string;

    @IsNumber()
    @Min(0, {message: 'price should not be less than zero'})
    @IsNotEmpty()
    @ApiProperty({ description: 'price of the product'})
    price: number;
}