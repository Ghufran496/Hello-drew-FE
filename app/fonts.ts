import localFont from 'next/font/local'

export const harmoniaSansPro = localFont({
  src: [
    {
      path: '../public/Harmonia-Sans-Regular.otf',
      weight: '400',
    },
    {
      path: '../public/Harmonia-Sans-Bold.otf',
      weight: '700',
    }
  ],
  variable: '--font-harmonia'
}) 