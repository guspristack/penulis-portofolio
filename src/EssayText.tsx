import Markdown from 'react-markdown';
import type { EssayDraft } from '../shared/content';
import city from './images/editorial-hero.webp';
import table from './images/editorial-table.webp';
import kitchen from './images/editorial-kitchen.webp';
import styles from './EssayText.module.css';

export const covers = { none: null, city, table, kitchen };
export const dateLabel = new Intl.DateTimeFormat('id-ID', { dateStyle: 'long', timeZone: 'UTC' });

export function Cover({ cover, alt, priority }: Pick<EssayDraft, 'cover' | 'alt'> & { priority?: boolean }) {
  const source = covers[cover];
  return source && <img src={source} alt={alt} loading={priority ? 'eager' : 'lazy'} fetchPriority={priority ? 'high' : undefined} />;
}

export function EssayText({ body }: { body: string }) {
  return (
    <div className={styles.prose}>
      <Markdown skipHtml disallowedElements={['img', 'h1']} unwrapDisallowed>{body}</Markdown>
    </div>
  );
}
