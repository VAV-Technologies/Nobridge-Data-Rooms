/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  pageExtensions: ["js", "jsx", "ts", "tsx", "mdx"],
  transpilePackages: ["@boxyhq/saml-jackson"],
  images: {
    minimumCacheTTL: 2592000, // 30 days
    remotePatterns: prepareRemotePatterns(),
  },
  skipTrailingSlashRedirect: true,
  // assetPrefix removed — causes cross-deployment asset loading failures
  async redirects() {
    return [
      {
        source: "/",
        destination: "/dashboard",
        permanent: false,
        has: [
          {
            type: "host",
            value: process.env.NEXT_PUBLIC_APP_BASE_HOST,
          },
        ],
      },
      {
        source: "/settings",
        destination: "/settings/general",
        permanent: false,
      },
    ];
  },
  async headers() {
    const isDev = process.env.NODE_ENV === "development";

    return [
      {
        // Default headers for all routes
        source: "/:path*",
        headers: [
          {
            key: "Referrer-Policy",
            value: "no-referrer-when-downgrade",
          },
          {
            key: "X-DNS-Prefetch-Control",
            value: "on",
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          {
            key: "Report-To",
            value: JSON.stringify({
              group: "csp-endpoint",
              max_age: 10886400,
              endpoints: [{ url: "/api/csp-report" }],
            }),
          },
          {
            key: "Content-Security-Policy",
            value:
              `default-src 'self' https: ${isDev ? "http:" : ""}; ` +
              `script-src 'self' 'unsafe-inline' 'unsafe-eval' https: ${isDev ? "http:" : ""}; ` +
              `style-src 'self' 'unsafe-inline' https: ${isDev ? "http:" : ""}; ` +
              `img-src 'self' data: blob: https: ${isDev ? "http:" : ""}; ` +
              `font-src 'self' data: https: ${isDev ? "http:" : ""}; ` +
              `frame-ancestors 'none'; ` +
              `connect-src 'self' https: ${isDev ? "http: ws: wss:" : ""}; ` + // Add WebSocket for hot reload
              `${isDev ? "" : "upgrade-insecure-requests;"} ` +
              "report-to csp-endpoint;",
          },
        ],
      },
      {
        source: "/view/:path*",
        headers: [
          {
            key: "X-Robots-Tag",
            value: "noindex",
          },
        ],
      },
      {
        source: "/login",
        has: [
          {
            type: "query",
            key: "next",
          },
        ],
        headers: [
          {
            key: "X-Robots-Tag",
            value: "noindex, nofollow",
          },
        ],
      },
      {
        // Embed routes - allow iframe embedding
        source: "/view/:path*/embed",
        headers: [
          {
            key: "Content-Security-Policy",
            value:
              `default-src 'self' https: ${isDev ? "http:" : ""}; ` +
              `script-src 'self' 'unsafe-inline' 'unsafe-eval' https: ${isDev ? "http:" : ""}; ` +
              `style-src 'self' 'unsafe-inline' https: ${isDev ? "http:" : ""}; ` +
              `img-src 'self' data: blob: https: ${isDev ? "http:" : ""}; ` +
              `font-src 'self' data: https: ${isDev ? "http:" : ""}; ` +
              "frame-ancestors *; " + // This allows iframe embedding
              `connect-src 'self' https: ${isDev ? "http: ws: wss:" : ""}; ` + // Add WebSocket for hot reload
              `${isDev ? "" : "upgrade-insecure-requests;"}`,
          },
          {
            key: "X-Robots-Tag",
            value: "noindex",
          },
        ],
      },
      ...(process.env.NEXT_PUBLIC_WEBHOOK_BASE_HOST
        ? [
            {
              source: "/services/:path*",
              has: [
                {
                  type: "host",
                  value: process.env.NEXT_PUBLIC_WEBHOOK_BASE_HOST,
                },
              ],
              headers: [
                {
                  key: "X-Robots-Tag",
                  value: "noindex",
                },
              ],
            },
          ]
        : []),
      {
        source: "/api/webhooks/services/:path*",
        headers: [
          {
            key: "X-Robots-Tag",
            value: "noindex",
          },
        ],
      },
      {
        source: "/unsubscribe",
        headers: [
          {
            key: "X-Robots-Tag",
            value: "noindex",
          },
        ],
      },
    ];
  },
  experimental: {
    outputFileTracingIncludes: {
      "/api/mupdf/*": ["./node_modules/mupdf/dist/*.wasm"],
      // Jackson SAML routes need jose + openid-client for crypto
      "/api/auth/saml/token": [
        "./node_modules/jose/**/*",
        "./node_modules/openid-client/**/*",
      ],
      "/api/auth/saml/userinfo": [
        "./node_modules/jose/**/*",
        "./node_modules/openid-client/**/*",
      ],
    },
    missingSuspenseWithCSRBailout: false,
  },
  webpack: (config) => {
    // Stub out @google-cloud/kms - it's an optional dependency of @libpdf/core
    // that we don't use (only needed for KMS-based PDF encryption)
    config.resolve.alias = {
      ...config.resolve.alias,
      "@google-cloud/kms": false,
      "@google-cloud/secret-manager": false,
      // Jackson pulls TypeORM/Mongo optional drivers we don't use (Postgres-only setup).
      // Aliasing prevents noisy module resolution warnings in dev/build.
      mysql: false,
      "react-native-sqlite-storage": false,
      aws4: false,
      "@sap/hana-client": false,
      "@sap/hana-client/extension/Stream": false,
      "hdb-pool": false,
    };

    // Suppress critical dependency warnings from Jackson's dynamic requires
    config.module = {
      ...config.module,
      exprContextCritical: false,
    };

    return config;
  },
};

function prepareRemotePatterns() {
  let patterns = [
    // google profile images
    { protocol: "https", hostname: "lh3.googleusercontent.com" },
    // useragent img
    { protocol: "https", hostname: "faisalman.github.io" },
    // nobridge assets
    { protocol: "https", hostname: "room.nobridge.co" },
  ];

  // Default region patterns
  if (process.env.NEXT_PRIVATE_UPLOAD_DISTRIBUTION_HOST) {
    patterns.push({
      protocol: "https",
      hostname: process.env.NEXT_PRIVATE_UPLOAD_DISTRIBUTION_HOST,
    });
  }

  if (process.env.NEXT_PRIVATE_ADVANCED_UPLOAD_DISTRIBUTION_HOST) {
    patterns.push({
      protocol: "https",
      hostname: process.env.NEXT_PRIVATE_ADVANCED_UPLOAD_DISTRIBUTION_HOST,
    });
  }

  // US region patterns
  if (process.env.NEXT_PRIVATE_UPLOAD_DISTRIBUTION_HOST_US) {
    patterns.push({
      protocol: "https",
      hostname: process.env.NEXT_PRIVATE_UPLOAD_DISTRIBUTION_HOST_US,
    });
  }

  if (process.env.NEXT_PRIVATE_ADVANCED_UPLOAD_DISTRIBUTION_HOST_US) {
    patterns.push({
      protocol: "https",
      hostname: process.env.NEXT_PRIVATE_ADVANCED_UPLOAD_DISTRIBUTION_HOST_US,
    });
  }

  // Allow all Vercel Blob storage hostnames
  patterns.push({
    protocol: "https",
    hostname: "*.public.blob.vercel-storage.com",
  });

  return patterns;
}

export default nextConfig;
