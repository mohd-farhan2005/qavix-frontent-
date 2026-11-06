import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { submitLaunchpadForm, LAUNCHPAD_API_URL } from '@/lib/launchpad-api';

describe('Launchpad API integration', () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it('targets the configured or default API endpoint', () => {
    expect(LAUNCHPAD_API_URL).toContain('/launchpad');
  });

  it('submits form payload with correct headers and receives 201 Created', async () => {
    const mockSuccessResponse = {
      success: true,
      message:
        'Thank you for applying to the Launchpad! Welcome to the first 100 founders. Our team will connect with you on WhatsApp shortly.',
      data: {
        id: 5,
        full_name: 'Aarav Sharma',
        email: 'aarav@example.com',
        whatsapp_number: '+91 98765 43210',
        startup_name: 'NeuroFlow AI',
        industry: 'Artificial Intelligence & SaaS',
        created_at: '2026-11-06T06:30:00.000000Z',
      },
    };

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 201,
      json: async () => mockSuccessResponse,
    });
    globalThis.fetch = fetchMock;

    const payload = {
      full_name: 'Aarav Sharma',
      email: 'aarav@example.com',
      whatsapp_number: '+91 98765 43210',
      startup_name: 'NeuroFlow AI',
      industry: 'Artificial Intelligence & SaaS',
    };

    const result = await submitLaunchpadForm(payload);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith(
      LAUNCHPAD_API_URL,
      expect.objectContaining({
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(payload),
      })
    );

    expect(result.success).toBe(true);
    expect(result.message).toBe(mockSuccessResponse.message);
    expect(result.data?.id).toBe(5);
  });

  it('handles backend 422 validation errors gracefully', async () => {
    const mockErrorResponse = {
      message: 'The email has already been taken.',
      errors: {
        email: ['The email has already been taken.'],
      },
    };

    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 422,
      json: async () => mockErrorResponse,
    });
    globalThis.fetch = fetchMock;

    const result = await submitLaunchpadForm({
      full_name: 'Test Founder',
      email: 'taken@example.com',
      whatsapp_number: '+919876543210',
    });

    expect(result.success).toBe(false);
    expect(result.message).toBe('The email has already been taken.');
    expect(result.errors?.email).toEqual(['The email has already been taken.']);
  });
});

