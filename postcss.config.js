const isProd = process.env.NODE_ENV === 'production';

export default {
  plugins: {
    'tailwindcss': {},
    'autoprefixer': {},
    'postcss-nesting': {
      // Configure nesting to match CSS nesting spec
      noIsPseudoSelector: true,
      // Allow Tailwind at-rules
      allowDeclarationNesting: true
    },
    ...(isProd ? {
      'cssnano': {
        // Advanced optimizations for production
        preset: ['default', {
          discardComments: {
            removeAll: true,
          },
          normalizeWhitespace: true,
          minifyFontValues: true,
          colormin: true,
          // Ensure compatibility
          reduceIdents: false,
          zindex: false
        }]
      }
    } : {})
  }
};