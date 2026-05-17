// netlify/functions/groq-generate.js
// AI Report Generation using Groq API - Working with llama-3.1 model

const GROQ_API_KEY = process.env.GROQ_API_KEY;

exports.handler = async (event) => {
    // Handle CORS preflight request
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 204,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Methods': 'POST, OPTIONS'
            }
        };
    }

    // Only allow POST requests
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            headers: { 'Access-Control-Allow-Origin': '*' },
            body: JSON.stringify({ error: 'Method Not Allowed' })
        };
    }
    
    try {
        const { prompt } = JSON.parse(event.body);
        
        if (!prompt) {
            return {
                statusCode: 400,
                headers: { 'Access-Control-Allow-Origin': '*' },
                body: JSON.stringify({ success: false, error: 'Missing prompt' })
            };
        }
        
        // Call Groq API with current working model
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${GROQ_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'llama-3.1-70b-versatile',
                messages: [
                    { 
                        role: 'system', 
                        content: 'You are a professional academic report writer. Generate internship reports with proper HTML formatting using h2 for chapters, h3 for subheadings, p for paragraphs, ul/li for lists. Use formal academic English. Never mention that you are AI.' 
                    },
                    { role: 'user', content: prompt }
                ],
                temperature: 0.7,
                max_tokens: 4000
            })
        });
        
        const data = await response.json();
        
        // Check for errors
        if (data.error) {
            console.error('Groq API Error:', data.error);
            return {
                statusCode: 500,
                headers: { 'Access-Control-Allow-Origin': '*' },
                body: JSON.stringify({ success: false, error: data.error.message })
            };
        }
        
        // Return successful response
        if (data.choices && data.choices[0] && data.choices[0].message) {
            return {
                statusCode: 200,
                headers: { 'Access-Control-Allow-Origin': '*' },
                body: JSON.stringify({ 
                    success: true, 
                    content: data.choices[0].message.content 
                })
            };
        } else {
            return {
                statusCode: 500,
                headers: { 'Access-Control-Allow-Origin': '*' },
                body: JSON.stringify({ success: false, error: 'No response from AI' })
            };
        }
    } catch (error) {
        console.error('Groq function error:', error);
        return {
            statusCode: 500,
            headers: { 'Access-Control-Allow-Origin': '*' },
            body: JSON.stringify({ success: false, error: error.message })
        };
    }
};
