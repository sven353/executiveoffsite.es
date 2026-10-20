// Client-side helper for Netlify Forms. The matching static forms live in public/__forms.html
// so Netlify detects them at deploy time.
export async function submitNetlifyForm(
  formName: string,
  data: Record<string, string>
): Promise<{ ok: boolean }> {
  const body = new URLSearchParams({ "form-name": formName, ...data }).toString();
  try {
    const res = await fetch("/__forms.html", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
    });
    if (!res.ok) throw new Error(`Form endpoint returned ${res.status}`);
    return { ok: true };
  } catch (err) {
    if (process.env.NODE_ENV !== "production") {
      // Netlify Forms only exist on Netlify. Let the UI be tested locally.
      console.warn("Netlify Forms are not available in development. Submission skipped.", err);
      return { ok: true };
    }
    return { ok: false };
  }
}
