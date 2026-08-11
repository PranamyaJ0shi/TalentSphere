/**
 * Smart mock AI evaluator for tech interview answers.
 * Compares student answer with expected reference answer.
 */
exports.evaluateAnswer = (studentAnswer, expectedAnswer) => {
  if (!studentAnswer || studentAnswer.trim().length === 0) {
    return {
      score: 0,
      feedback: '### AI Evaluation Summary\n- **Completeness**: None\n- **Error**: Answer submitted was empty or too short. Please write a detailed explanation.',
    };
  }

  const sClean = studentAnswer.toLowerCase().trim();
  const eClean = expectedAnswer.toLowerCase().trim();

  // Simple word count check
  const studentWords = sClean.split(/\s+/).length;
  const expectedWords = eClean.split(/\s+/).length;

  // Extract key technical words (length > 4, filtering common terms)
  const stopWords = new Set([
    'about', 'above', 'after', 'again', 'against', 'all', 'am', 'an', 'and', 'any', 'are', 'arent',
    'as', 'at', 'be', 'because', 'been', 'before', 'being', 'below', 'between', 'both', 'but', 'by',
    'cant', 'cannot', 'could', 'couldnt', 'did', 'didnt', 'do', 'does', 'doesnt', 'doing', 'dont',
    'down', 'during', 'each', 'few', 'for', 'from', 'further', 'had', 'hadnt', 'has', 'hasnt', 'have',
    'havent', 'having', 'he', 'hed', 'hell', 'hes', 'her', 'here', 'heres', 'hers', 'herself', 'him',
    'himself', 'his', 'how', 'hows', 'i', 'id', 'ill', 'im', 'ive', 'if', 'in', 'into', 'is', 'isnt',
    'it', 'its', 'itself', 'lets', 'me', 'more', 'most', 'mustnt', 'my', 'myself', 'no', 'nor', 'not',
    'of', 'off', 'on', 'once', 'only', 'or', 'other', 'ought', 'our', 'ours', 'ourselves', 'out',
    'over', 'own', 'same', 'shant', 'she', 'shed', 'shell', 'shes', 'should', 'shouldnt', 'so', 'some',
    'such', 'than', 'that', 'thats', 'the', 'their', 'theirs', 'them', 'themselves', 'then', 'there',
    'theres', 'these', 'they', 'theyd', 'theyll', 'theyre', 'theyve', 'this', 'those', 'through', 'to',
    'too', 'under', 'until', 'up', 'very', 'was', 'wasnt', 'we', 'wed', 'well', 'were', 'weve', 'werent',
    'what', 'whats', 'when', 'whens', 'where', 'wheres', 'which', 'while', 'who', 'whos', 'whom', 'why',
    'whys', 'with', 'wont', 'would', 'wouldnt', 'you', 'youd', 'youll', 'youre', 'youve', 'your', 'yours',
    'yourself', 'yourselves'
  ]);

  const extractKeywords = (text) => {
    return text
      .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?"']/g, '') // remove punctuation
      .split(/\s+/)
      .filter((w) => w.length > 3 && !stopWords.has(w));
  };

  const expectedKeywords = [...new Set(extractKeywords(eClean))];
  const studentKeywords = extractKeywords(sClean);

  // Calculate matching keyword percentage
  let matchCount = 0;
  const matches = [];
  const missed = [];

  expectedKeywords.forEach((kw) => {
    if (studentKeywords.includes(kw)) {
      matchCount++;
      matches.push(kw);
    } else {
      missed.push(kw);
    }
  });

  const keywordMatchRatio = expectedKeywords.length > 0 ? matchCount / expectedKeywords.length : 1;

  // Calculate base score
  // 30% word count compared to expected (capped at 100%)
  // 50% keyword matching
  // 20% default base for attempt
  const wordCountRatio = Math.min(studentWords / Math.max(expectedWords * 0.6, 20), 1);
  
  let score = Math.round(20 + wordCountRatio * 30 + keywordMatchRatio * 50);
  if (score > 100) score = 100;
  if (score < 20) score = 20; // baseline for attempt

  // Determine completeness level
  let completeness = 'Low';
  if (score >= 80) completeness = 'High';
  else if (score >= 50) completeness = 'Medium';

  // Construct structured feedback response
  let feedbackMarkdown = `### AI Evaluation Report
- **Overall Score**: **${score}/100**
- **Completeness**: **${completeness}**
- **Technical Concept Coverage**: **${Math.round(keywordMatchRatio * 100)}%**

#### Core Concepts Identified:
`;

  if (matches.length > 0) {
    feedbackMarkdown += matches.slice(0, 5).map(m => ` - [x] **${m}**: Well explained.`).join('\n') + '\n';
  } else {
    feedbackMarkdown += ` - [ ] No key concepts matched the reference solution.\n`;
  }

  if (missed.length > 0) {
    feedbackMarkdown += `\n#### Suggested Additions:
You missed some critical elements/vocabulary:
`;
    feedbackMarkdown += missed.slice(0, 4).map(m => ` - [ ] Define or discuss the application of **${m}**.`).join('\n') + '\n';
  }

  feedbackMarkdown += `
#### Constructive Recommendations:
1. **Elaboration**: ${studentWords < 40 ? 'Your response is quite brief. Technical interviewers prefer deep, clear explanations with structural details.' : 'Good depth in your response. Keep practicing structured formatting.'}
2. **Context**: Ensure you mention the "why" and "when" of the topic, and provide real-world examples in your explanation.
`;

  return {
    score,
    feedback: feedbackMarkdown,
  };
};
