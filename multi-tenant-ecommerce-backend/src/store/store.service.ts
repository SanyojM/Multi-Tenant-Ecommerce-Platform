import { BadRequestException, HttpException, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import * as dns from 'dns/promises'
import { PrismaService } from '../prisma/prisma.service';
import { SupabaseService } from 'src/supabase/supabase.service';

@Injectable()
export class StoreService {
    constructor(private prismaService: PrismaService, private supabaseService: SupabaseService) {}

    async getStoreById(id: string) {
        try {
            return await this.prismaService.store.findUnique({
                where: { id },
            });
        } catch (error) {
            throw new HttpException(error.message || 'Failed to get store by id', 400);
        }
    }

    async getAllStores() {
        try {
            return await this.prismaService.store.findMany();
        } catch (error) {
            throw new HttpException(error.message || 'Failed to get all stores', 400);
        }
    }

    async createStore(data: Prisma.StoreCreateInput) {
        try {
            return await this.prismaService.store.create({
                data
            });
        } catch (error) {
            throw new HttpException(error.message || 'Failed to create store', 400);
        }
    }

    async getStoreDetailsByDomain(domain: string) {
        try {
            console.log(`Fetching store details for domain: ${domain}`);
            const cleanedDomain = domain.trim().toLowerCase();
            const storeDetails = await this.prismaService.store.findFirst({
                where: { domain: cleanedDomain },
            });
            if (!storeDetails) {
                throw new HttpException('Store not found for domain', 404);
            }
            return storeDetails;
        } catch (error) {
            throw new HttpException(error.message || 'Failed to get store by domain', 400);
        }
    }

    async updateStore(id: string, data: Prisma.StoreUpdateInput) {
        try {
            const existingStore = await this.getStoreById(id);
            if (!existingStore) {
                throw new HttpException('Store not found', 404);
            }
            return await this.prismaService.store.update({
                where: { id },
                data
            });
        } catch (error) {
            throw new HttpException(error.message || 'Failed to update store', 400);
        }
    }

    async deleteStore(id: string) {
        try {
            const existingStore = await this.getStoreById(id);
            if (!existingStore) {
                throw new HttpException('Store not found', 404);
            }

            const categories = await this.prismaService.category.findMany({ where: { storeId: id } });
            for (const category of categories) {
                // delete products images too
                const products = await this.prismaService.product.findMany({ where: { categoryId: category.id } });
                for (const product of products) {
                    // Delete all images from storage
                    if (product.imageGallery && product.imageGallery.length > 0) {
                        console.log(`Deleting ${product.imageGallery.length} product images`);
                        for (const imageUrl of product.imageGallery) {
                            await this.supabaseService.deleteProductImage(imageUrl);
                        }
                    }
                    // Delete all graphics from storage
                    if (product.graphics && product.graphics.length > 0) {
                        console.log(`Deleting ${product.graphics.length} product graphics`);
                        for (const graphicUrl of product.graphics) {
                            await this.supabaseService.deleteProductGraphic(graphicUrl);
                        }
                    }
                    // Delete product record
                    await this.prismaService.product.delete({ where: { id: product.id } });
                }
                
                // Delete category image from storage
                if (category.imageUrl) {
                    await this.supabaseService.deleteCategoryImage(category.imageUrl);
                }
            }
            // Delete categories and products from database
            await this.prismaService.category.deleteMany({ where: { storeId: id } });
            return await this.prismaService.store.delete({
                where: { id },
            });
        } catch (error) {
            throw new HttpException(error.message || 'Failed to delete store', 400);
        }
    }

    async setDomain(id: string, domain: string) {
        try {
            const existingStore = await this.getStoreById(id);
            if (!existingStore) {
                throw new HttpException('Store not found', 404);
            }
            // check if domain is in correct format or not
            const domainRegex = /^(?!:\/\/)([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$/;
            if (!domainRegex.test(domain)) {
                throw new BadRequestException('Invalid domain format');
            }
            return await this.prismaService.store.update({
                where: { id },
                data: { 
                    domain,
                    domainStatus: 'PENDING'  
                }
            });
        } catch (error) {
            throw new HttpException(error.message || 'Failed to set domain', 400);
        }
    }

    async verifyDomain(domain: string) {
        const targetIP = process.env.VPS_IP // e.g., '123.45.67.89'
        try {
            const records = await dns.resolve(domain, 'A')
            if (records.includes(targetIP)) {
                const store = await this.prismaService.store.update({
                    where: { domain },
                    data: { domainStatus: 'ACTIVE' },
                });

                // Create nginx config file for the domain
                const fs = await import('fs/promises');
                const nginxConfig = `
server {
    listen 80;
    server_name ${domain};

    location / {
        proxy_pass http://localhost:4000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
`;
                const configPath = `/etc/nginx/sites-available/${domain}`;
                await fs.writeFile(configPath, nginxConfig);

                // Symlink to sites-enabled
                const enabledPath = `/etc/nginx/sites-enabled/${domain}`;
                try {
                    await fs.symlink(configPath, enabledPath);
                } catch (e) {
                    if (e.code !== 'EEXIST') throw e;
                }

                // Restart nginx
                const { exec } = await import('child_process');
                await new Promise((resolve, reject) => {
                    exec('sudo systemctl restart nginx', (error, stdout, stderr) => {
                        if (error) return reject(error);
                        resolve(stdout);
                    });
                });

                // Obtain SSL certificate using certbot
                await new Promise((resolve, reject) => {
                    exec(`sudo certbot --nginx -d ${domain} --non-interactive --agree-tos -m admin@${domain}`, (error, stdout, stderr) => {
                        if (error) return reject(error);
                        resolve(stdout);
                    });
                });

                // Reload nginx to apply SSL config
                await new Promise((resolve, reject) => {
                    exec('sudo systemctl reload nginx', (error, stdout, stderr) => {
                        if (error) return reject(error);
                        resolve(stdout);
                    });
                });

                return { success: true, message: 'Domain verified, nginx configured, and SSL enabled', store };
            } else {
                throw new BadRequestException(`Domain is not pointing to ${targetIP}`)
            }
        } catch (err) {
            throw new BadRequestException(`DNS lookup failed for ${domain} - ${err.message}`);
        }
    }
}
