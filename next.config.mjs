/** @type {import('next').NextConfig} */
const nextConfig = {
  reactCompiler: true,

  images: {
    domains: ["res.cloudinary.com", "shreedivyam.kdscrm.com", "placehold.co", "shree-divyam.s3.ap-south-1.amazonaws.com"],
  },
};

export default nextConfig;