import { MetadataRoute } from 'next';
import { getProducts, getCategories } from '@/lib/services/product-service';
import { getArticles } from '@/lib/services/article-service';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://whey4you.vn';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const currentDate = new Date();

  // Static high-priority pages
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/blog`,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/tra-cuu-don-hang`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.7,
    },
  ];

  try {
    // 1. Fetch Categories
    const categories = await getCategories();
    const categoryRoutes: MetadataRoute.Sitemap = categories
      .filter((cat) => cat.slug && cat.slug !== 'all')
      .map((cat) => ({
        url: `${BASE_URL}/category/${cat.slug}`,
        lastModified: currentDate,
        changeFrequency: 'daily',
        priority: 0.9,
      }));

    // 2. Fetch Products
    const products = await getProducts();
    const productRoutes: MetadataRoute.Sitemap = products.map((prod) => ({
      url: `${BASE_URL}/product/${prod.slug}`,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 0.9,
    }));

    // 3. Fetch Articles / Blog
    const articles = await getArticles();
    const articleRoutes: MetadataRoute.Sitemap = articles.map((art) => ({
      url: `${BASE_URL}/blog/${art.slug}`,
      lastModified: art.updatedAt ? new Date(art.updatedAt) : currentDate,
      changeFrequency: 'weekly',
      priority: 0.8,
    }));

    return [...staticRoutes, ...categoryRoutes, ...productRoutes, ...articleRoutes];
  } catch (error) {
    console.error('Error generating sitemap:', error);
    return staticRoutes;
  }
}
