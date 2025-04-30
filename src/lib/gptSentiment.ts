export type Sentiment = 'positive' | 'negative' | 'neutral';

export async function classifySentiment(text: string): Promise<Sentiment> {
  // Basic sentiment analysis based on keywords
  // This is a simple implementation - you can replace it with actual GPT API call later
  const lowerText = text.toLowerCase();
  
  const positiveWords = ['great', 'good', 'excellent', 'amazing', 'love', 'best', 'fantastic', 'wonderful', 'awesome'];
  const negativeWords = ['bad', 'poor', 'terrible', 'awful', 'horrible', 'worst', 'disappointed', 'disappointing'];
  
  let positiveScore = positiveWords.reduce((score, word) => 
    score + (lowerText.includes(word) ? 1 : 0), 0
  );
  
  let negativeScore = negativeWords.reduce((score, word) => 
    score + (lowerText.includes(word) ? 1 : 0), 0
  );
  
  if (positiveScore > negativeScore) return 'positive';
  if (negativeScore > positiveScore) return 'negative';
  return 'neutral';
} 