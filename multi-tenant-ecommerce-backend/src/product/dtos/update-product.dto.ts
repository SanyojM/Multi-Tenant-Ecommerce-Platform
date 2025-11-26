import { IsOptional, IsString, IsNumber, IsInt, Min, IsArray } from "class-validator";
import { Transform, Type } from "class-transformer";

export class UpdateProductDto {
    @IsString()
    @IsOptional()
    name?: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsNumber()
    @Min(0)
    @Type(() => Number)
    @IsOptional()
    price?: number;

    @IsInt()
    @Min(0)
    @Type(() => Number)
    @IsOptional()
    stock?: number;

    @IsString()
    @IsOptional()
    categoryId?: string;

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
    @IsArray()
    @IsString({ each: true })
    imageGallery?: string[];

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    graphics?: string[];

    @IsOptional()
    imageFiles?: Express.Multer.File[];

    @IsOptional()
    graphicFiles?: Express.Multer.File[];

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
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
    removeImages?: string[]; // URLs of images to remove

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    removeGraphics?: string[]; // URLs of graphics to remove
}
