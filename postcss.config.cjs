const isProd = process.env.NODE_ENV === "production";

module.exports = {
  plugins: [
    require("@tailwindcss/postcss"),
    require("postcss-nesting"),
    require("autoprefixer"),
    ...(isProd
      ? [
          require("cssnano")({
            preset: [
              "default",
              {
                discardComments: { removeAll: true },
                normalizeWhitespace: true,
                minifyFontValues: true,
                colormin: true,
                reduceIdents: false,
                zindex: false,
              },
            ],
          }),
        ]
      : []),
  ],
};
