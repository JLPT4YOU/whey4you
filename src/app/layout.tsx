import type { Metadata, Viewport } from 'next';
import { Plus_Jakarta_Sans, Inter } from 'next/font/google';
import './globals.css';
import { CartProvider } from '@/context/cart-context';

const jakartaSans = Plus_Jakarta_Sans({
  variable: '--font-display',
  subsets: ['latin'],
  display: 'swap',
});

const inter = Inter({
  variable: '--font-sans',
  subsets: ['latin'],
  display: 'swap',
});

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://whey4you.vn';

export const viewport: Viewport = {
  themeColor: '#0055FE',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: 'Whey4You | Thực Phẩm Bổ Sung Whey Protein, Dầu Cá & Vitamins Chính Hãng',
    template: '%s | Whey4You',
  },
  description:
    'Hệ thống thực phẩm bổ sung dinh dưỡng thể hình cao cấp tại Việt Nam: 100% Whey Isolate thủy phân, Dầu cá Omega-3 chuẩn IFOS, Creatine Monohydrate & Pre-Workout nhập khẩu chính hãng.',
  keywords: [
    'Whey Protein',
    'Whey Isolate',
    'Sữa tăng cơ bắp',
    'Thực phẩm bổ sung thể hình',
    'Dầu cá Omega 3 IFOS',
    'Creatine Monohydrate',
    'Pre-workout tăng sức mạnh',
    'EAA phục hồi cơ',
    'Vitamins thể thao',
    'Whey4You',
    'Thực phẩm chức năng gym',
    'Dinh dưỡng thể hình Việt Nam',
  ],
  authors: [{ name: 'Whey4You Sports Nutrition', url: BASE_URL }],
  creator: 'Whey4You',
  publisher: 'Whey4You Vietnam',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: '/',
  },
  icons: {
    icon: [
      { url: '/logo.webp', type: 'image/webp' },
      { url: '/favicon.ico', sizes: 'any' },
    ],
    shortcut: '/logo.webp',
    apple: '/logo.webp',
  },
  openGraph: {
    title: 'Whey4You - Bùng Nổ Năng Lượng & Sức Mạnh Cơ Bắp Đỉnh Cao',
    description:
      'Chuyên Whey Isolate Thủy Phân, Dầu Cá Omega-3 Siêu Tinh Khiết & Dinh Dưỡng Thể Thao Nhập Khẩu 100% Chính Hãng.',
    url: BASE_URL,
    siteName: 'Whey4You Vietnam',
    locale: 'vi_VN',
    type: 'website',
    images: [
      {
        url: '/logo-brand.webp',
        width: 1200,
        height: 630,
        alt: 'Whey4You - Thực Phẩm Bổ Sung Thể Hình & Sức Khỏe Chính Hãng',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Whey4You | Dinh Dưỡng Thể Hình & Thực Phẩm Bổ Sung Thể Thao',
    description:
      'Hệ thống phân phối Whey Protein, Creatine, Dầu Cá Omega-3 chuẩn IFOS chính hãng tại Việt Nam.',
    images: ['/logo-brand.webp'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  other: {
    'geo.region': 'VN',
    'geo.placename': 'Vietnam',
    'revisit-after': '1 days',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Global Schema: Organization & WebSite SearchBox
  const globalOrganizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Whey4You',
    alternateName: 'Whey4You Sports Nutrition Vietnam',
    url: BASE_URL,
    logo: `${BASE_URL}/logo.webp`,
    image: `${BASE_URL}/logo-brand.webp`,
    description:
      'Thương hiệu và hệ thống phân phối thực phẩm bổ sung, Whey Protein, Dầu cá Omega-3 và dinh dưỡng thể thao chính hãng tại Việt Nam.',
    email: 'whey4you.owner@gmail.com',
    telephone: '+8419008888',
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'VN',
    },
    sameAs: [
      'https://www.facebook.com/p/Whey4You-61563177707517/',
      'https://zalo.me/g/hqwqsqcnpgik9n3zo0nk',
    ],
  };

  const websiteSearchBoxSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Whey4You',
    url: BASE_URL,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${BASE_URL}/category/all?search={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };

  return (
    <html lang="vi" className={`${jakartaSans.variable} ${inter.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(globalOrganizationSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSearchBoxSchema) }}
        />
      </head>
      <body className="font-sans antialiased bg-[#FAFBFD] text-slate-900 min-h-screen selection:bg-emerald-500 selection:text-white">
        <CartProvider>{children}</CartProvider>
      </body>
    </html>
  );
}

