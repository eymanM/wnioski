
/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    swcMinify: true,
    images: {
        unoptimized: true,
    },
    output: "standalone", // THIS IS IMPORTANT
    webpack(config) {
        config.experiments = {
            asyncWebAssembly: true,
            layers: true,
        };

        return config;
    },
};

module.exports = nextConfig;
