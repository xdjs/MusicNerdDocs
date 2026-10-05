import manifest from '../content/manifest.json';
import { docHref } from './docs-paths';
export { docHref, headingId, resolveDocsHref } from './docs-paths';

export type DocPage = {
  slug: string; title: string; description: string; category: string; group: string;
  source: string; body: string; searchText: string; compiled?: string; gap?: string;
  headings: {title: string; id: string}[];
  api?: {method: string; path: string; spec: string | null};
};
export const docs: DocPage[] = manifest as DocPage[];
export const docsRoutes = ['/', '/api-reference', ...docs.filter(p=>p.slug).map(p=>docHref(p.slug))];
export const docsCategories = [...new Set(docs.map(page=>page.category))];
