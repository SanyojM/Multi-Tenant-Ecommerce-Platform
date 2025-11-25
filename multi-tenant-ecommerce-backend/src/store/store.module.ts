import { Module } from '@nestjs/common';
import { StoreController } from './store.controller';
import { StoreService } from './store.service';
import { PrismaModule } from '../prisma/prisma.module';
import { SupabaseService } from 'src/supabase/supabase.service';

@Module({
  imports: [PrismaModule],
  controllers: [StoreController],
  providers: [StoreService, SupabaseService]
})
export class StoreModule {}
