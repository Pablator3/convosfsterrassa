import "./globals.css";

export const metadata = {
  title: "Acceso privado | Fundació Terrassa FC 1906",
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}