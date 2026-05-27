import { state } from './state.js';

var EXTRACTOR = null;
var THRESHOLD = 0.7;

function cosineSimilarity(a, b) {
  var dot = 0, na = 0, nb = 0;
  for (var i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  return dot / (Math.sqrt(na) * Math.sqrt(nb));
}

export async function validateAnswer(userAnswer, correctAnswers) {
  if (!EXTRACTOR) {
    try {
      var mod = await import("@huggingface/transformers");
      EXTRACTOR = await mod.pipeline("feature-extraction", "Xenova/paraphrase-multilingual-MiniLM-L12-v2");
      state.aiReady = true;
    } catch (e) {
      state.aiReady = false;
      return exactMatch(userAnswer, correctAnswers);
    }
  }

  try {
    var answerEmb = await EXTRACTOR(userAnswer, { pooling: "mean", normalize: true });
    var answerData = answerEmb.data;

    for (var i = 0; i < correctAnswers.length; i++) {
      var caEmb = await EXTRACTOR(correctAnswers[i], { pooling: "mean", normalize: true });
      var sim = cosineSimilarity(answerData, caEmb.data);
      if (sim >= THRESHOLD) return true;
    }
    return false;
  } catch (e) {
    return exactMatch(userAnswer, correctAnswers);
  }
}

function exactMatch(userAnswer, correctAnswers) {
  var ua = (userAnswer || "").toLowerCase();
  for (var i = 0; i < correctAnswers.length; i++) {
    if (correctAnswers[i].toLowerCase() === ua) return true;
  }
  return false;
}

