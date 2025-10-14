/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'drive.google.com',
      },
      // สามารถเพิ่ม hostname อื่นๆ ได้ที่นี่ในอนาคต
    ],
  },
};

module.exports = nextConfig;