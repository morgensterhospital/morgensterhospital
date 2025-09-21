// API service for Netlify functions
const API_BASE = '/.netlify/functions';

class ApiService {
  async request(endpoint, options = {}) {
    const url = `${API_BASE}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);

      // Handle PDF responses first, since they are not JSON
      if (response.headers.get('content-type')?.includes('application/pdf')) {
        if (!response.ok) {
          throw new Error(`Failed to generate PDF: ${response.status} ${response.statusText}`);
        }
        return response.blob();
      }

      // Read the response body as text to avoid `SyntaxError` for non-JSON content.
      const text = await response.text();

      // Check if the response is not OK
      if (!response.ok) {
        let errorData = {};
        try {
          // Attempt to parse text as JSON, if possible
          errorData = JSON.parse(text);
        } catch (e) {
          // If not JSON, use the plain text
          errorData.details = text;
        }

        // Throw a custom error with details
        const errorMessage = errorData.error || errorData.details || `HTTP error! status: ${response.status} ${response.statusText}`;
        const error = new Error(errorMessage);
        error.status = response.status;
        error.data = errorData;
        throw error;
      }
      
      // If the response is empty, return null or a success message
      if (!text) {
        return { message: 'Success, no content' };
      }

      // If response is JSON, parse and return it
      return JSON.parse(text);
      
    } catch (error) {
      // Re-throw the error after logging.
      // The original error (either from fetch or the custom one above) is preserved.
      console.error(`API request failed for ${endpoint}:`, error);
      throw error;
    }
  }

  // ... all other methods remain the same ...

  async seedUsers() {
    return this.request('/seed-users', {
      method: 'POST'
    });
  }

  // You can now simplify `generateReportPDF` as it's handled by `request`.
  // Or keep it separate if you need the specific download logic.
  // The logic inside this method is still correct, but it makes the API service inconsistent.

  // ... all other methods ...
}

export default new ApiService();
