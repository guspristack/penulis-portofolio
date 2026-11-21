import { useEffect, useRef, useState, type FormEvent } from 'react';
import { ArrowLeft, ArrowUpRight, Bold, Heading2, Italic, Quote } from 'lucide-react';
import { Link } from 'react-router';
import { categories, coverLabels, slugFromTitle, wordCount, type EssayDraft, type WorkingEssay } from '../../shared/content';
import { errorText } from '../api';
import { Cover, EssayText } from '../EssayText';
import styles from './Admin.module.css';

export type AdminRequest = <T>(path: string, options?: { method?: string; data?: unknown }) => Promise<T>;

const empty: EssayDraft = { title: '', category: 'Esai', summary: '', body: '', cover: 'none', alt: '', credit: '' };
const formats = [
  { label: 'Tebal', start: '**', end: '**', icon: Bold },
  { label: 'Miring', start: '*', end: '*', icon: Italic },
  { label: 'Subjudul', start: '## ', end: '', icon: Heading2 },
  { label: 'Kutipan', start: '> ', end: '', icon: Quote },
] as const;

export function EssayEditor({ initial, request, onSaved, onRemoved, onClose }: {
  initial: WorkingEssay | null;
  request: AdminRequest;
  onSaved: (entry: WorkingEssay) => void;
  onRemoved: (id: number) => void;
  onClose: () => void;
}) {
  const [entry, setEntry] = useState(initial);
  const [draft, setDraft] = useState(initial?.draft ?? empty);
  const [slugEdit, setSlugEdit] = useState<string | null>(null);
  const [preview, setPreview] = useState(false);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const title = useRef<HTMLHeadingElement>(null);
  const text = useRef<HTMLTextAreaElement>(null);
  const published = entry?.publishedAt != null;
  const slug = entry?.slug ?? slugEdit ?? slugFromTitle(draft.title);
  const dirty = JSON.stringify(draft) !== JSON.stringify(entry?.draft ?? empty) || (!entry && Boolean(slugEdit));
  const words = wordCount(draft.body);

  useEffect(() => { title.current?.focus(); }, []);

  useEffect(() => {
    if (!dirty) return;
    const preventLoss = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = '';
    };
    window.addEventListener('beforeunload', preventLoss);
    return () => window.removeEventListener('beforeunload', preventLoss);
  }, [dirty]);

  function change<K extends keyof EssayDraft>(field: K, value: EssayDraft[K]) {
    setDraft((previous) => ({ ...previous, [field]: value }));
    setNotice('');
  }

  function leave() {
    if (!dirty || window.confirm('Tinggalkan perubahan yang belum disimpan?')) onClose();
  }

  function format(start: string, end: string) {
    const box = text.current;
    if (!box) return;
    const from = box.selectionStart;
    const to = box.selectionEnd;
    const selection = draft.body.slice(from, to);
    const breakLine = !end && from > 0 && draft.body[from - 1] !== '\n' ? '\n\n' : '';
    const prefix = breakLine + start;
    const body = draft.body.slice(0, from) + prefix + selection + end + draft.body.slice(to);
    if (body.length > 36000) return;
    change('body', body);
    requestAnimationFrame(() => {
      box.focus();
      box.setSelectionRange(from + prefix.length, to + prefix.length);
    });
  }

  async function run(action: () => Promise<void>) {
    setBusy(true);
    setError('');
    setNotice('');
    try {
      await action();
    } catch (cause) {
      setError(errorText(cause));
    } finally {
      setBusy(false);
    }
  }

  function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const submitter = (event.nativeEvent as SubmitEvent).submitter as HTMLElement | null;
    const publish = submitter?.dataset.publish === 'true';
    void run(async () => {
      const response = await request<WorkingEssay>('/admin/essays' + (entry ? '/' + entry.id : ''), {
        method: entry ? 'PUT' : 'POST',
        data: { draft, publish, ...(entry ? { revision: entry.revision } : { slug }) },
      });
      setEntry(response);
      setDraft(response.draft);
      onSaved(response);
      setNotice(publish ? 'Esai sudah terbit.' : 'Draf tersimpan.');
    });
  }

  function withdraw() {
    if (!entry || !window.confirm('Tarik esai dari halaman publik? Draf tetap tersimpan.')) return;
    void run(async () => {
      const response = await request<WorkingEssay>('/admin/essays/' + entry.id + '/withdraw', {
        method: 'POST', data: { revision: entry.revision },
      });
      setEntry(response);
      onSaved(response);
      setNotice('Publikasi ditarik. Draf tetap tersimpan.');
    });
  }

  function remove() {
    if (!entry || published || !window.confirm('Hapus draf ini?')) return;
    void run(async () => {
      await request('/admin/essays/' + entry.id, { method: 'DELETE', data: { revision: entry.revision } });
      onRemoved(entry.id);
    });
  }

  return (
    <section className={styles.editor} aria-labelledby="editor-heading">
      <button className={styles.back} type="button" onClick={leave} disabled={busy}><ArrowLeft size={17} aria-hidden="true" /> Daftar esai</button>
      <div className={styles.editorHeader}>
        <div>
          <h1 id="editor-heading" tabIndex={-1} ref={title}>{initial ? 'Sunting esai' : 'Tulis esai'}</h1>
          <p>{dirty ? 'Perubahan belum disimpan' : published && entry?.revision === entry?.publishedRevision ? 'Terbit' : published ? 'Ada revisi yang belum terbit' : 'Draf'}</p>
        </div>
        {published && <Link className={styles.secondary} to={'/?artikel=' + entry?.slug} target="_blank" rel="noopener">Buka versi publik <ArrowUpRight size={16} aria-hidden="true" /></Link>}
      </div>

      <form onSubmit={save}>
        <fieldset className={styles.editorFields} disabled={busy}>
          <div className={styles.manuscript}>
            <label>Judul<input name="title" value={draft.title} maxLength={110} onChange={(event) => change('title', event.target.value)} required /></label>
            <label>Ringkasan<textarea name="summary" value={draft.summary} rows={2} maxLength={350} onChange={(event) => change('summary', event.target.value)} /></label>
            <div className={styles.textHead}>
              <label htmlFor="essay-body">Isi esai</label>
              <div className={styles.toggle} aria-label="Tampilan naskah" role="group">
                <button type="button" aria-pressed={!preview} onClick={() => setPreview(false)}>Tulis</button>
                <button type="button" aria-pressed={preview} onClick={() => setPreview(true)}>Pratinjau</button>
              </div>
            </div>
            {preview ? (
              <div className={styles.preview} aria-label="Pratinjau naskah" role="region">
                <h2>{draft.title || 'Judul esai'}</h2>
                <Cover cover={draft.cover} alt={draft.alt} />
                {draft.body ? <EssayText body={draft.body} /> : <p>Isi esai akan muncul di sini.</p>}
              </div>
            ) : (
              <>
                <div className={styles.toolbar} role="group" aria-label="Format Markdown">
                  {formats.map(({ label, start, end, icon: Icon }) => (
                    <button type="button" key={label} onClick={() => format(start, end)} title={label}><Icon size={17} aria-hidden="true" /><span>{label}</span></button>
                  ))}
                </div>
                <textarea id="essay-body" name="body" ref={text} rows={15} maxLength={36000} value={draft.body}
                  placeholder="Mulai tulis esai di sini. Pisahkan paragraf dengan satu baris kosong."
                  onChange={(event) => change('body', event.target.value)} />
              </>
            )}
            <p className={styles.meta}>{words} kata · {Math.max(1, Math.ceil(words / 200))} menit baca</p>
          </div>
          <aside className={styles.settings} aria-labelledby="essay-settings">
            <h2 id="essay-settings">Detail esai</h2>
            <label>Alamat esai<input name="slug" value={slug} maxLength={90} minLength={2} pattern="[a-z0-9]+(-[a-z0-9]+)*" onChange={(event) => setSlugEdit(event.target.value)} readOnly={Boolean(entry)} required /></label>
            <label htmlFor="essay-category">Kategori</label>
            <select id="essay-category" value={draft.category} onChange={(event) => change('category', event.target.value as EssayDraft['category'])}>
              {categories.map((category) => <option key={category}>{category}</option>)}
            </select>
            <label htmlFor="essay-cover">Foto sampul</label>
            <select id="essay-cover" value={draft.cover} onChange={(event) => change('cover', event.target.value as EssayDraft['cover'])}>
              {Object.entries(coverLabels).map(([key, name]) => <option key={key} value={key}>{name}</option>)}
            </select>
            {draft.cover !== 'none' && <label>Teks alternatif sampul<input maxLength={220} value={draft.alt} onChange={(event) => change('alt', event.target.value)} /></label>}
            <label>Peran atau kredit<input maxLength={170} value={draft.credit} onChange={(event) => change('credit', event.target.value)} /></label>
            <div className={styles.editorActions}>
              <button type="submit" className={styles.secondary} data-publish="false">Simpan draf</button>
              <button type="submit" className={styles.primary} data-publish="true">{published ? 'Terbitkan revisi' : 'Terbitkan esai'}</button>
              {published ? <button type="button" className={styles.back} onClick={withdraw}>Tarik publikasi</button>
                : entry && <button type="button" className={styles.back} onClick={remove}>Hapus draf</button>}
            </div>
          </aside>
        </fieldset>
      </form>
      {busy && <p className={styles.meta} role="status">Memproses perubahan…</p>}
      {notice && <p className={styles.notice} role="status">{notice}</p>}
      {error && <p className={styles.error} role="alert">{error}</p>}
    </section>
  );
}
