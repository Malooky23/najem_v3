import ReactComponentName from "react-scan/react-component-name/webpack"; 


/** @type {import("next").NextConfig} */
const config = {
  

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