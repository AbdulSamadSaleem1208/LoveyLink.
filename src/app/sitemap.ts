import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = 'https://loveylink.net';

    // Core static routes
    const routes = [
        '',
        '/login',
        '/register',
        '/contact',
        '/create',
        '/faq',
        '/pricing',
        '/privacy',
        '/terms',
    ].map((route) => ({
        url: `${baseUrl}${route}`,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: route === '' ? 1.0 : 0.8,
    }));

    return routes;
}
