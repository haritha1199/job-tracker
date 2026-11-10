export const backendURL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

export async function apihelper<T>(method: string, path: string, body?: unknown){
  const token = localStorage.getItem('token');

  const isFormData = body instanceof FormData;

  const response = await fetch (`${backendURL}${path}`, {
    method: method,
    headers: {
      ...(body!== undefined && !isFormData && {"Content-Type": "application/json"}),
      ...(token && {"Authorization": `Bearer ${token}`}),
    }, 
    ...(body!==undefined ? {body: isFormData? body: JSON.stringify(body)} : {})
  });
  if(response.status === 401 && token)
  {
    localStorage.removeItem('token');
    window.location.reload();
  }
  
  const rawText = await response.text();
  let data: unknown;
  try {
    data =  JSON.parse(rawText);
  }
  catch {
    data = rawText;
  }

  if (!response.ok) {
    if(typeof data === 'string' && data!=='') {
      throw new Error(`Request failed: ${data}`);
    }
    else if (typeof data === 'object' && data!==null && 'error' in data) {
      throw new Error(`Request failed: ${data.error}`);
    }
    else {
      throw new Error(`Request failed: ${response.status} ${response.statusText}`);
    }
  }
   return data as T
}