export type TicketForSimilarity = {
  id: number;
  ticket_code?: string | null;
  title?: string | null;
  complaint_description?: string | null;
  status?: string | null;
  is_archived?: boolean;
};

export type TicketSimilarityResult = {
  ticket: TicketForSimilarity;
  score: number;
  titleScore: number;
  descriptionScore: number;
  tokenScore: number;
  fuzzyScore: number;
  characterScore: number;
  phraseScore: number;
};

type FindDuplicatesOptions = {
  title: string;
  description: string;
  tickets: TicketForSimilarity[];
  threshold?: number;
  maxResults?: number;
};

type SimilaritySignals = {
  score: number;
  tokenScore: number;
  fuzzyScore: number;
  characterScore: number;
  phraseScore: number;
  coverageScore: number;
  conceptScore: number;
};

// Domain vocabulary for ticket issues.
const ISSUE_CONCEPTS: Record<string, string[]> = {
  display: ["monitor", "screen", "display", "lcd", "led", "panel"],

  computer: ["computer", "pc", "desktop", "workstation"],

  keyboard: ["keyboard", "keypad", "keys"],

  mouse: ["mouse", "mice"],

  printer: ["printer", "printing", "print"],

  network: [
    "network",
    "internet",
    "wifi",
    "wi-fi",
    "connection",
    "connectivity",
    "lan",
  ],

  audio: [
    "speaker",
    "speakers",
    "audio",
    "sound",
    "headset",
    "microphone",
    "mic",
  ],

  power: [
    "power",
    "electricity",
    "electric",
    "outlet",
    "socket",
    "charger",
    "charging",
    "battery",
    "boot",
    "startup",
    "start",
    "turning on",
    "turn on",
  ],

  malfunction: [
    "broken",
    "break",
    "broke",
    "defective",
    "damaged",
    "damage",
    "faulty",
    "fault",
    "malfunction",
    "malfunctioning",
    "failed",
    "failure",
    "unusable",
    "useable",
    "usable",
    "working",
    "functioning",
    "function",
    "operating",
    "operation",
    "stopped",
    "stopping",
  ],

  replacement: [
    "replacement",
    "replace",
    "replaced",
    "another",
    "new",
    "swap",
    "swapping",
  ],

  software: [
    "software",
    "application",
    "app",
    "program",
    "system",
    "windows",
    "driver",
    "drivers",
    "update",
    "updates",
    "error",
    "crash",
    "crashing",
  ],

  physical_damage: [
    "cracked",
    "crack",
    "broken",
    "damaged",
    "damage",
    "burned",
    "burnt",
    "wet",
    "water",
    "liquid",
    "destroyed",
  ],
};

const GENERIC_WORDS = new Set([
  "the",
  "a",
  "an",
  "is",
  "are",
  "was",
  "were",
  "be",
  "been",
  "being",
  "this",
  "that",
  "these",
  "those",
  "it",
  "its",
  "i",
  "we",
  "you",
  "he",
  "she",
  "they",
  "and",
  "or",
  "but",
  "for",
  "to",
  "of",
  "in",
  "on",
  "at",
  "with",
  "from",
  "by",
  "as",
  "please",
  "need",
  "needs",
  "needed",
  "think",
  "really",
  "very",
  "just",
  "here",
  "there",
  "problem",
  "issue",
  "concern",
  "request",
  "report",
  "ticket",
]);

function normalizeText(text: string | null | undefined): string {
  if (!text) {
    return "";
  }

  return text
    .normalize("NFKC")
    .toLocaleLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tokenize(text: string | null | undefined): string[] {
  const normalized = normalizeText(text);

  if (!normalized) {
    return [];
  }

  return normalized.split(" ").filter(Boolean);
}

function meaningfulTokens(text: string | null | undefined): string[] {
  return tokenize(text).filter((token) => !GENERIC_WORDS.has(token));
}

function levenshteinDistance(a: string, b: string): number {
  if (a === b) {
    return 0;
  }

  if (!a) {
    return b.length;
  }

  if (!b) {
    return a.length;
  }

  if (a.length < b.length) {
    [a, b] = [b, a];
  }

  let previous = Array.from({ length: b.length + 1 }, (_, index) => index);

  let current = new Array<number>(b.length + 1);

  for (let i = 1; i <= a.length; i++) {
    current[0] = i;

    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;

      current[j] = Math.min(
        current[j - 1] + 1,
        previous[j] + 1,
        previous[j - 1] + cost
      );
    }

    [previous, current] = [current, previous];
  }

  return previous[b.length];
}

function levenshteinSimilarity(a: string, b: string): number {
  if (a === b) {
    return 1;
  }

  if (!a || !b) {
    return 0;
  }

  const maxLength = Math.max(a.length, b.length);

  return Math.max(0, 1 - levenshteinDistance(a, b) / maxLength);
}

function wordSimilarity(wordA: string, wordB: string): number {
  if (wordA === wordB) {
    return 1;
  }

  if (wordA.length <= 2 || wordB.length <= 2) {
    return 0;
  }

  if (wordA.includes(wordB) || wordB.includes(wordA)) {
    const shorter = Math.min(wordA.length, wordB.length);

    const longer = Math.max(wordA.length, wordB.length);

    return shorter / longer;
  }

  return levenshteinSimilarity(wordA, wordB);
}

function directionalFuzzySimilarity(
  tokensA: string[],
  tokensB: string[]
): number {
  if (tokensA.length === 0 || tokensB.length === 0) {
    return 0;
  }

  let total = 0;

  for (const tokenA of tokensA) {
    let best = 0;

    for (const tokenB of tokensB) {
      const similarity = wordSimilarity(tokenA, tokenB);

      if (similarity > best) {
        best = similarity;
      }

      if (best === 1) {
        break;
      }
    }

    total += best;
  }

  return total / tokensA.length;
}

function fuzzyTokenSimilarity(textA: string, textB: string): number {
  const tokensA = meaningfulTokens(textA);

  const tokensB = meaningfulTokens(textB);

  if (tokensA.length === 0 || tokensB.length === 0) {
    return 0;
  }

  const forward = directionalFuzzySimilarity(tokensA, tokensB);

  const backward = directionalFuzzySimilarity(tokensB, tokensA);

  return forward * 0.5 + backward * 0.5;
}

function tokenSimilarity(textA: string, textB: string): number {
  const tokensA = new Set(meaningfulTokens(textA));

  const tokensB = new Set(meaningfulTokens(textB));

  if (tokensA.size === 0 || tokensB.size === 0) {
    return 0;
  }

  let intersection = 0;

  for (const token of tokensA) {
    if (tokensB.has(token)) {
      intersection++;
    }
  }

  const union = new Set([...tokensA, ...tokensB]);

  return intersection / union.size;
}

function characterNgrams(text: string, n = 3): Set<string> {
  const normalized = normalizeText(text);

  const grams = new Set<string>();

  if (!normalized) {
    return grams;
  }

  if (normalized.length < n) {
    grams.add(normalized);
    return grams;
  }

  for (let i = 0; i <= normalized.length - n; i++) {
    grams.add(normalized.slice(i, i + n));
  }

  return grams;
}

function characterSimilarity(textA: string, textB: string): number {
  const gramsA = characterNgrams(textA);

  const gramsB = characterNgrams(textB);

  if (gramsA.size === 0 || gramsB.size === 0) {
    return 0;
  }

  let intersection = 0;

  for (const gram of gramsA) {
    if (gramsB.has(gram)) {
      intersection++;
    }
  }

  const union = new Set([...gramsA, ...gramsB]);

  return intersection / union.size;
}

function wordNgrams(text: string, n: number): Set<string> {
  const tokens = tokenize(text);
  const grams = new Set<string>();

  if (tokens.length < n) {
    return grams;
  }

  for (let i = 0; i <= tokens.length - n; i++) {
    grams.add(tokens.slice(i, i + n).join(" "));
  }

  return grams;
}

function jaccard(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 || b.size === 0) {
    return 0;
  }

  let intersection = 0;

  for (const value of a) {
    if (b.has(value)) {
      intersection++;
    }
  }

  const union = new Set([...a, ...b]);

  return intersection / union.size;
}

function phraseSimilarity(textA: string, textB: string): number {
  const bigramScore = jaccard(wordNgrams(textA, 2), wordNgrams(textB, 2));

  const trigramScore = jaccard(wordNgrams(textA, 3), wordNgrams(textB, 3));

  return bigramScore * 0.65 + trigramScore * 0.35;
}

function contentCoverage(textA: string, textB: string): number {
  const tokensA = meaningfulTokens(textA);

  const tokensB = meaningfulTokens(textB);

  if (tokensA.length === 0 || tokensB.length === 0) {
    return 0;
  }

  const shorter = tokensA.length <= tokensB.length ? tokensA : tokensB;

  const longer = tokensA.length <= tokensB.length ? tokensB : tokensA;

  let total = 0;

  for (const source of shorter) {
    let best = 0;

    for (const target of longer) {
      const similarity = wordSimilarity(source, target);

      if (similarity > best) {
        best = similarity;
      }

      if (best === 1) {
        break;
      }
    }

    total += best;
  }

  return total / shorter.length;
}

function getConcepts(text: string): Set<string> {
  const normalized = normalizeText(text);

  const tokens = tokenize(text);

  const concepts = new Set<string>();

  for (const [concept, aliases] of Object.entries(ISSUE_CONCEPTS)) {
    for (const alias of aliases) {
      const normalizedAlias = normalizeText(alias);

      if (normalized.includes(normalizedAlias)) {
        concepts.add(concept);
        break;
      }

      if (
        normalizedAlias.length > 2 &&
        tokens.some((token) => wordSimilarity(token, normalizedAlias) >= 0.88)
      ) {
        concepts.add(concept);
        break;
      }
    }
  }

  return concepts;
}

function conceptSimilarity(textA: string, textB: string): number {
  const conceptsA = getConcepts(textA);

  const conceptsB = getConcepts(textB);

  if (conceptsA.size === 0 || conceptsB.size === 0) {
    return 0;
  }

  let intersection = 0;

  for (const concept of conceptsA) {
    if (conceptsB.has(concept)) {
      intersection++;
    }
  }

  const union = new Set([...conceptsA, ...conceptsB]);

  return intersection / union.size;
}

function textSimilarity(textA: string, textB: string): SimilaritySignals {
  const normalizedA = normalizeText(textA);

  const normalizedB = normalizeText(textB);

  if (!normalizedA || !normalizedB) {
    return {
      score: 0,
      tokenScore: 0,
      fuzzyScore: 0,
      characterScore: 0,
      phraseScore: 0,
      coverageScore: 0,
      conceptScore: 0,
    };
  }

  if (normalizedA === normalizedB) {
    return {
      score: 1,
      tokenScore: 1,
      fuzzyScore: 1,
      characterScore: 1,
      phraseScore: 1,
      coverageScore: 1,
      conceptScore: 1,
    };
  }

  const tokenScore = tokenSimilarity(normalizedA, normalizedB);

  const fuzzyScore = fuzzyTokenSimilarity(normalizedA, normalizedB);

  const characterScore = characterSimilarity(normalizedA, normalizedB);

  const phraseScore = phraseSimilarity(normalizedA, normalizedB);

  const coverageScore = contentCoverage(normalizedA, normalizedB);

  const conceptScore = conceptSimilarity(normalizedA, normalizedB);

  const lexicalScore =
    fuzzyScore * 0.35 +
    coverageScore * 0.25 +
    characterScore * 0.15 +
    tokenScore * 0.15 +
    phraseScore * 0.1;

  const score = lexicalScore * 0.55 + conceptScore * 0.45;

  return {
    score: Math.min(1, score),
    tokenScore,
    fuzzyScore,
    characterScore,
    phraseScore,
    coverageScore,
    conceptScore,
  };
}

export function calculateTicketSimilarity(
  newTitle: string,
  newDescription: string,
  existingTicket: TicketForSimilarity
): TicketSimilarityResult {
  const titleResult = textSimilarity(newTitle, existingTicket.title ?? "");

  const descriptionResult = textSimilarity(
    newDescription,
    existingTicket.complaint_description ?? ""
  );

  const score = titleResult.score * 0.4 + descriptionResult.score * 0.6;

  return {
    ticket: existingTicket,

    score: Math.min(1, score),

    titleScore: titleResult.score,

    descriptionScore: descriptionResult.score,

    tokenScore:
      titleResult.tokenScore * 0.4 + descriptionResult.tokenScore * 0.6,

    fuzzyScore:
      titleResult.fuzzyScore * 0.4 + descriptionResult.fuzzyScore * 0.6,

    characterScore:
      titleResult.characterScore * 0.4 + descriptionResult.characterScore * 0.6,

    phraseScore:
      titleResult.phraseScore * 0.4 + descriptionResult.phraseScore * 0.6,
  };
}

export function findPotentialDuplicates({
  title,
  description,
  tickets,
  threshold = 0.3,
  maxResults = 3,
}: FindDuplicatesOptions): TicketSimilarityResult[] {
  if (!normalizeText(title) && !normalizeText(description)) return [];
  const safeThreshold = Math.max(0, Math.min(1, threshold));
  return tickets
    .filter(isActiveSimilarityTicket)
    .map((ticket) => calculateTicketSimilarity(title, description, ticket))
    .filter((result) => result.score >= safeThreshold)
    .sort((a, b) => b.score - a.score)
    .slice(0, Math.max(0, maxResults));
}

export function isActiveSimilarityTicket(ticket: TicketForSimilarity): boolean {
  const status = ticket.status?.toLowerCase().trim();
  return !ticket.is_archived && (status === "open" || status === "ongoing");
}

