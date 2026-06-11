import "./globals.css";
import Sidebar from "@/components/Sidebar";

export const metadata = {
  title: "BuyFacturation — BUYTICLE ETS",
  description: "Gestion des factures BUYTICLE ETS",
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body style={{ display: "flex", minHeight: "100vh" }}>
        <Sidebar />
        <main style={{ flex: 1, padding: "28px", overflowY: "auto" }}>
          {children}
        </main>
      </body>
    </html>
  );
}
