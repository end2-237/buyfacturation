/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ["nodemailer", "@react-pdf/renderer"],
  },
};

export default nextConfig;
