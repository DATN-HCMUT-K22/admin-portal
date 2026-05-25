# Admin Dashboard

Admin portal built with Next.js 16, Ant Design v6, and Tailwind CSS v4.

## Tech Stack

- **Framework:** Next.js 16.2.3 (App Router)
- **UI Library:** Ant Design v6.4.3
- **Styling:** Tailwind CSS v4.0 + CSS Layers
- **State Management:** Zustand v5 + React Query v5
- **Forms:** Ant Design Form (with built-in validation)
- **Type Safety:** TypeScript v5 + Zod v4
- **Icons:** Ant Design Icons

## Styling Approach

This project uses a **hybrid styling system**:

### Ant Design v6
- UI component library
- Custom theme configuration in `src/config/theme.ts`
- Dark sidebar + glassmorphism header design
- All interactive components (buttons, forms, tables, modals)

### Tailwind CSS v4
- Utility-first CSS framework
- Layout utilities (flex, grid)
- Spacing utilities (padding, margin, gap)
- Responsive design utilities
- Configuration in `tailwind.config.ts`

**Usage Guidelines:**
- Use **Ant Design** for UI components
- Use **Tailwind** for layout and spacing
- See [docs/tailwind-usage-guide.md](docs/tailwind-usage-guide.md)
- See [docs/tailwind-antd-integration.md](docs/tailwind-antd-integration.md)

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:5173](http://localhost:5173) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
