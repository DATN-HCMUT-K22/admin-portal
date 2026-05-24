import type { Config } from 'tailwindcss'

const config: Config = {
  // Content paths for Tailwind to scan
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/hooks/**/*.{js,ts,jsx,tsx}',
    './src/providers/**/*.{js,ts,jsx,tsx}',
    // Don't scan node_modules to avoid purging Ant Design classes
  ],

  // Preserve existing CSS from other sources
  important: false,

  theme: {
    extend: {
      // Extend Ant Design theme colors
      colors: {
        'ant-primary': '#2563eb',      // From theme.ts
        'ant-success': '#52c41a',
        'ant-warning': '#fa8c16',
        'ant-error': '#ff4d4f',
        'ant-info': '#722ed1',
      },

      // Use Geist font (matching Ant Design config)
      fontFamily: {
        sans: ['var(--font-geist-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-geist-mono)', 'monospace'],
      },

      // Border radius to match Ant Design
      borderRadius: {
        'ant-sm': '8px',
        'ant-default': '12px',
        'ant-lg': '16px',
        'ant-xl': '20px',
      },

      // Shadows matching Ant Design
      boxShadow: {
        'ant-default': '0 2px 8px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.06)',
        'ant-secondary': '0 8px 24px rgba(0,0,0,0.08), 0 2px 8px rgba(0,0,0,0.04)',
      },

      // Breakpoints matching Ant Design
      screens: {
        'xs': '576px',   // Ant Design xs breakpoint
        'sm': '576px',   // Mobile landscape
        'md': '768px',   // Tablet
        'lg': '992px',   // Desktop (Ant Design collapses sidebar here)
        'xl': '1200px',  // Large desktop
        '2xl': '1600px', // Extra large
      },
    },
  },

  // Plugins
  plugins: [],
}

export default config
