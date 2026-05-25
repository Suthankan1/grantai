/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",

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
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
      {
        protocol: "https",
        hostname: "*.railway.app",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
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
