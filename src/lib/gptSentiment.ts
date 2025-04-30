import OpenAI from 'openai';

export type Sentiment = 'positive' | 'negative' | 'neutral';

if (!process.env.OPENAI_API_KEY) {
  throw new Error('Missing OPENAI_API_KEY environment variable');
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function classifySentiment(text: string): Promise<Sentiment> {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a sentiment analysis expert. Classify the following review as either 'positive', 'negative', or 'neutral'. Respond with ONLY the word 'positive', 'negative', or 'neutral'."
        },
        {
          role: "user",
          content: text
        }
      ],
      temperature: 0.3,
      max_tokens: 10
    });

    const sentiment = completion.choices[0]?.message?.content?.toLowerCase().trim() as Sentiment;
    
    if (!sentiment || !['positive', 'negative', 'neutral'].includes(sentiment)) {
      console.warn('Invalid sentiment response from OpenAI:', sentiment);
      return 'neutral';
    }

    return sentiment;
  } catch (error) {
    console.error('Error classifying sentiment:', error);
    // Fallback to basic sentiment analysis if OpenAI API fails
    return basicSentimentAnalysis(text);
  }
}

function basicSentimentAnalysis(text: string): Sentiment {
  const lowerText = text.toLowerCase();
  
  const positiveWords = ['great', 'good', 'excellent', 'amazing', 'love', 'best', 'fantastic', 'wonderful', 'awesome'];
  const negativeWords = ['bad', 'poor', 'terrible', 'awful', 'horrible', 'worst', 'disappointed', 'disappointing'];
  
  const positiveScore = positiveWords.reduce((score, word) => 
    score + (lowerText.includes(word) ? 1 : 0), 0
  );
  
  const negativeScore = negativeWords.reduce((score, word) => 
    score + (lowerText.includes(word) ? 1 : 0), 0
  );
  
  if (positiveScore > negativeScore) return 'positive';
  if (negativeScore > positiveScore) return 'negative';
  return 'neutral';
} 