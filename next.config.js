const withBundleAnalyzer = require("@next/bundle-analyzer")({
    enabled: process.env.ANALYZE === "true",
});

const withPWA = require("next-pwa")({
    dest: "public",
});

const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');

module.exports = withBundleAnalyzer(
    withPWA({
        reactStrictMode: true,
        images: {
            remotePatterns: [
                {
                    protocol: "http",
                    hostname: "localhost",
                },
                {
                    protocol: "http",
                    hostname: "127.0.0.1",
                },
                {
                    protocol: "https",
                    hostname: "**",
                },
            ],
        },
        experimental: {
            serverComponentsExternalPackages: ["sharp", "onnxruntime-node"],
        },
        webpack: (config, { dev, isServer }) => {
            if (dev && isServer) {
                config.plugins.push(new ForkTsCheckerWebpackPlugin());
            }
            config.module.rules.push({
                test: /\.svg$/,
                use: ["@svgr/webpack"],
            });
            return config;
        },
        onDemandEntries: {
            maxInactiveAge: 25 * 1000,
            pagesBufferLength: 2,
        },
        swcMinify: false,
        swcLoader: {
            jsc: {
                transform: {
                    react: {
                        throwIfNamespace: false,
                    },
                },
            },
        },
    })
);
