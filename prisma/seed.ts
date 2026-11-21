import { disconnectDatabase, prisma } from '../server/database';

const articles = [
  {
    id: 'kota-yang-berjalan-pelan',
    title: 'Kota yang berjalan pelan.',
    category: 'Esai',
    date: '2026-10-12T00:00:00.000Z',
    cover: 'city',
    alt: 'Pesepeda melintas di depan ruko tua setelah hujan pagi.',
    description: 'Menyusuri pagi di Yogyakarta dan memperhatikan hal-hal kecil yang biasanya terlewat.',
    role: 'Penulisan esai dan penyuntingan narasi',
    paragraphs: [
      'Setelah hujan reda, seorang pesepeda melewati deretan ruko yang baru separuh buka. Dari balik kaca kedai, saya bisa mendengar bunyi rodanya membelah genangan. Di meja sebelah, seorang perempuan sedang melipat koran. Tak ada yang terburu-buru untuk pergi.',
      'Saya biasa menyeberangi jalan ini dengan satu tujuan saja: sampai. Pagi itu, ketika saya duduk lebih lama, saya mulai mengenali bunyi yang selama ini saling menutupi. Sendok yang menyentuh cangkir. Pintu besi yang didorong ke atas. Suara orang menyapa tanpa perlu menoleh.',
      'Ketika akhirnya berjalan pulang, saya mengambil gang yang lebih panjang. Jalan utama sudah ramai. Di ujung gang, seseorang baru saja menaruh dua kursi menghadap matahari. Saya masih ingat warna kursinya, sesuatu yang mungkin luput kalau saya pulang sepuluh menit lebih awal.',
    ],
  },
  {
    id: 'dari-meja-dekat-jendela',
    title: 'Dari meja dekat jendela',
    category: 'Catatan',
    date: '2026-09-27T00:00:00.000Z',
    cover: 'table',
    alt: 'Buku catatan terbuka dan cangkir kopi di atas meja kayu.',
    description: 'Tentang menemukan tempat yang pas untuk menulis dan membiarkan hari berjalan.',
    role: 'Penulisan catatan dan penyuntingan akhir',
    paragraphs: [
      'Meja dekat jendela itu sedikit goyah. Saya menyelipkan lipatan kertas di bawah salah satu kakinya, lalu menunggu kopi datang. Cahaya pagi jatuh hanya sampai tepi halaman.',
      'Di sana saya menulis satu kalimat tentang sesuatu yang saya lihat di jalan. Saya membiarkan kalimat itu sendirian beberapa menit. Kadang satu kalimat baru terasa cukup setelah saya memberinya waktu.',
    ],
  },
  {
    id: 'rasa-yang-diwariskan',
    title: 'Rasa yang diwariskan',
    category: 'Kuliner',
    date: '2026-09-08T00:00:00.000Z',
    cover: 'kitchen',
    alt: 'Tangan menata daun pandan dan bumbu dapur di dekat cobek batu.',
    description: 'Mengikuti jejak sebuah resep dari tangan ke tangan di dapur keluarga.',
    role: 'Penulisan feature kuliner dan penyuntingan naskah',
    paragraphs: [
      'Di dapur ibu, daun pandan diikat dengan satu simpul. Jahe dimemarkan dengan bagian belakang pisau. Ketika saya bertanya seberapa banyak air yang perlu ditambahkan, ibu menunjuk ruas jarinya.',
      'Di rumah sendiri saya mencoba mengulangnya. Saya membuka tutup panci sebelum waktunya dan langsung mencium wangi yang saya kenal. Besoknya saya menelepon ibu, kali ini untuk menanyakan cara membuat simpul pandan itu.',
    ],
  },
] as const;

try {
  const data = articles.map(({ id, date, title, category, description, paragraphs, cover, alt, role }) => {
    const draft = { title, category, summary: description, body: paragraphs.join('\n\n'), cover, alt, credit: role };
    return { slug: id, draft, published: draft, publishedAt: new Date(date), publishedRevision: 1 };
  });
  await prisma.essay.createMany({ data, skipDuplicates: true });
  console.log('Tiga esai awal tersedia. Perubahan yang sudah tersimpan dipertahankan.');
} finally {
  await disconnectDatabase();
}
