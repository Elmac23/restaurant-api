import apiClient from '../client';

export async function resetPasswordRequest(email: string) {
  // Wysyłka żądania resetu hasła do backendu
  const res = await fetch('/api/auth/request-change-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email })
  });
  if (!res.ok) throw new Error('Błąd resetowania hasła');
}

export async function resetPassword(token: string, password: string) {
  // Ustawienie nowego hasła z tokenem
  const res = await fetch(`/api/auth/reset-password?token=${token}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password })
  });
  if (!res.ok) throw new Error('Błąd ustawiania nowego hasła');
}

export async function getUsersFiltered(params: { email?: string; firstname?: string; lastname?: string; role?: string; city?: string }) {
  const query = new URLSearchParams();
  if (params.email) query.append('email', params.email);
  if (params.firstname) query.append('firstname', params.firstname);
  if (params.lastname) query.append('lastname', params.lastname);
  if (params.role) query.append('role', params.role);
  if (params.city) query.append('city', params.city);
  const response = await apiClient.get(`/users?${query.toString()}`);
  return response.data;
}

export async function registerUser(data: any) {
  const res = await fetch('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Błąd rejestracji');
  return await res.json();
}

export async function getUserProfile(id: string) {
  const res = await apiClient.get(`/users/${id}`);
  return res.data;
}

export async function updateUserProfile(id: string, data: any) {
  // Jeśli hasło jest puste, nie wysyłaj go do backendu
  const payload = { ...data };
  if (!payload.password) delete payload.password;
  const res = await apiClient.patch(`/users/${id}`, payload);
  return res.data;
}