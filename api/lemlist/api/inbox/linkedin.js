export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // Log incoming request for debugging
    console.log('Lemlist LinkedIn API Proxy - Incoming request:', {
      method: req.method,
      headers: req.headers,
      body: req.body
    });

    // Construct the target URL for the Lemlist API
    const targetUrl = 'https://api.lemlist.com/api/inbox/linkedin';

    // Prepare headers
    const headers = {
      'Content-Type': 'application/json',
    };
    
    // Only add authorization if it exists
    if (req.headers.authorization) {
      headers['Authorization'] = req.headers.authorization;
    }

    // Make the request to the Lemlist API
    const response = await fetch(targetUrl, {
      method: req.method,
      headers,
      body: req.body ? JSON.stringify(req.body) : undefined,
    });
    
    // Log the response for debugging
    console.log('Lemlist LinkedIn API Proxy - Response status:', response.status);
    
    // Get the response from the Lemlist API
    let data;
    try {
      data = await response.json();
      // Return the response from Lemlist API to the client
      res.status(response.status).json(data);
    } catch (parseError) {
      // If response is not JSON, return as text
      const text = await response.text();
      console.log('Lemlist LinkedIn API Proxy - Response text:', text);
      res.status(response.status).send(text);
    }
  } catch (error) {
    console.error('Error proxying to Lemlist API:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message
    });
  }
}