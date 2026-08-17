// Simple localStorage-backed persistence for signature templates & signer profile.
// Everything stays in the browser — nothing is uploaded anywhere.

const SIG_KEY = "esign:signatures";
const PROFILE_KEY = "esign:profile";

export function loadSignatures() {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(SIG_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveSignature(sig) {
  const all = loadSignatures();
  const next = [sig, ...all].slice(0, 20); // cap library size
  window.localStorage.setItem(SIG_KEY, JSON.stringify(next));
  return next;
}

export function deleteSignature(id) {
  const all = loadSignatures().filter((s) => s.id !== id);
  window.localStorage.setItem(SIG_KEY, JSON.stringify(all));
  return all;
}

export function loadProfile() {
  if (typeof window === "undefined") return { name: "" };
  try {
    const raw = window.localStorage.getItem(PROFILE_KEY);
    return raw ? JSON.parse(raw) : { name: "" };
  } catch {
    return { name: "" };
  }
}

export function saveProfile(profile) {
  window.localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
}
