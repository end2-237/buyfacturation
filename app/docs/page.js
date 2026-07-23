export const metadata = {
  title: "Documentation API — BuyFacturation",
  description: "Documentation interactive Swagger de l'API BuyFacturation",
};

export default function DocsPage() {
  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: "#0F1623" }}>Documentation API</h1>
        <p style={{ margin: "4px 0 0", color: "#8896A8", fontSize: 13 }}>
          Référence interactive Swagger — teste les endpoints directement depuis cette page.
        </p>
      </div>
      <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5.17.14/swagger-ui.css" />
      <div id="swagger-ui" style={{ background: "#fff", borderRadius: 10, border: "1px solid #DCE0E8", overflow: "hidden" }} />
      <script src="https://unpkg.com/swagger-ui-dist@5.17.14/swagger-ui-bundle.js" defer />
      <script
        defer
        dangerouslySetInnerHTML={{
          __html: `
            window.addEventListener('load', function () {
              function init() {
                if (!window.SwaggerUIBundle) { return setTimeout(init, 100); }
                window.SwaggerUIBundle({
                  url: '/api/openapi',
                  dom_id: '#swagger-ui',
                  deepLinking: true,
                  tryItOutEnabled: true,
                });
              }
              init();
            });
          `,
        }}
      />
    </div>
  );
}
