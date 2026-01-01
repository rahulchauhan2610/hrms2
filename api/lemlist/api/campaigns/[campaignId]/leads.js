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
    // Get the campaign ID from the query parameters
    const { campaignId } = req.query;

    // Construct the target URL for the Lemlist API
    const targetUrl = `https://api.lemlist.com/api/campaigns/${campaignId}/leads/`;

    // Prepare headers, preserving the Authorization header
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': req.headers.authorization || '',
    };

    // Make the request to the Lemlist API
    const response = await fetch(targetUrl, {
      method: req.method,
      headers,
      body: req.body ? JSON.stringify(req.body) : undefined,
    });

    // Get the response from the Lemlist API
    let data;
    try {
      data = await response.json();
      // Return the response from Lemlist API to the client
      res.status(response.status).json(data);
    } catch (parseError) {
      // If response is not JSON, return as text
      const text = await response.text();
      res.status(response.status).send(text);
    }
  } catch (error) {
    console.error('Error proxying to Lemlist API:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}