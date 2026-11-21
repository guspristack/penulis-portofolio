import { ArrowUpRight, LockKeyhole, Mail } from 'lucide-react';
import type { ReactNode } from 'react';
import { Link } from 'react-router';
import { scrollToSection, SectionNav } from './components';
import { PortraitPanel, ProfileAvatar, SocialLinks } from './PortfolioIdentity';
import type { PortfolioProfile } from './portfolioProfiles';
import styles from './PortfolioProfile.module.css';

type SectionLink = { title: string; target: string };

export function PortfolioHeader({
  children, profile, work, className, shell, galleryClass, leadingGallery = false,
}: {
  children: ReactNode;
  profile: PortfolioProfile;
  work: SectionLink;
  className: string;
  shell: string;
  galleryClass: string;
  leadingGallery?: boolean;
}) {
  const { id, name } = profile;
  const admin = <Link to="/admin" className={styles.gallery + ' ' + galleryClass}><LockKeyhole size={15} aria-hidden="true" /> Admin</Link>;
  return (
    <header className={className} id={id + '-awal'} tabIndex={-1}>
      <div className={styles.headerRow + ' ' + (leadingGallery ? styles.leadingGallery + ' ' : '') + shell}>
        {leadingGallery && admin}
        <div className={styles.identity}><ProfileAvatar portrait={profile.media.portrait} />{children}</div>
        <SectionNav className={styles.nav} label={'Navigasi portofolio ' + name} items={[
          { title: 'Profil', target: id + '-profil' },
          { title: 'Pengalaman', target: id + '-pengalaman' },
          work,
          { title: 'Kontak', target: id + '-kontak' },
        ]} />
        {!leadingGallery && admin}
      </div>
    </header>
  );
}

export function PortfolioDetails({ profile, className }: { profile: PortfolioProfile; className?: string }) {
  const { id, name, profession, location, bio, specialty, contactFor, experience, media } = profile;
  const email = id + '@ruangkarya.example';
  const emailNote = id + '-email-note';

  return (
    <div className={className}>
      <section className={styles.section} aria-labelledby={id + '-profil'}>
        <PortraitPanel portrait={media.portrait} name={name}>
          <h2 id={id + '-profil'} tabIndex={-1}>Tentang {name.split(' ')[0]}</h2>
          <p className={styles.meta}>{profession} · {location}</p>
        </PortraitPanel>
        <div>
          <p>{bio}</p>
          <dl className={styles.facts}><div><dt>Fokus</dt><dd>{specialty}</dd></div></dl>
        </div>
      </section>
      <section className={styles.section} aria-labelledby={id + '-pengalaman'}>
        <div>
          <h2 id={id + '-pengalaman'} tabIndex={-1}>Pengalaman</h2>
          <p className={styles.meta}>Riwayat contoh untuk profil fiktif.</p>
        </div>
        <ol className={styles.timeline}>
          {experience.map(({ period, title, description }) => (
            <li key={title}><span>{period}</span><div><h3>{title}</h3><p>{description}</p></div></li>
          ))}
        </ol>
      </section>
      <section className={styles.section} aria-labelledby={id + '-kontak'}>
        <div><h2 id={id + '-kontak'} tabIndex={-1}>Kontak</h2><p className={styles.meta}>{contactFor}</p></div>
        <div>
          <a className={styles.email} href={'mailto:' + email} aria-describedby={emailNote}><Mail size={17} aria-hidden="true" /><span>{email}</span></a>
          <p className={styles.note} id={emailNote}>Alamat email contoh untuk prototipe.</p>
          <SocialLinks name={name} id={id} links={media.socials} />
        </div>
      </section>
    </div>
  );
}

export function PortfolioTop({ profile }: { profile: PortfolioProfile }) {
  return <button className={styles.top} type="button" onClick={() => scrollToSection(profile.id + '-awal')}>Kembali ke atas <ArrowUpRight size={15} aria-hidden="true" /></button>;
}

export function WorkCredits({ entries, className }: { entries: ReadonlyArray<readonly [string, string]>; className?: string }) {
  return (
    <dl className={styles.credits + (className ? ' ' + className : '')} aria-label="Kredit karya">
      {entries.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}
    </dl>
  );
}
