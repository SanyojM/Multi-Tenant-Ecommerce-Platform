import { IsNotEmpty, IsOptional, IsString, IsNumber, IsInt, Min, IsArray, IsJSON } from "class-validator";
import { Transform, Type } from "class-transformer";

export class CreateProductDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsNumber()
    @Min(0)
    @Type(() => Number)
    price: number;

    @IsInt()
    @Min(0)
    @Type(() => Number)
    stock: number;

    @IsString()
    @IsNotEmpty()
    categoryId: string;

    @IsString()
    @IsNotEmpty()
    storeId: string;

    @IsOptional()
    @Transform(({ value }) => {
        if (typeof value === 'string') {
            try {
                return JSON.parse(value);
            } catch {
                return value;
            }
        }
        return value;
    })
    specs?: any;

    @IsOptional()
    @IsArray()
    @Transform(({ value }) => {
        if (typeof value === 'string') {
            try {
                return JSON.parse(value);
            } catch {
                return [value];
            }
        }
        return Array.isArray(value) ? value : [];
    })
    variantIds?: string[];

    @IsOptional()
    imageFiles?: Express.Multer.File[];

    @IsOptional()
    graphicFiles?: Express.Multer.File[];
}
