
import './globals.css'

import { PHProvider } from '@/providers/posthogProvider'
import Navbar from './components/banner'
import LightRaysRoot from './components/LightRaysRoot'



export default function RootLayout ({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang='en'>
      <body>
        <div className='relative' style={{ width: '100%', height: '100%' }}>
          <Navbar />

          <div className='pointer-events-none absolute inset-0 -z-10'>
            <LightRaysRoot
              raysOrigin='top-center-offset'
              raysColor='#00ffff'
              raysSpeed={1.5}
              lightSpread={0.8}
              rayLength={1.2}
              followMouse={true}
              mouseInfluence={0.1}
              noiseAmount={0.1}
              distortion={0.05}
              className='custom-rays'
            />
          </div>

          <PHProvider>{children}</PHProvider>
        </div>
      </body>
    </html>
  )
}

