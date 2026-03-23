// netlify/functions/yakit.js
// Sunucu tarafında yakıt fiyatı çeker, CORS sorununu aşar
exports.handler = async function(event, context) {
  try {
    const response = await fetch('http://hasanadiguzel.com.tr/api/akaryakit/sehir=kayseri', {
      headers: { 'Accept': 'application/json' },
      signal: AbortSignal.timeout(8000) // 8 saniye timeout
    });
    if (!response.ok) throw new Error('API error: ' + response.status);
    const data = await response.json();
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, max-age=3600' // 1 saat cache
      },
      body: JSON.stringify(data)
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: err.message })
    };
  }
};
