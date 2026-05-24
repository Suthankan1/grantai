/** @type {import('next').NextConfig} */
const nextConfig = {
  // TypeScript strict mode is enforced in tsconfig.json
  typescript: {
    ignoreBuildErrors: false,
  },

  // ESLint
  eslint: {
    ignoreDuringBuilds: false,
  },

  // Allow remote font and image sources
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "api.fontshare.com",
        pathname: "/**",
      },
    ],
  },

  // Enable experimental features for App Router
  experimental: {
    optimizePackageImports: [
      "lucide-react",
      "framer-motion",
      "@radix-ui/react-dialog",
      "@radix-ui/react-dropdown-menu",
      "@radix-ui/react-avatar",
    ],
  },
};

export default nextConfig;
