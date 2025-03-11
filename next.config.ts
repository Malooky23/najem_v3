import ReactComponentName from "react-scan/react-component-name/webpack"; 


/** @type {import("next").NextConfig} */
const config = {
  webpack: (config:any, { isServer, dev }: { isServer: boolean; dev: boolean }) => {
    if (!dev && !isServer) { // Enable only in production and client-side
      config.plugins.push(ReactComponentName({}));
    }
    return config;
  },

  eslint: {
    ignoreDuringBuilds: true,
  },

  typescript: {
    ignoreBuildErrors: true,
  },
};

export default config;

// experimental: {
//   serverActions: true,
//   // useCache: true,
//   // dynamicIO: true
// },