const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8000';

export async function postJson(path, body) {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(body),
  });
  let data = null;
  try {
    data = await res.json();
  } catch {
    // ignore parse errors for empty responses
  }
  if (!res.ok) {
    // FastAPI may return {detail: [{loc, msg, type}, ...]} for validation errors
    const message = Array.isArray(data?.detail)
      ? data.detail.map((d) => d.msg).join(', ')
      : (data && (data.detail || data.message)) || `Request failed (${res.status})`;
    const err = new Error(message);
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

export async function getJson(path) {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: 'GET',
    credentials: 'include',
  });
  const data = await res.json();
  if (!res.ok) {
    const message = Array.isArray(data?.detail)
      ? data.detail.map((d) => d.msg).join(', ')
      : (data && (data.detail || data.message)) || `Request failed (${res.status})`;
    const err = new Error(message);
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

export async function patchJson(path, body) {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(body),
  });
  let data = null;
  try {
    data = await res.json();
  } catch {
    // ignore parse errors for empty responses
  }
  if (!res.ok) {
    const message = Array.isArray(data?.detail)
      ? data.detail.map((d) => d.msg).join(', ')
      : (data && (data.detail || data.message)) || `Request failed (${res.status})`;
    const err = new Error(message);
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

export async function deleteJson(path) {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: 'DELETE',
    credentials: 'include',
  });
  let data = null;
  try {
    data = await res.json();
  } catch {
    // allow empty body (e.g., 204 No Content)
  }
  if (!res.ok) {
    const message = Array.isArray(data?.detail)
      ? data.detail.map((d) => d.msg).join(', ')
      : (data && (data.detail || data.message)) || `Request failed (${res.status})`;
    const err = new Error(message);
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}


