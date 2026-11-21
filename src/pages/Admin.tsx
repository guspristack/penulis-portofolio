import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { ArrowUpRight, LockKeyhole, LogOut, Pencil, Plus } from 'lucide-react';
import { Link } from 'react-router';
import type { EssayEntry, WorkingEssay } from '../../shared/content';
import { api, ApiError, errorText } from '../api';
import { ProjectCredit, ResourceState } from '../components';
import { dateLabel } from '../EssayText';
import { EssayEditor, type AdminRequest } from './EssayEditor';
import styles from './Admin.module.css';

type View = { step: 'loading' | 'login' } | { step: 'error'; message: string } | { step: 'ready'; entries: EssayEntry[] };
const filters = ['Semua', 'Draf', 'Terbit'] as const;

function statusLabel(entry: EssayEntry) {
  if (!entry.publishedAt) return 'Draf';
  return entry.publishedRevision === entry.revision ? 'Terbit' : 'Ada revisi';
}

function Login({ onLogin }: { onLogin: (entries: EssayEntry[]) => void }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(event.currentTarget));
    setBusy(true);
    setError('');
    try {
      await api('/admin/login', { method: 'POST', data });
      onLogin(await api<EssayEntry[]>('/admin/essays'));
    } catch (cause) {
      setError(errorText(cause));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className={styles.page}>
      <main className={styles.loginShell}>
        <Link className={styles.back} to="/">Portofolio Nara <ArrowUpRight size={15} aria-hidden="true" /></Link>
        <section className={styles.login} aria-labelledby="login-heading">
          <span className={styles.loginIcon}><LockKeyhole size={22} aria-hidden="true" /></span>
          <h1 id="login-heading">Masuk ke studio</h1>
          <p>Tulis, sunting, dan terbitkan esai Nara Adinata.</p>
          <form onSubmit={submit}>
            <fieldset className={styles.loginFields} disabled={busy}>
              <label>Email admin<input type="email" name="email" maxLength={254} autoComplete="username" required /></label>
              <label>Kata sandi<input type="password" name="password" maxLength={256} autoComplete="current-password" required /></label>
              <button type="submit" className={styles.primary}>{busy ? 'Memeriksa…' : 'Masuk'}</button>
            </fieldset>
            {error && <p className={styles.error} role="alert">{error}</p>}
          </form>
        </section>
        <footer className={styles.footer}><ProjectCredit /></footer>
      </main>
    </div>
  );
}

export default function Admin() {
  const [view, setView] = useState<View>({ step: 'loading' });
  const [attempt, setAttempt] = useState(0);
  const [filter, setFilter] = useState<(typeof filters)[number]>('Semua');
  const [editor, setEditor] = useState<'new' | WorkingEssay | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  useEffect(() => {
    const controller = new AbortController();
    api<EssayEntry[]>('/admin/essays', { signal: controller.signal }).then((entries) => {
      if (!controller.signal.aborted) setView({ step: 'ready', entries });
    }, (cause) => {
      if (controller.signal.aborted) return;
      setView(cause instanceof ApiError && cause.status === 401 ? { step: 'login' } : { step: 'error', message: errorText(cause) });
    });
    return () => controller.abort();
  }, [attempt]);

  const request: AdminRequest = useCallback(async <T,>(path: string, options?: { method?: string; data?: unknown }) => {
    try {
      return await api<T>(path, options);
    } catch (cause) {
      if (cause instanceof ApiError && cause.status === 401) {
        setEditor(null);
        setView({ step: 'login' });
      }
      throw cause;
    }
  }, []);

  async function open(id: number) {
    setBusy(true);
    setError('');
    setNotice('');
    try {
      setEditor(await request<WorkingEssay>('/admin/essays/' + id));
    } catch (cause) {
      setError(errorText(cause));
    } finally {
      setBusy(false);
    }
  }

  async function logout() {
    setBusy(true);
    setError('');
    try {
      await request('/admin/logout', { method: 'POST' });
      setView({ step: 'login' });
    } catch (cause) {
      setError(errorText(cause));
    } finally {
      setBusy(false);
    }
  }

  function changeEntries(update: (entries: EssayEntry[]) => EssayEntry[]) {
    setView((previous) => previous.step === 'ready' ? { step: 'ready', entries: update(previous.entries) } : previous);
  }

  if (view.step === 'login') return <Login onLogin={(entries) => {
    setError('');
    setNotice('');
    setFilter('Semua');
    setView({ step: 'ready', entries });
  }} />;
  if (view.step !== 'ready') return <ResourceState loading="Memuat studio…" error={view.step === 'error' ? view.message : undefined}
    retry={() => { setView({ step: 'loading' }); setAttempt((value) => value + 1); }} />;
  const visible = view.entries.filter((entry) => filter === 'Semua' || (filter === 'Terbit') === Boolean(entry.publishedAt));

  return (
    <div className={styles.page}>
      <header className={styles.topBar}>
        <div className={styles.shell}>
          <span className={styles.wordmark}>Studio Nara<span>.</span></span>
          <div className={styles.actions}>
            <Link className={styles.back} to="/" target={editor ? '_blank' : undefined} rel={editor ? 'noopener' : undefined}>Portofolio <ArrowUpRight size={15} aria-hidden="true" /></Link>
            {!editor && <button className={styles.secondary} type="button" onClick={logout} disabled={busy}><LogOut size={16} aria-hidden="true" /> Keluar</button>}
          </div>
        </div>
      </header>
      <main className={styles.shell + ' ' + styles.dashboard}>
        {editor ? (
          <EssayEditor initial={editor === 'new' ? null : editor} request={request} onClose={() => setEditor(null)}
            onSaved={(saved) => changeEntries((entries) => [saved, ...entries.filter(({ id }) => id !== saved.id)])}
            onRemoved={(id) => {
              changeEntries((entries) => entries.filter((entry) => entry.id !== id));
              setEditor(null);
              setNotice('Draf dihapus.');
            }} />
        ) : (
          <>
            <div className={styles.editorHeader}>
              <div><h1>Esai Nara</h1><p>Kelola draf dan tulisan terbit.</p></div>
              <button type="button" className={styles.primary} onClick={() => { setEditor('new'); setError(''); setNotice(''); }} disabled={busy}>
                <Plus size={18} aria-hidden="true" /> Tulis esai
              </button>
            </div>
            <div className={styles.filterBar}>
              <div className={styles.toggle} role="group" aria-label="Saring esai berdasarkan status">
                {filters.map((option) => <button type="button" key={option} aria-pressed={filter === option} onClick={() => setFilter(option)}>{option}</button>)}
              </div>
              <p className={styles.meta}>{visible.length} esai</p>
            </div>
            {visible.length ? (
              <ul className={styles.entries}>
                {visible.map((entry) => (
                  <li key={entry.id}>
                    <div>
                      <p className={styles.meta}>{entry.category} · {dateLabel.format(new Date(entry.updatedAt))}</p>
                      <h2>{entry.title}</h2>
                      <span className={styles.status}>{statusLabel(entry)}</span>
                    </div>
                    <div className={styles.actions}>
                      {entry.publishedAt && <Link className={styles.back} to={'/?artikel=' + entry.slug} aria-label={'Lihat ' + entry.title}>Lihat <ArrowUpRight size={16} aria-hidden="true" /></Link>}
                      <button className={styles.secondary} type="button" onClick={() => open(entry.id)} disabled={busy}
                        aria-label={'Sunting ' + entry.title}><Pencil size={15} aria-hidden="true" /> Sunting</button>
                    </div>
                  </li>
                ))}
              </ul>
            ) : <p className={styles.empty}>Belum ada esai dalam pilihan ini.</p>}
            {notice && <p className={styles.notice} role="status">{notice}</p>}
            {error && <p className={styles.error} role="alert">{error}</p>}
          </>
        )}
      </main>
      <footer className={styles.shell + ' ' + styles.footer}><ProjectCredit /></footer>
    </div>
  );
}
