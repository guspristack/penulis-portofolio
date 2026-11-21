import { portfolioMedia, type PortfolioMedia } from './portfolioMedia';

export type PortfolioProfile = {
  id: string;
  name: string;
  profession: string;
  location: string;
  bio: string;
  specialty: string;
  contactFor: string;
  media: PortfolioMedia;
  experience: ReadonlyArray<{ period: string; title: string; description: string }>;
};

export const profiles = {
  nara: {
    id: 'nara',
    media: portfolioMedia.nara,
    name: 'Nara Adinata',
    profession: 'Penulis esai & feature',
    location: 'Yogyakarta, Indonesia',
    bio: 'Saya menulis tentang kota, makanan, dan kebiasaan sehari-hari. Saya mengembangkan cerita dari pengamatan, detail suasana, dan proses penyuntingan yang menjaga suara narator.',
    specialty: 'Esai budaya, feature kuliner, dan catatan perjalanan',
    contactFor: 'Untuk penugasan editorial, esai, dan feature budaya atau kuliner.',
    experience: [
      { period: 'Jun–Okt 2026', title: 'Kumpulan esai tentang kota', description: 'Mengembangkan catatan pengamatan menjadi esai pendek dan menentukan sudut pandang tiap tulisan.' },
      { period: 'Agu–Nov 2025', title: 'Eksplorasi tulisan kuliner', description: 'Menyunting cerita tentang resep keluarga dan menguji alur dari ingatan pribadi ke konteks budaya.' },
    ],
  },
} satisfies Record<string, PortfolioProfile>;
