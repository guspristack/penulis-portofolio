import { Router } from 'express';
import { z } from 'zod';
import { essayDraft, revisionSchema, slugSchema, wordCount, type EssayDraft, type EssayEntry, type PublishedEssay } from '../shared/content';
import { Prisma, type Essay } from './generated/prisma/client';
import { prisma } from './database';
import { contentId, HttpError, validate } from './http';

const writeSchema = z.strictObject({ draft: essayDraft, publish: z.boolean() });

function checkForPublication(draft: EssayDraft) {
  if (!draft.summary || !wordCount(draft.body)) throw new HttpError(400, 'Lengkapi ringkasan dan isi esai sebelum menerbitkan.');
  if (draft.cover !== 'none' && !draft.alt) throw new HttpError(400, 'Isi teks alternatif sampul sebelum menerbitkan.');
}

function editorialFields(essay: Essay): EssayEntry {
  const { title, category } = essayDraft.parse(essay.draft);
  return {
    id: essay.id, slug: essay.slug, title, category, revision: essay.revision,
    publishedRevision: essay.publishedRevision, publishedAt: essay.publishedAt?.toISOString() ?? null, updatedAt: essay.updatedAt.toISOString(),
  };
}

function asPublished(essay: { slug: string; published: Prisma.JsonValue; publishedAt: Date | null }): PublishedEssay {
  if (!essay.publishedAt) throw new Error('Published essay is missing a date');
  const content = essayDraft.parse(essay.published);
  return {
    ...content, slug: essay.slug, publishedAt: essay.publishedAt.toISOString(),
    readingMinutes: Math.max(1, Math.ceil(wordCount(content.body) / 200)),
  };
}

function handleUpdate(rows: Essay[]) {
  if (!rows.length) throw new HttpError(409, 'Esai sudah berubah atau dihapus. Buka ulang untuk memuat versi terbaru.');
  const updated = rows[0];
  return { ...editorialFields(updated), draft: essayDraft.parse(updated.draft) };
}

export const publicRoutes = Router();
publicRoutes.get('/essays', async (_req, res) => {
  const rows = await prisma.essay.findMany({
    where: { publishedAt: { not: null } },
    orderBy: [{ publishedAt: 'desc' }, { id: 'desc' }],
    select: { slug: true, published: true, publishedAt: true },
  });
  res.json(rows.map((row) => {
    const { body: _body, ...summary } = asPublished(row);
    return summary;
  }));
});

publicRoutes.get('/essays/:slug', async (req, res) => {
  const slug = validate(slugSchema, req.params.slug);
  const essay = await prisma.essay.findUnique({
    where: { slug, publishedAt: { not: null } },
    select: { slug: true, published: true, publishedAt: true },
  });
  if (!essay) throw new HttpError(404, 'Esai tidak tersedia.');
  res.json(asPublished(essay));
});

export const adminRoutes = Router();
adminRoutes.get('/essays', async (_req, res) => {
  const essays = await prisma.essay.findMany({ orderBy: [{ updatedAt: 'desc' }, { id: 'desc' }] });
  res.json(essays.map(editorialFields));
});

adminRoutes.get('/essays/:id', async (req, res) => {
  const essay = await prisma.essay.findUnique({ where: { id: contentId(req.params.id) } });
  if (!essay) throw new HttpError(404, 'Esai tidak tersedia.');
  res.json({ ...editorialFields(essay), draft: essayDraft.parse(essay.draft) });
});

adminRoutes.post('/essays', async (req, res) => {
  const { draft, publish, slug } = validate(writeSchema.extend({ slug: slugSchema }), req.body);
  if (publish) checkForPublication(draft);
  const essay = await prisma.essay.create({
    data: {
      slug, draft,
      ...(publish ? { published: draft, publishedRevision: 1, publishedAt: new Date() } : {}),
    },
  });
  res.status(201).json({ ...editorialFields(essay), draft });
});

adminRoutes.put('/essays/:id', async (req, res) => {
  const id = contentId(req.params.id);
  const { draft, publish, revision } = validate(writeSchema.extend(revisionSchema.shape), req.body);
  if (publish) checkForPublication(draft);
  const existing = publish ? await prisma.essay.findUnique({ where: { id }, select: { publishedAt: true } }) : null;
  const rows = await prisma.essay.updateManyAndReturn({
    where: { id, revision },
    data: {
      draft, revision: { increment: 1 },
      ...(publish ? { published: draft, publishedAt: existing?.publishedAt ?? new Date(), publishedRevision: revision + 1 } : {}),
    },
  });
  res.json(handleUpdate(rows));
});

adminRoutes.post('/essays/:id/withdraw', async (req, res) => {
  const id = contentId(req.params.id);
  const { revision } = validate(revisionSchema, req.body);
  const rows = await prisma.essay.updateManyAndReturn({
    where: { id, revision, publishedAt: { not: null } },
    data: { revision: { increment: 1 }, published: Prisma.DbNull, publishedAt: null, publishedRevision: null },
  });
  res.json(handleUpdate(rows));
});

adminRoutes.delete('/essays/:id', async (req, res) => {
  const id = contentId(req.params.id);
  const { revision } = validate(revisionSchema, req.body);
  const { count } = await prisma.essay.deleteMany({ where: { id, revision, publishedAt: null } });
  if (!count) throw new HttpError(409, 'Draf sudah berubah atau masih terbit. Buka ulang untuk memeriksa statusnya.');
  res.sendStatus(204);
});
