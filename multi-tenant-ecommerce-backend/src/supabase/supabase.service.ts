import { Injectable } from '@nestjs/common'
import { createClient } from '@supabase/supabase-js'

@Injectable()
export class SupabaseService {
  private supabase = createClient(
    process.env.SUPABASE_API_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY // 👈 make sure this is the secret service key
  )

  async uploadCategoryImage(fileBuffer: Buffer, filename: string): Promise<string> {
    const { data, error } = await this.supabase
      .storage
      .from('softricity-bucket') // bucket name
      .upload(`category-images/${filename}`, fileBuffer, {
        contentType: 'image/jpeg', // or dynamic based on file
        upsert: true,
      })

    if (error) throw new Error(error.message)

    const publicUrl = this.supabase
      .storage
      .from('softricity-bucket')
      .getPublicUrl(`category-images/${filename}`).data.publicUrl

    return publicUrl
  }

  // delete category image
  async deleteCategoryImage(publicUrl: string): Promise<void> {
    try {
      // Extract the filename from the URL - handle both hosted and self-hosted Supabase
      const bucketPrefix = '/storage/v1/object/public/softricity-bucket/category-images/';
      const idx = publicUrl.indexOf(bucketPrefix);
      if (idx === -1) {
        console.warn('Invalid public URL format, skipping deletion:', publicUrl);
        return; // Don't throw error, just skip deletion
      }
      const filename = publicUrl.substring(idx + bucketPrefix.length);
      console.log('Attempting to delete file:', filename);

      // First check if file exists in the category-images folder
      const { data: fileList, error: listError } = await this.supabase
        .storage
        .from('softricity-bucket')
        .list('category-images', { search: filename });

      if (listError) {
        console.warn('Error checking file existence:', listError.message);
        return; // Skip deletion if we can't check
      }

      // Check if file exists in the list
      const fileExists = fileList && fileList.some(file => file.name === filename);
      
      if (!fileExists) {
        console.warn('File does not exist in storage, skipping deletion:', filename);
        return;
      }

      console.log('File exists, proceeding with deletion:', filename);
      const { error } = await this.supabase
        .storage
        .from('softricity-bucket')
        .remove([`category-images/${filename}`]);
      
      if (error) {
        console.error('Error deleting file:', error.message);
        // Don't throw error, just log it
      } else {
        console.log('File deleted successfully:', filename);
      }
    } catch (error) {
      // Log the error but don't throw it to prevent update failure
      console.error('Error deleting category image:', error.message);
      // Don't throw the error - allow the update to continue
    }
  }

  async uploadStoreImage(fileBuffer: Buffer, filename: string): Promise<string> {
    const { data, error } = await this.supabase
      .storage
      .from('softricity-bucket') // bucket name
      .upload(`store-images/${filename}`, fileBuffer, {
        contentType: 'image/jpeg', // or dynamic based on file
        upsert: true,
      })

    if (error) throw new Error(error.message)

    const publicUrl = this.supabase
      .storage
      .from('softricity-bucket')
      .getPublicUrl(`store-images/${filename}`).data.publicUrl

    return publicUrl
  }

  // Product image methods
  async uploadProductImage(fileBuffer: Buffer, filename: string): Promise<string> {
    const { data, error } = await this.supabase
      .storage
      .from('softricity-bucket')
      .upload(`product-images/${filename}`, fileBuffer, {
        contentType: 'image/jpeg',
        upsert: true,
      })

    if (error) throw new Error(error.message)

    const publicUrl = this.supabase
      .storage
      .from('softricity-bucket')
      .getPublicUrl(`product-images/${filename}`).data.publicUrl

    return publicUrl
  }

  async uploadProductGraphic(fileBuffer: Buffer, filename: string): Promise<string> {
    const { data, error } = await this.supabase
      .storage
      .from('softricity-bucket')
      .upload(`product-graphics/${filename}`, fileBuffer, {
        contentType: 'image/jpeg',
        upsert: true,
      })

    if (error) throw new Error(error.message)

    const publicUrl = this.supabase
      .storage
      .from('softricity-bucket')
      .getPublicUrl(`product-graphics/${filename}`).data.publicUrl

    return publicUrl
  }

  async deleteProductImage(publicUrl: string): Promise<void> {
    try {
      const bucketPrefix = '/storage/v1/object/public/softricity-bucket/product-images/';
      const idx = publicUrl.indexOf(bucketPrefix);
      if (idx === -1) {
        console.warn('Invalid product image URL format, skipping deletion:', publicUrl);
        return;
      }
      const filename = publicUrl.substring(idx + bucketPrefix.length);
      console.log('Attempting to delete product image:', filename);

      const { data: fileList, error: listError } = await this.supabase
        .storage
        .from('softricity-bucket')
        .list('product-images', { search: filename });

      if (listError) {
        console.warn('Error checking product image existence:', listError.message);
        return;
      }

      const fileExists = fileList && fileList.some(file => file.name === filename);
      
      if (!fileExists) {
        console.warn('Product image does not exist in storage, skipping deletion:', filename);
        return;
      }

      console.log('Product image exists, proceeding with deletion:', filename);
      const { error } = await this.supabase
        .storage
        .from('softricity-bucket')
        .remove([`product-images/${filename}`]);
      
      if (error) {
        console.error('Error deleting product image:', error.message);
      } else {
        console.log('Product image deleted successfully:', filename);
      }
    } catch (error) {
      console.error('Error deleting product image:', error.message);
    }
  }

  async deleteProductGraphic(publicUrl: string): Promise<void> {
    try {
      const bucketPrefix = '/storage/v1/object/public/softricity-bucket/product-graphics/';
      const idx = publicUrl.indexOf(bucketPrefix);
      if (idx === -1) {
        console.warn('Invalid product graphic URL format, skipping deletion:', publicUrl);
        return;
      }
      const filename = publicUrl.substring(idx + bucketPrefix.length);
      console.log('Attempting to delete product graphic:', filename);

      const { data: fileList, error: listError } = await this.supabase
        .storage
        .from('softricity-bucket')
        .list('product-graphics', { search: filename });

      if (listError) {
        console.warn('Error checking product graphic existence:', listError.message);
        return;
      }

      const fileExists = fileList && fileList.some(file => file.name === filename);
      
      if (!fileExists) {
        console.warn('Product graphic does not exist in storage, skipping deletion:', filename);
        return;
      }

      console.log('Product graphic exists, proceeding with deletion:', filename);
      const { error } = await this.supabase
        .storage
        .from('softricity-bucket')
        .remove([`product-graphics/${filename}`]);
      
      if (error) {
        console.error('Error deleting product graphic:', error.message);
      } else {
        console.log('Product graphic deleted successfully:', filename);
      }
    } catch (error) {
      console.error('Error deleting product graphic:', error.message);
    }
  }

}
