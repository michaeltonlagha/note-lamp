export interface ScriptureRef {
  reference: string;
}

export interface NoteItem {
  id: string;
  title: string;
  date: string;
  category: 'Sermon' | 'Bible Study' | 'Personal Reflection' | 'Book Notes';
  body: string;
  scriptures: string[];
  folderId: string;
  isSermon: boolean;
  type: 'note' | 'sermon';
}

export interface PdfItem {
  id: string;
  title: string;
  author: string;
  date: string;
  pageCount: number;
  excerpt: string;
  scriptureRefs: string[];
  folderId: string;
}

export interface Folder {
  id: string;
  name: string;
  color: string;
}

export const folders: Folder[] = [
  { id: 'f1', name: 'Sermons', color: '#2929D8' },
  { id: 'f2', name: 'Bible Study', color: '#13A89E' },
  { id: 'f3', name: 'Personal Reflections', color: '#FF5B55' },
  { id: 'f4', name: 'Book Notes', color: '#8257E5' },
  { id: 'f5', name: 'Romans Series', color: '#4169FF' },
];

export const sampleNotes: NoteItem[] = [
  {
    id: 'n1',
    title: 'The Power of God Presence',
    date: '2026-11-09',
    category: 'Sermon',
    folderId: 'f1',
    isSermon: true,
    type: 'sermon',
    scriptures: ['2 Chronicles 5:14', 'Psalm 23:1', 'Exodus 33:14'],
    body: `# The Power of God Presence

## Introduction
There is something profoundly transformational about the presence of God. When God shows up, everything changes. In 2 Chronicles 5:14 we see that the glory of the Lord so filled the temple that the priests could not even stand to minister.

## I. The Promise of His Presence
God has never intended for us to live distant from Him. From Genesis to Revelation, His desire has been to dwell among His people.

## II. The Power of His Presence
When God presence manifests:
- Burdens are lifted
- Chains are broken
- Vision becomes clear

## III. Walking in His Presence Daily
David understood this. In Psalm 23 he declares, "The Lord is my shepherd; I shall not want."

## Conclusion
We must cultivate an environment where God feels welcome. Repentance, worship, and the Word create the atmosphere where His glory dwells.

*Key verse: 2 Chronicles 5:14 — "So that the priests could not stand to minister by reason of the cloud: for the glory of the LORD had filled the house of God."*`,
  },
  {
    id: 'n2',
    title: 'Walking in Faith',
    date: '2026-11-02',
    category: 'Sermon',
    folderId: 'f1',
    isSermon: true,
    type: 'sermon',
    scriptures: ['Hebrews 11:1', 'Romans 1:17', 'Galatians 2:20'],
    body: `# Walking in Faith

## Introduction
Faith is not a feeling; it is a response to the character of God. Hebrews 11:1 defines it as the substance of things hoped for, the evidence of things not seen.

## I. What Faith Is
Faith is confidence in God nature and His promises. Romans 1:17 reminds us the just shall live by faith.

## II. What Faith Does
- It pleases God (Hebrews 11:6)
- It overcomes fear
- It sustains through trials

## III. How to Grow in Faith
"So then faith cometh by hearing, and hearing by the word of God." Romans 10:17

## Conclusion
Faith is a journey, not a destination. Every step we take in obedience strengthens our trust in the One who leads.`,
  },
  {
    id: 'n3',
    title: 'God Plan in the Waiting',
    date: '2026-10-26',
    category: 'Sermon',
    folderId: 'f1',
    isSermon: true,
    type: 'sermon',
    scriptures: ['Romans 8:28', 'Isaiah 41:10', 'Psalm 46:10'],
    body: `# God Plan in the Waiting

## Introduction
Waiting is one of the hardest disciplines of the Christian life. Yet Romans 8:28 assures us that all things work together for good to them that love God.

## I. The Purpose of the Wait
God uses waiting seasons to develop character, deepen dependence, and refine vision.

## II. The Practice of Waiting Well
- Be still (Psalm 46:10)
- Trust His timing
- Remain faithful in the ordinary

## Conclusion
What you do in the waiting determines what God can do through you in the fulfilling.`,
  },
  {
    id: 'n4',
    title: 'Romans Study — Chapter 8',
    date: '2026-10-20',
    category: 'Bible Study',
    folderId: 'f2',
    isSermon: false,
    type: 'note',
    scriptures: ['Romans 8:28', 'Romans 8:38', 'Romans 8:39'],
    body: `# Romans Chapter 8 Study Notes

## The Spirit-Filled Life
Romans 8 is arguably the richest chapter on the Spirit-led life in all of Scripture.

## Verses 28-30 — All Things Work Together
This promise is not generic. It is anchored in the sovereignty of God and His foreknowledge.

## Verses 38-39 — Nothing Can Separate Us
Paul lists every possible force — death, life, angels, powers — and declares none can sever us from God love.`,
  },
  {
    id: 'n5',
    title: 'Morning Devotional — Peace',
    date: '2026-11-10',
    category: 'Personal Reflection',
    folderId: 'f3',
    isSermon: false,
    type: 'note',
    scriptures: ['Philippians 4:7', 'John 14:27'],
    body: `# Morning Devotional

Today I am reflecting on the peace of God. Philippians 4:7 speaks of a peace that passes all understanding.

Jesus said in John 14:27, "Peace I leave with you, my peace I give unto you."

This peace is not the absence of trouble — it is the presence of Christ in the midst of trouble.`,
  },
  {
    id: 'n6',
    title: 'Notes on Mere Christianity — Ch. 1',
    date: '2026-10-15',
    category: 'Book Notes',
    folderId: 'f4',
    isSermon: false,
    type: 'note',
    scriptures: [],
    body: `# Mere Christianity — Chapter 1 Notes

Lewis begins by observing that humans universally appeal to a moral standard. We quarrel by appealing to fairness, not by raw power.

This suggests a Law of Human Nature — an objective moral reality we all recognise yet all break.`,
  },
  {
    id: 'n7',
    title: 'Romans — Justification by Faith',
    date: '2026-10-12',
    category: 'Bible Study',
    folderId: 'f5',
    isSermon: false,
    type: 'note',
    scriptures: ['Romans 1:17', 'Ephesians 2:8', 'Galatians 2:20'],
    body: `# Romans Series — Justification

Romans 1:17 reveals the righteousness of God from faith to faith.

Ephesians 2:8-9 clarifies: salvation is by grace through faith, not of works.

Galatians 2:20: "I am crucified with Christ: nevertheless I live; yet not I, but Christ liveth in me."`,
  },
];

export const samplePdfs: PdfItem[] = [
  {
    id: 'p1',
    title: 'The Cost of Discipleship.pdf',
    author: 'Dietrich Bonhoeffer',
    date: '2026-10-08',
    pageCount: 14,
    scriptureRefs: ['Hebrews 11:1', 'Matthew 5:3', 'Luke 14:27'],
    folderId: 'f4',
    excerpt: `Cheap grace is the deadly enemy of our church. Cheap grace means grace sold on the market like cheapjacks' wares...

Cheap grace is grace without discipleship, grace without the cross, grace without Jesus Christ, living and incarnate.

Costly grace is the gospel which must be sought again and again, the gift which must be asked for, the door at which a man must knock.

Such grace is costly because it calls us to follow, and it is grace because it calls us to follow Jesus Christ. It is costly because it costs a man his life, and it is grace because it gives a man the only true life.

As Hebrews 11:1 reminds us, "Now faith is the substance of things hoped for, the evidence of things not seen." True discipleship is rooted in such faith — not in cheap words, but in costly obedience.

The first beatitude, Matthew 5:3, declares "Blessed are the poor in spirit: for theirs is the kingdom of heaven." This poverty of spirit is the doorway to genuine discipleship.

"Whosoever doth not bear his cross, and come after me, cannot be my disciple" (Luke 14:27). The cross is not a metaphor we admire; it is the instrument on which our self-will is executed.`,
  },
  {
    id: 'p2',
    title: 'The Pursuit of God.pdf',
    author: 'A.W. Tozer',
    date: '2026-09-28',
    pageCount: 9,
    scriptureRefs: ['Psalm 42:1', 'John 14:6', 'Philippians 3:10'],
    folderId: 'f4',
    excerpt: `To have found God and still to pursue Him is the soul paradox of the Christian life...

Modern Christianity is simply producing a separate race of people who take religion as their chief occupation.

We pursue God because, and only because, He has first put an urge within us that spurs us to the pursuit. "As the hart panteth after the water brooks, so panteth my soul after thee, O God" (Psalm 42:1).

Jesus said, "I am the way, the truth, and the life: no man cometh unto the Father, but by me" (John 14:6). He is not one path among many — He is the path itself.

The heart of the Christian longing is expressed in Philippians 3:10, "That I may know him, and the power of his resurrection." To know Him — this is the one passion that validates all others.`,
  },
];

export const sermonTitles = [
  'The Power of God Presence',
  'Walking in Faith',
  'God Plan in the Waiting',
  'Grace That Saves',
  'The Cross and the Crown',
  'Living by the Spirit',
  'The Fellowship of Suffering',
];
