/**
 * API service for Launchpad waitlist/contact form submissions.
 * Endpoint: POST https://qavixbackend-production.up.railway.app/api/launchpad
 */

export const LAUNCHPAD_API_URL =
  process.env.NEXT_PUBLIC_LAUNCHPAD_API_URL ||
  (process.env.NEXT_PUBLIC_API_URL
    ? `${process.env.NEXT_PUBLIC_API_URL.replace(/\/+$/, '')}/launchpad`
    : 'https://qavixbackend-production.up.railway.app/api/launchpad');

export interface LaunchpadFormPayload {
  full_name: string;
  name?: string;
  email: string;
  whatsapp_number: string;
  whatsapp?: string;
  phone?: string;
  startup_name?: string;
  startup?: string;
  industry?: string;
}

export interface LaunchpadApiResponse {
  success: boolean;
  message: string;
  data?: {
    id?: number;
    full_name?: string;
    email?: string;
    whatsapp_number?: string;
    startup_name?: string;
    industry?: string;
    created_at?: string;
    [key: string]: unknown;
  };
  errors?: Record<string, string[] | string>;
}

export async function submitLaunchpadForm(
  payload: LaunchpadFormPayload
): Promise<LaunchpadApiResponse> {
  const response = await fetch(LAUNCHPAD_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json().catch(() => null);

  if (response.ok && (data?.success || response.status === 201 || response.status === 200)) {
    return {
      success: true,
      message:
        data?.message ||
        'Thank you for applying to the Launchpad! Welcome to the first 100 founders. Our team will connect with you on WhatsApp shortly.',
      data: data?.data,
    };
  }

  let errorMsg = data?.message || `Request failed with status ${response.status}`;
  if (data?.errors) {
    const entries = Object.entries(data.errors);
    if (entries.length > 0 && entries[0]) {
      const firstVal = entries[0][1];
      if (Array.isArray(firstVal) && firstVal.length > 0 && firstVal[0]) {
        errorMsg = firstVal[0];
      } else if (typeof firstVal === 'string') {
        errorMsg = firstVal;
      }
    }
  }

  return {
    success: false,
    message: errorMsg,
    errors: data?.errors,
  };
}
