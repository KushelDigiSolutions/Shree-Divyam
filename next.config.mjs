/** @type {import('next').NextConfig} */
const nextConfig = {
  reactCompiler: true,

  images: {
    domains: ["res.cloudinary.com", "shreedivyam.kdscrm.com", "placehold.co"],
  },
};

export default nextConfig;