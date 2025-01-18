/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    forceSwcTransforms: true,
    optimizePackageImports: [
      "@radix-ui/react-dropdown-menu",
      "@radix-ui/react-icons",
      "lucide-react",
    ],
  },
};

module.exports = nextConfig;
