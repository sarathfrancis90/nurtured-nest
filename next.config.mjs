/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return {
      beforeFiles: [{ source: '/', destination: '/homepage.html' }],
    };
  },
};

export default nextConfig;
