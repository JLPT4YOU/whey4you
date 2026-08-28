import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Whey4You - Dinh Dưỡng Thể Hình & Thực Phẩm Bổ Sung',
    short_name: 'Whey4You',
    description: 'Hệ thống thực phẩm bổ sung cao cấp cho Gymer: 100% Whey Isolate, Omega-3 IFOS, Creatine & Vitamins.',
    start_url: '/',
    display: 'standalone',
    background_color: '#08183A',
    theme_color: '#0055FE',
    icons: [
      {
        src: '/logo.webp',
        sizes: '192x192',
        type: 'image/webp',
      },
      {
        src: '/logo.webp',
        sizes: '512x512',
        type: 'image/webp',
      },
    ],
  };
}
