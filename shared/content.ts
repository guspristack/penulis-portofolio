import { z } from 'zod';

export const categories = ['Esai', 'Catatan', 'Kuliner'] as const;
export const coverLabels = { none: 'Tanpa foto', city: 'Jalan kota', table: 'Meja dekat jendela', kitchen: 'Dapur keluarga' } as const;
export const essayDraft = z.strictObject({
  title: z.string().trim().min(1).max(110),
  category: z.enum(categories),
  summary: z.string().trim().max(350),
  body: z.string().trim().max(36000),
  cover: z.enum(['none', 'city', 'table', 'kitchen']),
  alt: z.string().trim().max(220),
  credit: z.string().trim().max(170),
});
export const slugSchema = z.string().min(2).max(90).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Gunakan huruf kecil, angka, dan tanda hubung.');
export const revisionSchema = z.strictObject({ revision: z.int().positive() });
export const loginSchema = z.strictObject({
  email: z.string().trim().toLowerCase().max(254).pipe(z.email()),
  password: z.string().min(1).max(256),
});

export type EssayDraft = z.infer<typeof essayDraft>;
export type EssaySummary = Omit<EssayDraft, 'body'> & { slug: string; publishedAt: string; readingMinutes: number };
export type PublishedEssay = EssaySummary & { body: string };
export type EssayEntry = {
  id: number;
  slug: string;
  title: string;
  category: EssayDraft['category'];
  revision: number;
  publishedRevision: number | null;
  publishedAt: string | null;
  updatedAt: string;
};
export type WorkingEssay = EssayEntry & { draft: EssayDraft };

export function wordCount(body: string) {
  return body.match(/[\p{L}\p{N}]+(?:['’\u2011-][\p{L}\p{N}]+)*/gu)?.length ?? 0;
}

export function slugFromTitle(title: string) {
  return title.toLowerCase().normalize('NFKD').replace(/\p{M}/gu, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 90).replace(/-$/, '');
}
