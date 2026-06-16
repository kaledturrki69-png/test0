import apiClient from '@/lib/api-client';
import { Product } from '@/constants/data';

export interface ProductFilters {
  page?: number;
  limit?: number;
  search?: string;
  categories?: string;
}

export interface PaginatedProductsResponse {
  success: boolean;
  total_products: number;
  offset: number;
  limit: number;
  products: Product[];
}

export const productService = {
  // Get all products with pagination and filters
  async getProducts(
    filters: ProductFilters
  ): Promise<PaginatedProductsResponse> {
    const response = await apiClient.get('/products/', { params: filters });
    return response.data;
  },

  // Get a single product by ID
  async getProductById(
    id: number
  ): Promise<{ success: boolean; product: Product }> {
    const response = await apiClient.get(`/products/${id}/`);
    return response.data;
  },

  // Create a new product
  async createProduct(
    productData: Omit<Product, 'id' | 'created_at' | 'updated_at'>
  ): Promise<Product> {
    const response = await apiClient.post('/products/', productData);
    return response.data;
  },

  // Update a product
  async updateProduct(
    id: number,
    productData: Partial<Product>
  ): Promise<Product> {
    const response = await apiClient.put(`/products/${id}/`, productData);
    return response.data;
  },

  // Delete a product
  async deleteProduct(id: number): Promise<void> {
    await apiClient.delete(`/products/${id}/`);
  },

  // Get product categories
  async getCategories(): Promise<string[]> {
    const response = await apiClient.get('/products/categories/');
    return response.data;
  }
};
