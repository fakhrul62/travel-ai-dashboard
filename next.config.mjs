/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com', // for google auth images
      },
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com', // for github auth images
      }
    ],
  },
};

export default nextConfig;
