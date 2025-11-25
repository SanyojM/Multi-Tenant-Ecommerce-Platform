import { Body, Controller, Delete, Get, Param, Post, Put, UsePipes, ValidationPipe } from '@nestjs/common';
import { StoreService } from './store.service';
import { CreateStoreDto } from './dtos/create-store.dto';
import { UpdateStoreDto } from './dtos/update-store.dto';

@Controller('store')
export class StoreController {
    constructor(private storeService: StoreService) {}

    @Post("verify-domain")
    verifyDomain(@Body('domain') domain: string) {
        return this.storeService.verifyDomain(domain);
    }

    @Post()
    @UsePipes(ValidationPipe)
    createStore(@Body() data: CreateStoreDto) {
        return this.storeService.createStore(data);
    }

    @Post("set-domain/:id")
    setDomain(@Param('id') id: string, @Body('domain') domain: string) {
        return this.storeService.setDomain(id, domain);
    }

    @Get(":id")
    getStoreById(@Param('id') id: string) {
        return this.storeService.getStoreById(id);
    }

    @Get("domain/:domain")
    getStoreByDomain(@Param('domain') domain: string) {
        return this.storeService.getStoreDetailsByDomain(domain);
    }

    @Get()
    getAllStores() {
        return this.storeService.getAllStores();
    }

    @Put(":id")
    @UsePipes(ValidationPipe)
    updateStore(@Param('id') id: string, @Body() data: UpdateStoreDto) {
        return this.storeService.updateStore(id, data);
    }

    @Delete(":id")
    deleteStore(@Param('id') id: string) {
        return this.storeService.deleteStore(id);
    }
}