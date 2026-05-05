const BASE = "http://localhost:3001";

export async function seedUser(email: string, name: string, password: string) {
  const res = await fetch(`${BASE}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, name, password }),
  });
  const body = await res.json();
  if (res.status !== 201) throw new Error(`Seed register failed: ${body.message}`);
  return body as { token: string; user: { id: string; email: string; name: string } };
}
