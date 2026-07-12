/**
 * BPE (Byte Pair Encoding) — minimal runnable example.
 * Run: node scripts/bpe-demo.js
 */

const PRE_TOKEN_RE = /\w+|\s|[^\w\s]/g;

/**
 * Count how often each pre-token (word/space/punctuation) appears in text.
 * @param {string} text
 * @returns {Map<string, number>} word -> frequency
 */
function countWords(text, regex = PRE_TOKEN_RE) {
  const counts = new Map();
  const matches = text.match(regex) || [];
  for (const word of matches) {
    counts.set(word, (counts.get(word) || 0) + 1);
  }
  return counts;
}

/**
 * Replace every occurrence of `pair` in `tokens` with `merged`.
 * @param {string[]} tokens
 * @param {[string, string]} pair
 * @param {string} merged
 * @returns {string[]}
 */
function mergeTokens(tokens, pair, merged) {
  const result = [];
  let i = 0;
  while (i < tokens.length) {
    if (i < tokens.length - 1 && tokens[i] === pair[0] && tokens[i + 1] === pair[1]) {
      result.push(merged);
      i += 2;
    } else {
      result.push(tokens[i]);
      i++;
    }
  }
  return result;
}

/**
 * Train BPE merge rules from word frequencies.
 * @param {Map<string, number>} wordFreqs
 * @param {number} maxMerges
 * @returns {{ merges: {pair:[string,string], merged:string, frequency:number}[], wordSplits: Map<string,string[]> }}
 */
function trainBpe(wordFreqs, maxMerges = 1000) {
  const wordSplits = new Map();
  for (const word of wordFreqs.keys()) {
    wordSplits.set(word, [...word]);
  }

  const merges = [];
  for (let step = 0; step < maxMerges; step++) {
    const pairFreq = new Map();
    for (const [word, tokens] of wordSplits) {
      const weight = wordFreqs.get(word);
      for (let i = 0; i < tokens.length - 1; i++) {
        const key = tokens[i] + "\0" + tokens[i + 1];
        pairFreq.set(key, (pairFreq.get(key) || 0) + weight);
      }
    }
    if (pairFreq.size === 0) break;

    let bestKey = "", bestCount = 0;
    for (const [key, count] of pairFreq) {
      if (count > bestCount) {
        bestCount = count;
        bestKey = key;
      }
    }

    const [a, b] = bestKey.split("\0");
    const merged = a + b;
    for (const [word, tokens] of wordSplits) {
      wordSplits.set(word, mergeTokens(tokens, [a, b], merged));
    }
    merges.push({ pair: [a, b], merged, frequency: bestCount });
  }

  return { merges, wordSplits };
}

/**
 * Tokenize text by replaying trained merge rules in order.
 * @param {string} text
 * @param {{pair:[string,string], merged:string}[]} merges
 * @returns {string[]}
 */
function applyMerges(text, merges, regex = PRE_TOKEN_RE) {
  const preTokens = text.match(regex) || [];
  const result = [];
  for (const preToken of preTokens) {
    let tokens = [...preToken];
    for (const { pair, merged } of merges) {
      tokens = mergeTokens(tokens, pair, merged);
    }
    result.push(...tokens);
  }
  return result;
}

// ---- run it ----

const corpusText = "low low low low low lower lower newest newest newest newest newest newest widest widest widest";
const wordFreqs = countWords(corpusText);
console.log("word freqs:", wordFreqs);

const { merges } = trainBpe(wordFreqs, 8);
console.log("merges:", merges);

const tokens = applyMerges("the lowest new widow", merges);
console.log("tokens:", tokens);
