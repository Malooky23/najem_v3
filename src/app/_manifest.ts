import type { MetadataRoute } from 'next'
 
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Najem Aleen Shipping',
    short_name: 'NAS',
    description: 'Najem Aleen Shipping - Warehouse Management System',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#000000',
    icons: [
      {
        src: '/512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  }
}