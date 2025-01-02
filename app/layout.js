import './globals.css'

export const metadata = {
  title: 'Yapay Zeka Çözümleri',
  description: 'İşletmenizi yapay zeka ile güçlendirin',
}

export default function RootLayout({ children }) {
  return (
    <html lang="tr">
      <body>{children}</body>
    </html>
  );
} 