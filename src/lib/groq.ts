import Groq from 'groq-sdk';

const groq = process.env.GROQ_API_KEY ? new Groq({ apiKey: process.env.GROQ_API_KEY }) : null;

export async function getCompanyInsights(companyName: string) {
  if (!groq) return null;
  
  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are an expert career and compensation analyst. Provide a short 2-3 sentence engaging summary about working at the provided company, their compensation reputation, or engineering culture.'
        },
        {
          role: 'user',
          content: `Provide a brief insight about working at ${companyName}.`
        }
      ],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.5,
      max_tokens: 150,
    });
    return chatCompletion.choices[0]?.message?.content || null;
  } catch (err) {
    console.error('Groq error:', err);
    return null;
  }
}
