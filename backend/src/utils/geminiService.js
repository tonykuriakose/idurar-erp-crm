const { GoogleGenerativeAI } = require('@google/generative-ai');

class GeminiService {
  constructor() {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not configured');
    }
    
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  }

  /**
   * Generate summary of invoice notes
   * @param {Array} notes - Array of note objects with content field
   * @returns {Promise<string>} - AI generated summary
   */
  async generateInvoiceNoteSummary(notes) {
    try {
      // Handle empty notes
      if (!notes || notes.length === 0) {
        return 'No notes available to summarize.';
      }

      // Extract note content
      const noteContents = notes.map(note => note.content || note).filter(Boolean);
      
      if (noteContents.length === 0) {
        return 'No valid notes content found.';
      }

      // Create prompt for invoice note summarization
      const prompt = `
        Please provide a concise summary of the following invoice notes. 
        Focus on key points, issues, resolutions, and important communications.
        Keep the summary professional and under 150 words.

        Invoice Notes:
        ${noteContents.map((note, index) => `${index + 1}. ${note}`).join('\n')}

        Summary:
      `;

      const result = await this.model.generateContent(prompt);
      const summary = result.response.text().trim();

      return summary || 'Unable to generate summary at this time.';

    } catch (error) {
      console.error('Gemini API Error:', error);
      
      // Handle rate limiting
      if (error.message.includes('429') || error.message.includes('rate limit')) {
        return 'Summary service temporarily unavailable due to rate limits. Please try again later.';
      }
      
      // Handle quota exceeded
      if (error.message.includes('quota') || error.message.includes('billing')) {
        return 'Summary service unavailable. Please check API quota and billing.';
      }

      // Generic error
      return 'Unable to generate summary. Please try again later.';
    }
  }

  /**
   * Generate summary for general text content
   * @param {string} content - Text content to summarize
   * @param {number} maxWords - Maximum words in summary (default: 100)
   * @returns {Promise<string>} - AI generated summary
   */
  async generateTextSummary(content, maxWords = 100) {
    try {
      if (!content || content.trim().length === 0) {
        return 'No content available to summarize.';
      }

      const prompt = `
        Please provide a concise summary of the following content in no more than ${maxWords} words:

        ${content}

        Summary:
      `;

      const result = await this.model.generateContent(prompt);
      return result.response.text().trim();

    } catch (error) {
      console.error('Gemini Text Summary Error:', error);
      return 'Unable to generate text summary.';
    }
  }

  /**
   * Test connection to Gemini API
   * @returns {Promise<boolean>} - True if connection successful
   */
  async testConnection() {
    try {
      const result = await this.model.generateContent('Hello, test connection');
      return !!result.response.text();
    } catch (error) {
      console.error('Gemini connection test failed:', error);
      return false;
    }
  }
}

module.exports = new GeminiService();