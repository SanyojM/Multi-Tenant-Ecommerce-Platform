import { IsNotEmpty, IsOptional, IsString, IsUrl } from "class-validator";

export class CreateStoreDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsString()
    @IsOptional()
    logoUrl?: string;

    @IsUrl()
    @IsOptional()
    domain?: string;
}