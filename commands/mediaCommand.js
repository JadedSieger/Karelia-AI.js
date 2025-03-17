const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require('fs');
const path = require('path');

// Use native fetch if available (Node.js 18+), otherwise use node-fetch
const fetch = globalThis.fetch || require('node-fetch');

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.g_apiKey);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" }); // Use Gemini 2.0 Flash for multimodal inputs

// Function to analyze media
async function analyzeMedia(message, filePath) {
  try {
    // Read the file as a base64 string
    const fileData = fs.readFileSync(filePath);
    const base64Data = fileData.toString('base64');

    // Prepare the prompt
    const prompt = "Describe this image or GIF in a fun and engaging way.";

    // Send the media to Gemini 2.0 Flash
    const result = await model.generateContent([prompt, { inlineData: { data: base64Data, mimeType: "image/jpeg" } }]);
    const response = result.response.text();

    // Return the analysis result
    return response;
  } catch (error) {
    console.error("Error analyzing media:", error);
    throw new Error("Sorry, I couldn't analyze that media. Please try again.");
  } finally {
    // Clean up: Delete the temporary file
    fs.unlinkSync(filePath);
  }
}

// Export the media command
module.exports = {analyzeMedia};