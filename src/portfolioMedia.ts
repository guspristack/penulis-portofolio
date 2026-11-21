import portrait from './images/portrait-nara.webp';

export type SocialLink = { platform: 'instagram' | 'linkedin' | 'medium'; url?: string };
export type PortfolioMedia = { portrait: string; socials: readonly SocialLink[] };

export const portfolioMedia = {
  nara: { portrait, socials: [{ platform: 'instagram' }, { platform: 'linkedin' }, { platform: 'medium' }] },
} satisfies Record<string, PortfolioMedia>;
