import { IsOptional, IsString, IsUrl } from 'class-validator';

export class UpdateStoreDto {
    @IsString()
    @IsOptional()
    name?: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsUrl()
    @IsOptional()
    logoUrl?: string;

    @IsUrl()
    @IsOptional()
    domain?: string;
}