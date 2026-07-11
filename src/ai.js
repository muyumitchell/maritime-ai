const Groq = require('groq-sdk')
require('dotenv').config()

// Debug: check if key is being read
console.log('GROQ KEY EXISTS:', !!process.env.GROQ_API_KEY)

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
})

const askMaritime = async (question, context) => {
  const systemPrompt = `
    You are an intelligent maritime management assistant.
    You help fleet managers, port operators and shipping companies
    make smart decisions based on real vessel data.
    
    Always be specific, clear and actionable in your responses.
    When you see overdue maintenance, flag it as urgent.
    When you see vessels at risk, explain why clearly.
    Always base your answers on the data provided to you.
  `

  const userMessage = `
    Here is the current maritime data:
    ${JSON.stringify(context, null, 2)}
    
    Question: ${question}
  `

  const response = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userMessage }
    ],
    max_tokens: 1000
  })

  return response.choices[0].message.content
}

module.exports = { askMaritime }