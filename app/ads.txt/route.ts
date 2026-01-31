export async function GET() {
  const adsContent = `google.com, pub-6676446565175753, DIRECT, f08c47fec0942fa0`;

  return new Response(adsContent, {
    headers: {
      'Content-Type': 'text/plain',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
