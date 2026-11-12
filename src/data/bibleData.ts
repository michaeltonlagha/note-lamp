// KJV Bible data — a representative selection of books and chapters for the prototype.
// Structured for quick lookup by reference.

export interface BibleVerse {
  verse: number;
  text: string;
}

export interface BibleChapter {
  chapter: number;
  verses: BibleVerse[];
}

export interface BibleBook {
  name: string;
  abbrev: string;
  testament: 'OT' | 'NT';
  chapters: BibleChapter[];
}

export const bibleData: BibleBook[] = [
  {
    name: 'Genesis',
    abbrev: 'Gen',
    testament: 'OT',
    chapters: [
      {
        chapter: 1,
        verses: [
          { verse: 1, text: 'In the beginning God created the heaven and the earth.' },
          { verse: 2, text: 'And the earth was without form, and void; and darkness was upon the face of the deep. And the Spirit of God moved upon the face of the waters.' },
          { verse: 3, text: 'And God said, Let there be light: and there was light.' },
          { verse: 4, text: 'And God saw the light, that it was good: and God divided the light from the darkness.' },
          { verse: 5, text: 'And God called the light Day, and the darkness he called Night. And the evening and the morning were the first day.' },
          { verse: 26, text: 'And God said, Let us make man in our image, after our likeness: and let them have dominion over the fish of the sea, and over the fowl of the air, and over the cattle, and over all the earth, and over every creeping thing that creepeth upon the earth.' },
          { verse: 27, text: 'So God created man in his own image, in the image of God created he him; male and female created he them.' },
        ],
      },
    ],
  },
  {
    name: 'Exodus',
    abbrev: 'Exod',
    testament: 'OT',
    chapters: [
      { chapter: 20, verses: [
        { verse: 1, text: 'And God spake all these words, saying,' },
        { verse: 2, text: 'I am the LORD thy God, which have brought thee out of the land of Egypt, out of the house of bondage.' },
        { verse: 3, text: 'Thou shalt have no other gods before me.' },
      ]},
    ],
  },
  {
    name: 'Psalms',
    abbrev: 'Ps',
    testament: 'OT',
    chapters: [
      { chapter: 23, verses: [
        { verse: 1, text: 'The LORD is my shepherd; I shall not want.' },
        { verse: 2, text: 'He maketh me to lie down in green pastures: he leadeth me beside the still waters.' },
        { verse: 3, text: 'He restoreth my soul: he leadeth me in the paths of righteousness for his name sake.' },
        { verse: 4, text: 'Yea, though I walk through the valley of the shadow of death, I will fear no evil: for thou art with me; thy rod and thy staff they comfort me.' },
        { verse: 5, text: 'Thou preparest a table before me in the presence of mine enemies: thou anointest my head with oil; my cup runneth over.' },
        { verse: 6, text: 'Surely goodness and mercy shall follow me all the days of my life: and I will dwell in the house of the LORD for ever.' },
      ]},
      { chapter: 1, verses: [
        { verse: 1, text: 'Blessed is the man that walketh not in the counsel of the ungodly, nor standeth in the manner of sinners, nor sitteth in the seat of the scornful.' },
        { verse: 2, text: 'But his delight is in the law of the LORD; and in his law doth he meditate day and night.' },
        { verse: 3, text: 'And he shall be like a tree planted by the rivers of water, that bringeth forth his fruit in his season; his leaf also shall not wither; and whatsoever he doeth shall prosper.' },
      ]},
      { chapter: 46, verses: [
        { verse: 1, text: 'God is our refuge and strength, a very present help in trouble.' },
        { verse: 2, text: 'Therefore will not we fear, though the earth be removed, and though the mountains be carried into the midst of the sea;' },
        { verse: 10, text: 'Be still, and know that I am God: I will be exalted among the heathen, I will be exalted in the earth.' },
      ]},
      { chapter: 91, verses: [
        { verse: 1, text: 'He that dwelleth in the secret place of the most High shall abide under the shadow of the Almighty.' },
        { verse: 2, text: 'I will say of the LORD, He is my refuge and my fortress: my God; in him will I trust.' },
      ]},
    ],
  },
  {
    name: 'Proverbs',
    abbrev: 'Prov',
    testament: 'OT',
    chapters: [
      { chapter: 3, verses: [
        { verse: 5, text: 'Trust in the LORD with all thine heart; and lean not unto thine own understanding.' },
        { verse: 6, text: 'In all thy ways acknowledge him, and he shall direct thy paths.' },
      ]},
    ],
  },
  {
    name: 'Isaiah',
    abbrev: 'Isa',
    testament: 'OT',
    chapters: [
      { chapter: 41, verses: [
        { verse: 10, text: 'Fear thou not; for I am with thee: be not dismayed; for I am thy God: I will strengthen thee; yea, I will help thee; yea, I will uphold thee with the right hand of my righteousness.' },
      ]},
      { chapter: 53, verses: [
        { verse: 5, text: 'But he was wounded for our transgressions, he was bruised for our iniquities: the chastisement of our peace was upon him; and with his stripes we are healed.' },
      ]},
    ],
  },
  {
    name: '2 Chronicles',
    abbrev: '2Chr',
    testament: 'OT',
    chapters: [
      { chapter: 5, verses: [
        { verse: 13, text: 'It came even to pass, as the trumpeters and singers were as one, to make one sound to be heard in praising and thanking the LORD; and when they lifted up their voice with the trumpets and cymbals and instruments of musick, and praised the LORD, saying, For he is good; for his mercy endureth for ever: that then the house was filled with a cloud, even the house of the LORD;' },
        { verse: 14, text: 'So that the priests could not stand to minister by reason of the cloud: for the glory of the LORD had filled the house of God.' },
      ]},
    ],
  },
  {
    name: 'Matthew',
    abbrev: 'Matt',
    testament: 'NT',
    chapters: [
      { chapter: 5, verses: [
        { verse: 1, text: 'And seeing the multitudes, he went up into a mountain: and when he was set, his disciples came unto him:' },
        { verse: 2, text: 'And he opened his mouth, and taught them, saying,' },
        { verse: 3, text: 'Blessed are the poor in spirit: for theirs is the kingdom of heaven.' },
        { verse: 4, text: 'Blessed are they that mourn: for they shall be comforted.' },
        { verse: 5, text: 'Blessed are the meek: for they shall inherit the earth.' },
        { verse: 6, text: 'Blessed are they which do hunger and thirst after righteousness: for they shall be filled.' },
        { verse: 7, text: 'Blessed are the merciful: for they shall obtain mercy.' },
        { verse: 8, text: 'Blessed are the pure in heart: for they shall see God.' },
        { verse: 9, text: 'Blessed are the peacemakers: for they shall be called the children of God.' },
      ]},
      { chapter: 6, verses: [
        { verse: 33, text: 'But seek ye first the kingdom of God, and his righteousness; and all these things shall be added unto you.' },
        { verse: 34, text: 'Take therefore no thought for the morrow: for the morrow shall take thought for the things of itself. Sufficient unto the day is the evil thereof.' },
      ]},
      { chapter: 28, verses: [
        { verse: 19, text: 'Go ye therefore, and teach all nations, baptizing them in the name of the Father, and of the Son, and of the Holy Ghost:' },
        { verse: 20, text: 'Teaching them to observe all things whatsoever I have commanded you: and, lo, I am with you alway, even unto the end of the world. Amen.' },
      ]},
    ],
  },
  {
    name: 'John',
    abbrev: 'John',
    testament: 'NT',
    chapters: [
      { chapter: 1, verses: [
        { verse: 1, text: 'In the beginning was the Word, and the Word was with God, and the Word was God.' },
        { verse: 2, text: 'The same was in the beginning with God.' },
        { verse: 3, text: 'All things were made by him; and without him was not any thing made that was made.' },
        { verse: 4, text: 'In him was life; and the life was the light of men.' },
        { verse: 5, text: 'And the light shineth in darkness; and the darkness comprehended it not.' },
        { verse: 14, text: 'And the Word was made flesh, and dwelt among us, (and we beheld his glory, the glory as of the only begotten of the Father,) full of grace and truth.' },
      ]},
      { chapter: 3, verses: [
        { verse: 16, text: 'For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life.' },
        { verse: 17, text: 'For God sent not his Son into the world to condemn the world; but that the world through him might be saved.' },
        { verse: 18, text: 'He that believeth on him is not condemned: but he that believeth not is condemned already, because he hath not believed in the name of the only begotten Son of God.' },
      ]},
      { chapter: 14, verses: [
        { verse: 1, text: 'Let not your heart be troubled: ye believe in God, believe also in me.' },
        { verse: 2, text: 'In my Father house are many mansions: if it were not so, I would have told you. I go to prepare a place for you.' },
        { verse: 3, text: 'And if I go and prepare a place for you, I will come again, and receive you unto myself; that where I am, there ye may be also.' },
        { verse: 6, text: 'Jesus saith unto him, I am the way, the truth, and the life: no man cometh unto the Father, but by me.' },
        { verse: 27, text: 'Peace I leave with you, my peace I give unto you: not as the world giveth, give I unto you. Let not your heart be troubled, neither let it be afraid.' },
      ]},
      { chapter: 15, verses: [
        { verse: 5, text: 'I am the vine, ye are the branches: He that abideth in me, and I in him, the same bringeth forth much fruit: for without me ye can do nothing.' },
        { verse: 7, text: 'If ye abide in me, and my words abide in you, ye shall ask what ye will, and it shall be done unto you.' },
        { verse: 13, text: 'Greater love hath no man than this, that a man lay down his life for his friends.' },
      ]},
    ],
  },
  {
    name: 'Romans',
    abbrev: 'Rom',
    testament: 'NT',
    chapters: [
      { chapter: 1, verses: [
        { verse: 16, text: 'For I am not ashamed of the gospel of Christ: for it is the power of God unto salvation to every one that believeth; to the Jew first, and also to the Greek.' },
        { verse: 17, text: 'For therein is the righteousness of God revealed from faith to faith: as it is written, The just shall live by faith.' },
      ]},
      { chapter: 8, verses: [
        { verse: 28, text: 'And we know that all things work together for good to them that love God, to them who are the called according to his purpose.' },
        { verse: 29, text: 'For whom he did foreknow, he also did predestinate to be conformed to the image of his Son, that he might be the firstborn among many brethren.' },
        { verse: 31, text: 'What shall we then say to these things? If God be for us, who can be against us?' },
        { verse: 38, text: 'For I am persuaded, that neither death, nor life, nor angels, nor principalities, nor powers, nor things present, nor things to come,' },
        { verse: 39, text: 'Nor height, nor depth, nor any other creature, shall be able to separate us from the love of God, which is in Christ Jesus our Lord.' },
      ]},
      { chapter: 12, verses: [
        { verse: 1, text: 'I beseech you therefore, brethren, by the mercies of God, that ye present your bodies a living sacrifice, holy, acceptable unto God, which is your reasonable service.' },
        { verse: 2, text: 'And be not conformed to this world: but be ye transformed by the renewing of your mind, that ye may prove what is that good, and acceptable, and perfect, will of God.' },
      ]},
    ],
  },
  {
    name: '1 Corinthians',
    abbrev: '1Cor',
    testament: 'NT',
    chapters: [
      { chapter: 13, verses: [
        { verse: 1, text: 'Though I speak with the tongues of men and of angels, and have not charity, I am become as sounding brass, or a tinkling cymbal.' },
        { verse: 4, text: 'Charity suffereth long, and is kind; charity envieth not; charity vaunteth not itself, is not puffed up,' },
        { verse: 5, text: 'Doth not behave itself unseemly, seeketh not her own, is not easily provoked, thinketh no evil;' },
        { verse: 6, text: 'Rejoiceth not in iniquity, but rejoiceth in the truth;' },
        { verse: 7, text: 'Beareth all things, believeth all things, hopeth all things, endureth all things.' },
        { verse: 8, text: 'Charity never faileth: but whether there be prophecies, they shall fail; whether there be tongues, they shall cease; whether there be knowledge, it shall vanish away.' },
        { verse: 13, text: 'And now abideth faith, hope, charity, these three; but the greatest of these is charity.' },
      ]},
    ],
  },
  {
    name: '2 Corinthians',
    abbrev: '2Cor',
    testament: 'NT',
    chapters: [
      { chapter: 5, verses: [
        { verse: 17, text: 'Therefore if any man be in Christ, he is a new creature: old things are passed away; behold, all things are become new.' },
      ]},
      { chapter: 12, verses: [
        { verse: 9, text: 'And he said unto me, My grace is sufficient for thee: for my strength is made perfect in weakness. Most gladly therefore will I rather glory in my infirmities, that the power of Christ may rest upon me.' },
      ]},
    ],
  },
  {
    name: 'Galatians',
    abbrev: 'Gal',
    testament: 'NT',
    chapters: [
      { chapter: 2, verses: [
        { verse: 20, text: 'I am crucified with Christ: nevertheless I live; yet not I, but Christ liveth in me: and the life which I now live in the flesh I live by the faith of the Son of God, who loved me, and gave himself for me.' },
      ]},
      { chapter: 5, verses: [
        { verse: 22, text: 'But the fruit of the Spirit is love, joy, peace, longsuffering, gentleness, goodness, faith,' },
        { verse: 23, text: 'Meekness, temperance: against such there is no law.' },
      ]},
    ],
  },
  {
    name: 'Ephesians',
    abbrev: 'Eph',
    testament: 'NT',
    chapters: [
      { chapter: 2, verses: [
        { verse: 8, text: 'For by grace are ye saved through faith; and that not of yourselves: it is the gift of God:' },
        { verse: 9, text: 'Not of works, lest any man should boast.' },
      ]},
      { chapter: 6, verses: [
        { verse: 10, text: 'Finally, my brethren, be strong in the Lord, and in the power of his might.' },
        { verse: 11, text: 'Put on the whole armour of God, that ye may be able to stand against the wiles of the devil.' },
      ]},
    ],
  },
  {
    name: 'Philippians',
    abbrev: 'Phil',
    testament: 'NT',
    chapters: [
      { chapter: 4, verses: [
        { verse: 6, text: 'Be careful for nothing; but in every thing by prayer and supplication with thanksgiving let your requests be made known unto God.' },
        { verse: 7, text: 'And the peace of God, which passeth all understanding, shall keep your hearts and minds through Christ Jesus.' },
        { verse: 13, text: 'I can do all things through Christ which strengtheneth me.' },
        { verse: 19, text: 'But my God shall supply all your need according to his riches in glory by Christ Jesus.' },
      ]},
    ],
  },
  {
    name: 'Hebrews',
    abbrev: 'Heb',
    testament: 'NT',
    chapters: [
      { chapter: 11, verses: [
        { verse: 1, text: 'Now faith is the substance of things hoped for, the evidence of things not seen.' },
        { verse: 2, text: 'For by it the elders obtained a good report.' },
        { verse: 3, text: 'Through faith we understand that the worlds were framed by the word of God, so that things which are seen were not made of things which do appear.' },
        { verse: 6, text: 'But without faith it is impossible to please him: for he that cometh to God must believe that he is, and that he is a rewarder of them that diligently seek him.' },
      ]},
      { chapter: 4, verses: [
        { verse: 12, text: 'For the word of God is quick, and powerful, and sharper than any twoedged sword, piercing even to the dividing asunder of soul and spirit, and of the joints and marrow, and is a discerner of the thoughts and intents of the heart.' },
      ]},
      { chapter: 13, verses: [
        { verse: 8, text: 'Jesus Christ the same yesterday, and to day, and for ever.' },
      ]},
    ],
  },
  {
    name: 'James',
    abbrev: 'Jas',
    testament: 'NT',
    chapters: [
      { chapter: 1, verses: [
        { verse: 2, text: 'My brethren, count it all joy when ye fall into divers temptations;' },
        { verse: 3, text: 'Knowing this, that the trying of your faith worketh patience.' },
        { verse: 5, text: 'If any of you lack wisdom, let him ask of God, that giveth to all men liberally, and upbraideth not; and it shall be given him.' },
      ]},
    ],
  },
  {
    name: 'Revelation',
    abbrev: 'Rev',
    testament: 'NT',
    chapters: [
      { chapter: 3, verses: [
        { verse: 20, text: 'Behold, I stand at the door, and knock: if any man hear my voice, and open the door, I will come in to him, and will sup with him, and he with me.' },
      ]},
      { chapter: 21, verses: [
        { verse: 4, text: 'And God shall wipe away all tears from their eyes; and there shall be no more death, neither sorrow, nor crying, neither shall there be any more pain: for the former things are passed away.' },
      ]},
    ],
  },
];

export const bookNames = bibleData.map(b => b.name);

export function getBook(name: string): BibleBook | undefined {
  return bibleData.find(b => b.name.toLowerCase() === name.toLowerCase());
}

export function getChapter(bookName: string, chapter: number): BibleChapter | undefined {
  return getBook(bookName)?.chapters.find(c => c.chapter === chapter);
}

export function getVerse(bookName: string, chapter: number, verse: number): BibleVerse | undefined {
  return getChapter(bookName, chapter)?.verses.find(v => v.verse === verse);
}

export function getVerseText(ref: string): string | undefined {
  const parsed = parseReference(ref);
  if (!parsed || parsed.verse === undefined) return undefined;
  const v = getVerse(parsed.book, parsed.chapter, parsed.verse);
  return v?.text;
}

export function getChapterVerses(bookName: string, chapter: number): { reference: string; verse: number; text: string }[] {
  const ch = getChapter(bookName, chapter);
  if (!ch) return [];
  return ch.verses.map(v => ({
    reference: `${bookName} ${chapter}:${v.verse}`,
    verse: v.verse,
    text: v.text,
  }));
}

export interface ParsedRef {
  book: string;
  chapter: number;
  verse?: number;
  endVerse?: number;
}

// Parse references like "John 3:16", "2 Chronicles 5:14", "Hebrews 11:1-3"
export function parseReference(input: string): ParsedRef | undefined {
  const clean = input.trim().replace(/\s+/g, ' ');
  // Match: (book name with optional number prefix) (chapter):(verse)(-endverse)?
  const match = clean.match(/^(\d\s)?([A-Za-z]+(?:\s[A-Za-z]+)?)\s+(\d+):(\d+)(?:-(\d+))?$/);
  if (match) {
    const bookNum = match[1] ? match[1].trim() : '';
    const bookName = (bookNum + ' ' + match[2]).trim();
    const known = bibleData.find(b => b.name.toLowerCase() === bookName.toLowerCase());
    if (!known) return undefined;
    return {
      book: known.name,
      chapter: parseInt(match[3]),
      verse: parseInt(match[4]),
      endVerse: match[5] ? parseInt(match[5]) : undefined,
    };
  }
  return undefined;
}

export const translations = ['KJV', 'NKJV', 'ESV', 'NIV', 'NLT'];
