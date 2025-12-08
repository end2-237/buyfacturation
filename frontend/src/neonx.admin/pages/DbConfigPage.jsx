import React, { useEffect, useState } from "react";

export default function DbConfigPage() {
  const [dbConfig, setDbConfig] = useState(null);

  useEffect(() => {
    fetch("http://localhost:3000/neonx/db-config")
      .then(res => res.json())
      .then(setDbConfig)
      .catch(err => console.error(err));
  }, []);

  if (!dbConfig) return <p>Chargement de la configuration DB...</p>;

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">🗄 Configuration Base de Données</h1>
      {dbConfig.tables.map(table => (
        <div key={table.name} className="mb-6 bg-white p-4 shadow rounded">
          <h2 className="text-xl font-semibold">{table.name}</h2>
          <table className="table-auto mt-2 w-full border">
            <thead>
              <tr>
                <th>Nom du champ</th>
                <th>Type</th>
                <th>Clé primaire</th>
              </tr>
            </thead>
            <tbody>
              {table.fields.map(f => (
                <tr key={f.name}>
                  <td>{f.name}</td>
                  <td>{f.type}</td>
                  <td>{f.primary ? "✅" : ""}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
}
