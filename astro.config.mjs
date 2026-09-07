import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
const site = process.env.SITE_URL || undefined;
export default defineConfig({
  output: 'static',
  site,
  base: process.env.BASE_PATH || '/',
  integrations: site ? [sitemap()] : [],
  vite: { build: { modulePreload: false } },
});
