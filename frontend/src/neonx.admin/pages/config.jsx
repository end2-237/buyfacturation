import React, { useEffect, useState } from "react";

export default function ConfigPage() {
  const [config, setConfig] = useState(null);

  useEffect(() => {
    fetch("http://localhost:3000/neonx/config")
      .then((res) => res.json())
      .then((data) => setConfig(data.config)) // ✅ corrige ici
      .catch((err) => console.error("Erreur chargement config:", err));
  }, []);

  if (!config) return <p className="text-center mt-10">Chargement de la configuration...</p>;

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-3xl font-bold text-center mb-6">⚙️ Configuration NeonX</h1>

      <div className="max-w-3xl mx-auto bg-white shadow p-6 rounded-lg">
        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Serveur</h2>
          <p>Port: {config.server.port}</p>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Base de données</h2>
          <p>Type: {config.database.type}</p>
          <p>Nom: {config.database.name}</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">Fonctionnalités</h2>
          <ul>
            {Object.entries(config.features).map(([key, value]) => (
              <li key={key}>
                {key}: {value ? "✅ Activé" : "❌ Désactivé"}
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
