const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080';
const SCENARIOS_URL = `${API_BASE_URL}/api/v1/scenarios`;

async function request(path = '', options = {}) {
  const response = await fetch(`${SCENARIOS_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (response.status === 204) {
    return null;
  }

  const contentType = response.headers.get('content-type') ?? '';
  const data = contentType.includes('application/json') ? await response.json() : null;

  if (!response.ok) {
    const message =
      data?.message ??
      data?.mensagem ??
      data?.error ??
      data?.detail ??
      'Nao foi possivel concluir a operacao.';
    const error = new Error(message);
    error.status = response.status;
    error.codigo = data?.code ?? data?.codigo;
    throw error;
  }

  return data;
}

export function listarCenarios() {
  return request();
}

export function buscarCenario(id) {
  return request(`/${id}`);
}

export function criarCenario(payload) {
  return request('', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function atualizarCenario(id, payload) {
  return request(`/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export function excluirCenario(id) {
  return request(`/${id}`, {
    method: 'DELETE',
  });
}

export function resolverCenario(id) {
  return request(`/${id}/solve`, {
    method: 'POST',
  });
}

export function buscarSolucao(id) {
  return request(`/${id}/solution`);
}
