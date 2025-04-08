// api/analyze-meal.js
import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';

// Helper function to load prompt template directly
function loadPromptTemplate() {
  try {
    // Attempt to read the prompt file directly from the filesystem
    const promptPath = path.join(process.cwd(), 'src', 'config', 'prompts', 'mealAnalysisPrompt.js');
    
    if (fs.existsSync(promptPath)) {
      // If file exists, dynamically import it
      const promptModule = require(promptPath);
      return promptModule.getMealAnalysisPrompt;
    } else {
      // Fallback prompt if file not found
      return (transcript) => `
        You are an assistant that processes meal descriptions to extract food items and estimate nutritional content. Given the following transcribed text, please:
        1. Identify each food item mentioned.
        2. Estimate the portion size if it is specified.
        3. Estimate the protein content in grams and calories for each food item.
        4. Estimate carbs and fats as well.
        5. Assign a confidence level ("high", "medium", or "low") to each estimation.
        6. Extract the meal time if mentioned (e.g., breakfast, lunch, dinner, or snack).
        7. Return the output as valid JSON with the following structure:
        
        {
          "mealTime": "<meal time if detected, otherwise null>",
          "foodItems": [
            {
              "name": "<food name>",
              "estimatedAmount": "<portion details if available, otherwise null>",
              "protein": <estimated protein in grams as a number>,
              "calories": <estimated calories as a number>,
              "carbs": <estimated carbs in grams as a number>,
              "fat": <estimated fat in grams as a number>,
              "confidence": "<confidence level>"
            }
          ],
          "totalProtein": <sum of protein values as a number>,
          "totalCalories": <sum of calories values as a number>,
          "totalCarbs": <sum of carbs values as a number>,
          "totalFat": <sum of fat values as a number>
        }
        
        Here is the transcribed text:
        "${transcript}"
      `;
    }
  } catch (error) {
    console.error('Error loading prompt template:', error);
    // Return a simplified fallback prompt
    return (transcript) => `Analyze this meal: "${transcript}" and return a JSON with mealTime, foodItems (array with name, protein, calories, carbs, fat), totalProtein, totalCalories, totalCarbs, and totalFat.`;
  }
}

export default async function handler(req, res) {
  console.log('API handler received request:', { 
    method: req.method,
    url: req.url,
    headers: {
      'content-type': req.headers['content-type'],
      'user-agent': req.headers['user-agent']
    },
    bodyLength: req.body ? JSON.stringify(req.body).length : 0
  });

  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // Handle OPTIONS request for CORS preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow POST requests for actual processing
  if (req.method !== 'POST') {
    console.log('Method not allowed:', req.method);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Validate request body
  if (!req.body) {
    console.log('No request body provided');
    return res.status(400).json({ error: 'Request body is required' });
  }

  // Extract transcript from request body
  const { transcript } = req.body;
  
  if (!transcript) {
    console.log('No transcript provided in request body');
    return res.status(400).json({ error: 'No transcript provided' });
  }

  // Verify API key is available without logging it
  if (!process.env.OPENAI_API_KEY) {
    console.error('OPENAI_API_KEY is not defined in environment variables');
    return res.status(500).json({ 
      error: 'Server configuration error',
      details: 'API key not configured' 
    });
  }

  try {
    console.log('Processing transcript:', transcript);

    // Initialize OpenAI with server-side API key
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      timeout: 30000, // 30 second timeout to prevent hanging requests
    });

    // Get the prompt function
    const getMealAnalysisPrompt = loadPromptTemplate();
    const prompt = getMealAnalysisPrompt(transcript);

    console.log('Sending request to OpenAI');

    // Call OpenAI API with proper error handling
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: prompt
        }
      ],
      temperature: 0.3,
      response_format: { type: "json_object" },
      max_tokens: 800
    });

    // Verify we got a valid response
    if (!response.choices || !response.choices.length) {
      console.error('Invalid response structure from OpenAI:', response);
      throw new Error('Invalid response from AI service');
    }

    const responseContent = response.choices[0].message.content;
    console.log('Received response from OpenAI:', responseContent.substring(0, 200) + '...');

    // Safely parse JSON with error handling
    let mealData;
    try {
      mealData = JSON.parse(responseContent);
    } catch (parseError) {
      console.error('JSON parse error:', parseError.message);
      console.error('Raw response:', responseContent);
      throw new Error(`Failed to parse AI response: ${parseError.message}`);
    }

    // Validate the response has required fields
    if (!mealData || typeof mealData !== 'object') {
      throw new Error('Invalid response format from AI service');
    }

    // Extract food item names for display and ensure necessary fields exist
    const foodItemNames = Array.isArray(mealData.foodItems) 
      ? mealData.foodItems.map(item => typeof item === 'object' ? (item.name || 'Unknown item') : String(item))
      : [transcript];

    // Validate meal type
    const validMealTypes = ['breakfast', 'lunch', 'dinner', 'snack', 'dessert'];
    if (!mealData.mealTime || !validMealTypes.includes(mealData.mealTime.toLowerCase())) {
      // Default to the most appropriate meal type based on time of day
      const hourOfDay = new Date().getHours();
      
      if (hourOfDay >= 4 && hourOfDay < 11) {
        mealData.mealTime = 'breakfast';
      } else if (hourOfDay >= 11 && hourOfDay < 16) {
        mealData.mealTime = 'lunch';
      } else if (hourOfDay >= 16 && hourOfDay < 22) {
        mealData.mealTime = 'dinner';
      } else {
        mealData.mealTime = 'snack';
      }
      
      console.log(`Invalid meal type detected. Defaulting to: ${mealData.mealTime}`);
    }
    
    // Create the final meal data object with default values for missing fields
    const finalMealData = {
      description: transcript,
      mealType: mealData.mealTime.toLowerCase() || 'unspecified',
      foodItems: foodItemNames,
      calories: parseFloat(mealData.totalCalories) || 0,
      protein: parseFloat(mealData.totalProtein) || 0,
      carbs: parseFloat(mealData.totalCarbs) || 0,
      fat: parseFloat(mealData.totalFat) || 0,
      timestamp: new Date(),
      rawAnalysis: mealData
    };

    console.log('Final meal data:', finalMealData);

    // Return the processed data
    return res.status(200).json(finalMealData);
  } catch (error) {
    // Detailed error logging
    console.error('Error processing meal request:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });

    // Check for specific OpenAI errors
    if (error.response) {
      console.error('OpenAI API Error Response:', {
        status: error.response.status,
        data: error.response.data
      });
    }
    
    // Create fallback data for a graceful response even during errors
    const fallbackData = {
      description: transcript || 'Unknown meal',
      mealType: 'unknown',
      foodItems: [transcript || 'Unknown food'],
      calories: 100,
      protein: 5,
      carbs: 15,
      fat: 5,
      timestamp: new Date(),
      processingError: error.message
    };
    
    // Return fallback data with 200 status to prevent frontend errors
    // Including error details for debugging without crashing the app
    return res.status(200).json({
      ...fallbackData,
      error: true,
      errorDetails: error.message
    });
  }
}