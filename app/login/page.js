"use client";
import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { LogIn } from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      setError(error.message === "Invalid login credentials" ? "Email ou mot de passe incorrect." : error.message);
      return;
    }
    router.push(params.get("redirect") || "/dashboard");
    router.refresh();
  }

  return (
    <form onSubmit={submit} style={{ width: 360, background: "#fff", borderRadius: 12, padding: 32, border: "1px solid #DCE0E8" }}>
      <div style={{ textAlign: "center", marginBottom: 24 }}>
        <div style={{ color: "#DD5509", fontWeight: 700, fontSize: 20 }}>BUYTICLE ETS</div>
        <div style={{ color: "#8896A8", fontSize: 13, marginTop: 2 }}>Connexion à l'espace facturation</div>
      </div>

      <label style={{ display: "block", fontSize: 12, color: "#4A5568", marginBottom: 4 }}>Email</label>
      <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
        style={{ width: "100%", border: "1px solid #DCE0E8", borderRadius: 6, padding: "10px 12px", fontSize: 14, marginBottom: 14, background: "#F7F8FA" }} />

      <label style={{ display: "block", fontSize: 12, color: "#4A5568", marginBottom: 4 }}>Mot de passe</label>
      <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required
        style={{ width: "100%", border: "1px solid #DCE0E8", borderRadius: 6, padding: "10px 12px", fontSize: 14, marginBottom: 18, background: "#F7F8FA" }} />

      {error && <div style={{ color: "#991B1B", fontSize: 13, marginBottom: 14 }}>{error}</div>}

      <button type="submit" disabled={loading}
        style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, background: "#DD5509", color: "#fff", border: "none", borderRadius: 8, padding: "12px", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
        <LogIn size={16} /> {loading ? "Connexion…" : "Se connecter"}
      </button>
    </form>
  );
}

export default function LoginPage() {
  return (
    <div style={{ minHeight: "80vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
