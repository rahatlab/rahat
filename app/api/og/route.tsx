import { ImageResponse } from 'next/og'

export const runtime = 'nodejs'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const title = searchParams.get('title') || 'Alex Rivera — Full-Stack Developer'

  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 120,
          background: '#09090b',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#ffffff',
        }}
      >
        <div style={{
          fontFamily: 'Arial',
          fontWeight: 'bold',
          background: 'linear-gradient(135deg, #06b6d4 0%, #8b5cf6 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          marginBottom: 40,
        }}>
          {title}
        </div>
        <div style={{
          fontFamily: 'Arial',
          fontSize: 48,
          color: '#94a3b8',
        }}>
          Portfolio &amp; Blog
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  )
}
