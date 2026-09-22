/** @type {import('next').NextConfig} */

const nextConfig = {
  output: "standalone",
  redirects: async () => {
    return [
      {
        source: "/",
        destination: "/overview",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
