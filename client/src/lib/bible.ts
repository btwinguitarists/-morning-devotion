const BOOK_MAP: Record<string, string> = {
  'gen': 'GEN', 'genesis': 'GEN',
  'exo': 'EXO', 'exod': 'EXO', 'exodus': 'EXO', 'ex': 'EXO',
  'lev': 'LEV', 'leviticus': 'LEV',
  'num': 'NUM', 'numbers': 'NUM',
  'deu': 'DEU', 'deut': 'DEU', 'deuteronomy': 'DEU', 'dt': 'DEU',
  'josh': 'JOS', 'joshua': 'JOS', 'jos': 'JOS',
  'judg': 'JDG', 'judges': 'JDG', 'jdg': 'JDG',
  'ruth': 'RUT', 'rut': 'RUT',
  '1 sam': '1SA', '1sam': '1SA', '1 samuel': '1SA',
  '2 sam': '2SA', '2sam': '2SA', '2 samuel': '2SA',
  '1 kings': '1KI', '1kings': '1KI', '1 ki': '1KI', '1ki': '1KI', '1 kgs': '1KI',
  '2 kings': '2KI', '2kings': '2KI', '2 ki': '2KI', '2ki': '2KI', '2 kgs': '2KI',
  '1 chr': '1CH', '1chr': '1CH', '1 chron': '1CH', '1 chronicles': '1CH',
  '2 chr': '2CH', '2chr': '2CH', '2 chron': '2CH', '2 chronicles': '2CH',
  'ezra': 'EZR', 'ezr': 'EZR',
  'neh': 'NEH', 'nehemiah': 'NEH',
  'esth': 'EST', 'esther': 'EST', 'est': 'EST',
  'job': 'JOB',
  'ps': 'PSA', 'psa': 'PSA', 'psalm': 'PSA', 'psalms': 'PSA',
  'prov': 'PRO', 'pro': 'PRO', 'proverbs': 'PRO',
  'eccl': 'ECC', 'ecc': 'ECC', 'ecclesiastes': 'ECC',
  'song': 'SNG', 'sng': 'SNG', 'song of solomon': 'SNG', 'song of songs': 'SNG', 'sos': 'SNG',
  'isa': 'ISA', 'isaiah': 'ISA',
  'jer': 'JER', 'jeremiah': 'JER',
  'lam': 'LAM', 'lamentations': 'LAM',
  'ezek': 'EZK', 'ezk': 'EZK', 'ezekiel': 'EZK',
  'dan': 'DAN', 'daniel': 'DAN',
  'hos': 'HOS', 'hosea': 'HOS',
  'joel': 'JOL', 'jol': 'JOL',
  'amos': 'AMO', 'amo': 'AMO',
  'obad': 'OBA', 'oba': 'OBA', 'obadiah': 'OBA',
  'jonah': 'JON', 'jon': 'JON',
  'mic': 'MIC', 'micah': 'MIC',
  'nah': 'NAM', 'nam': 'NAM', 'nahum': 'NAM',
  'hab': 'HAB', 'habakkuk': 'HAB',
  'zeph': 'ZEP', 'zep': 'ZEP', 'zephaniah': 'ZEP',
  'hag': 'HAG', 'haggai': 'HAG',
  'zech': 'ZEC', 'zec': 'ZEC', 'zechariah': 'ZEC',
  'mal': 'MAL', 'malachi': 'MAL',
  'matt': 'MAT', 'mat': 'MAT', 'matthew': 'MAT', 'mt': 'MAT',
  'mark': 'MRK', 'mrk': 'MRK', 'mk': 'MRK',
  'luke': 'LUK', 'luk': 'LUK', 'lk': 'LUK',
  'john': 'JHN', 'jhn': 'JHN', 'jn': 'JHN',
  'acts': 'ACT', 'act': 'ACT',
  'rom': 'ROM', 'romans': 'ROM',
  '1 cor': '1CO', '1cor': '1CO', '1 corinthians': '1CO',
  '2 cor': '2CO', '2cor': '2CO', '2 corinthians': '2CO',
  'gal': 'GAL', 'galatians': 'GAL',
  'eph': 'EPH', 'ephesians': 'EPH',
  'phil': 'PHP', 'php': 'PHP', 'philippians': 'PHP',
  'col': 'COL', 'colossians': 'COL',
  '1 thess': '1TH', '1thess': '1TH', '1 thessalonians': '1TH', '1th': '1TH',
  '2 thess': '2TH', '2thess': '2TH', '2 thessalonians': '2TH', '2th': '2TH',
  '1 tim': '1TI', '1tim': '1TI', '1 timothy': '1TI', '1ti': '1TI',
  '2 tim': '2TI', '2tim': '2TI', '2 timothy': '2TI', '2ti': '2TI',
  'titus': 'TIT', 'tit': 'TIT',
  'philem': 'PHM', 'phm': 'PHM', 'philemon': 'PHM', 'phlm': 'PHM',
  'heb': 'HEB', 'hebrews': 'HEB',
  'james': 'JAS', 'jas': 'JAS',
  '1 pet': '1PE', '1pet': '1PE', '1 peter': '1PE', '1pe': '1PE',
  '2 pet': '2PE', '2pet': '2PE', '2 peter': '2PE', '2pe': '2PE',
  '1 john': '1JN', '1john': '1JN', '1jn': '1JN',
  '2 john': '2JN', '2john': '2JN', '2jn': '2JN',
  '3 john': '3JN', '3john': '3JN', '3jn': '3JN',
  'jude': 'JUD', 'jud': 'JUD',
  'rev': 'REV', 'revelation': 'REV', 'revelations': 'REV',
};

const BOOK_NAMES: Record<string, string> = {
  'GEN': 'Genesis', 'EXO': 'Exodus', 'LEV': 'Leviticus', 'NUM': 'Numbers',
  'DEU': 'Deuteronomy', 'JOS': 'Joshua', 'JDG': 'Judges', 'RUT': 'Ruth',
  '1SA': '1 Samuel', '2SA': '2 Samuel', '1KI': '1 Kings', '2KI': '2 Kings',
  '1CH': '1 Chronicles', '2CH': '2 Chronicles', 'EZR': 'Ezra', 'NEH': 'Nehemiah',
  'EST': 'Esther', 'JOB': 'Job', 'PSA': 'Psalms', 'PRO': 'Proverbs',
  'ECC': 'Ecclesiastes', 'SNG': 'Song of Songs', 'ISA': 'Isaiah', 'JER': 'Jeremiah',
  'LAM': 'Lamentations', 'EZK': 'Ezekiel', 'DAN': 'Daniel', 'HOS': 'Hosea',
  'JOL': 'Joel', 'AMO': 'Amos', 'OBA': 'Obadiah', 'JON': 'Jonah',
  'MIC': 'Micah', 'NAM': 'Nahum', 'HAB': 'Habakkuk', 'ZEP': 'Zephaniah',
  'HAG': 'Haggai', 'ZEC': 'Zechariah', 'MAL': 'Malachi', 'MAT': 'Matthew',
  'MRK': 'Mark', 'LUK': 'Luke', 'JHN': 'John', 'ACT': 'Acts',
  'ROM': 'Romans', '1CO': '1 Corinthians', '2CO': '2 Corinthians', 'GAL': 'Galatians',
  'EPH': 'Ephesians', 'PHP': 'Philippians', 'COL': 'Colossians',
  '1TH': '1 Thessalonians', '2TH': '2 Thessalonians', '1TI': '1 Timothy',
  '2TI': '2 Timothy', 'TIT': 'Titus', 'PHM': 'Philemon', 'HEB': 'Hebrews',
  'JAS': 'James', '1PE': '1 Peter', '2PE': '2 Peter', '1JN': '1 John',
  '2JN': '2 John', '3JN': '3 John', 'JUD': 'Jude', 'REV': 'Revelation',
};

export interface ChapterRef {
  bookId: string;
  bookName: string;
  chapter: number;
  label: string;
}

export function getBookName(bookId: string): string {
  return BOOK_NAMES[bookId] || bookId;
}

function resolveBookId(raw: string): string | null {
  const key = raw.toLowerCase().trim();
  if (BOOK_MAP[key]) return BOOK_MAP[key];
  for (const [k, v] of Object.entries(BOOK_MAP)) {
    if (key.startsWith(k)) return v;
  }
  return null;
}

export function parseReference(ref: string): ChapterRef[] {
  const trimmed = ref.trim();
  if (!trimmed) return [];

  const match = trimmed.match(/^(\d?\s*[A-Za-z]+(?:\s+[A-Za-z]+(?:\s+[A-Za-z]+)?)?)\s+(\d+)(?::[\d-]+)?(?:\s*[-–]\s*(\d+)(?::[\d-]+)?)?/);
  if (!match) return [];

  const bookRaw = match[1].trim();
  const startChapter = parseInt(match[2]);
  const endChapter = match[3] ? parseInt(match[3]) : startChapter;

  const bookId = resolveBookId(bookRaw);
  if (!bookId) return [];

  const bookName = BOOK_NAMES[bookId] || bookRaw;
  const chapters: ChapterRef[] = [];
  for (let ch = startChapter; ch <= endChapter; ch++) {
    chapters.push({
      bookId,
      bookName,
      chapter: ch,
      label: `${bookName} ${ch}`
    });
  }
  return chapters;
}

export function parseAllReferences(referencesStr: string): ChapterRef[] {
  const parts = referencesStr.split(/[;,]/).map(s => s.trim()).filter(Boolean);
  return parts.flatMap(parseReference);
}

export interface BibleVerse {
  number: number;
  text: string;
}

export interface ChapterData {
  bookId: string;
  bookName: string;
  chapter: number;
  verses: BibleVerse[];
}

const chapterCache = new Map<string, ChapterData>();

export async function fetchChapter(bookId: string, chapter: number): Promise<ChapterData> {
  const key = `${bookId}-${chapter}`;
  if (chapterCache.has(key)) return chapterCache.get(key)!;

  const res = await fetch(`https://bible.helloao.org/api/BSB/${bookId}/${chapter}.json`);
  if (!res.ok) throw new Error(`Failed to fetch ${bookId} ${chapter}`);

  const data = await res.json();
  const content = data.chapter?.content || [];
  const verses: BibleVerse[] = [];
  for (const item of content) {
    if (item.type === 'verse') {
      const text = (item.content || [])
        .map((c: any) => typeof c === 'string' ? c : c.text || '')
        .join(' ')
        .replace(/\s+/g, ' ')
        .trim();
      verses.push({ number: item.number, text });
    }
  }

  const result: ChapterData = {
    bookId,
    bookName: data.book?.name || getBookName(bookId),
    chapter,
    verses
  };

  chapterCache.set(key, result);
  return result;
}
