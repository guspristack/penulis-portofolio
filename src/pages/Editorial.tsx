import { ArrowUpRight, X } from 'lucide-react';
import { useState } from 'react';
import { categories, type EssaySummary, type PublishedEssay } from '../../shared/content';
import { useResource } from '../api';
import { CopyWorkLink, Overlay, ProjectCredit, ResourceState } from '../components';
import { Cover, dateLabel, EssayText } from '../EssayText';
import { PortfolioDetails, PortfolioHeader, PortfolioTop, WorkCredits } from '../PortfolioProfile';
import { profiles } from '../portfolioProfiles';
import { useWorkDialog } from '../useWorkDialog';
import styles from './Editorial.module.css';

const filters = ['Semua', ...categories] as const;
const profile = profiles.nara;

function Reader({ slug, onClose }: { slug: string; onClose: () => void }) {
  const { data, error, retry } = useResource<PublishedEssay>('/essays/' + encodeURIComponent(slug));

  return (
    <Overlay className={styles.dialog} label={data?.title ?? 'Pembaca esai'} onClose={onClose}>
      <article className={styles.reader}>
        <button className={styles.close} type="button" aria-label="Tutup tulisan" onClick={onClose} autoFocus><X size={21} aria-hidden="true" /></button>
        {data ? (
          <>
            <p className={styles.info}>{profile.name} · {data.category} · {dateLabel.format(new Date(data.publishedAt))} · {data.readingMinutes} menit baca</p>
            <h2 className={styles.readerTitle}>{data.title}</h2>
            <Cover cover={data.cover} alt={data.alt} priority />
            <EssayText body={data.body} />
            <WorkCredits entries={[
              ['Kredit & peran', profile.name + ' · ' + (data.credit || 'Penulisan dan penyuntingan')],
              ...(data.cover === 'none' ? [] : [['Visual', 'Ilustrasi editorial generatif · ImageGen']] as const),
            ]} />
            <CopyWorkLink label="Salin tautan tulisan" />
          </>
        ) : error ? (
          <div><p role="alert">{error}</p><button type="button" className={styles.read} onClick={retry}>Coba lagi</button></div>
        ) : <p role="status">Memuat esai…</p>}
      </article>
    </Overlay>
  );
}

export function Editorial() {
  const [filter, setFilter] = useState<(typeof filters)[number]>('Semua');
  const { params, openWork, closeWork } = useWorkDialog('artikel');
  const { data, error, retry } = useResource<EssaySummary[]>('/essays');
  if (!data) return <ResourceState loading="Memuat portofolio Nara…" error={error} retry={retry} />;
  const slug = params.get('artikel');
  const featured = data[0];
  const visible = data.filter((article) => filter === 'Semua' || article.category === filter);
  const originalHeadline = featured?.title === 'Kota yang berjalan pelan.';
  const hasHeroPhoto = featured && featured.cover !== 'none';

  function openArticle(article: EssaySummary) {
    openWork({ artikel: article.slug });
  }

  return (
    <div className={styles.page}>
      <PortfolioHeader profile={profile} work={{ title: 'Tulisan', target: 'tulisan' }} className={styles.header} shell={styles.shell} galleryClass={styles.back} leadingGallery>
        <span className={styles.name}>Nara Adinata<span>.</span></span>
      </PortfolioHeader>
      <main id="main-content" tabIndex={-1} className={styles.shell}>
        <section className={styles.hero + (hasHeroPhoto ? '' : ' ' + styles.heroTextOnly)} aria-labelledby="nara-headline">
          <div className={styles.heroContent}>
            <p className={styles.kicker}><span /> Nara Adinata · Penulis esai &amp; feature</p>
            <h1 id="nara-headline">{originalHeadline ? <>Kota yang<br /><em>berjalan pelan.</em></> : featured?.title ?? 'Esai dan catatan.'}</h1>
            <p className={styles.intro}>{featured?.summary ?? profile.bio}</p>
            {featured && <button type="button" className={styles.read} onClick={() => openArticle(featured)}>Baca esai <ArrowUpRight size={17} aria-hidden="true" /></button>}
          </div>
          {hasHeroPhoto && (
            <figure className={styles.heroPhoto}>
              <Cover cover={featured.cover} alt={featured.alt} priority />
              {originalHeadline && featured.cover === 'city' && <figcaption>Yogyakarta, Jawa</figcaption>}
            </figure>
          )}
        </section>
        <section className={styles.works} aria-labelledby="tulisan">
          <div className={styles.worksHeader}>
            <h2 id="tulisan" tabIndex={-1}>Tulisan pilihan</h2>
            <div className={styles.filters} role="group" aria-label="Saring berdasarkan jenis tulisan">
              {filters.map((item) => (
                <button type="button" key={item} aria-pressed={filter === item} onClick={() => setFilter(item)}>{item}</button>
              ))}
            </div>
          </div>
          {!visible.length && <p role="status">Belum ada tulisan dalam pilihan ini.</p>}
          <div className={styles.worksGrid}>
            {visible.map((article) => (
              <button type="button" key={article.slug} className={styles.articleCard} onClick={() => openArticle(article)}>
                <Cover cover={article.cover} alt={article.alt} />
                <span className={styles.info}>{article.category} <span>·</span> {dateLabel.format(new Date(article.publishedAt))} <span>·</span> Nara Adinata</span>
                <span className={styles.articleTitle}>{article.title} <ArrowUpRight size={19} aria-hidden="true" /></span>
                <span className={styles.excerpt}>{article.summary}</span>
              </button>
            ))}
          </div>
        </section>
        <PortfolioDetails profile={profile} />
      </main>
      <footer className={styles.footer + ' ' + styles.shell}>
        <div><span>Portofolio penulis fiktif · Foto generatif</span><ProjectCredit /></div>
        <PortfolioTop profile={profile} />
      </footer>
      {slug && <Reader key={slug} slug={slug} onClose={closeWork} />}
    </div>
  );
}
