import { describe, it, expect, vi, beforeEach } from 'vitest';
import { apiClient } from '../services/api/client';

describe('ApiClient Single Response Body Consumption & Error Handling', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('correctly parses successful JSON response consuming stream once', async () => {
    const mockData = { id: 'usr-1', email: 'test@lab.org' };
    const mockResponse = new Response(JSON.stringify(mockData), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(mockResponse);

    const result = await apiClient.get('/auth/me');
    expect(result).toEqual(mockData);
  });

  it('correctly parses 204 No Content response without error', async () => {
    const mockResponse = new Response(null, {
      status: 204,
    });

    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(mockResponse);

    const result = await apiClient.delete('/projects/proj-1');
    expect(result).toBeNull();
  });

  it('extracts backend JSON error detail without throwing Body consumed error', async () => {
    const errorJson = { detail: 'Incorrect email or password' };
    const mockResponse = new Response(JSON.stringify(errorJson), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });

    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(mockResponse);

    try {
      await apiClient.post('/auth/login', { email: 'wrong@lab.org', password: 'bad' });
      expect.fail('Expected error was not thrown');
    } catch (err: any) {
      expect(err.message).toBe('Incorrect email or password');
      expect(err.status).toBe(401);
      expect(err.message).not.toContain('Body has already been consumed');
    }
  });

  it('extracts backend plain-text error without throwing Body consumed error', async () => {
    const plainTextError = '502 Bad Gateway: Upstream timeout';
    const mockResponse = new Response(plainTextError, {
      status: 502,
      headers: { 'Content-Type': 'text/plain' },
    });

    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(mockResponse);

    try {
      await apiClient.get('/questions');
      expect.fail('Expected error was not thrown');
    } catch (err: any) {
      expect(err.message).toBe(plainTextError);
      expect(err.status).toBe(502);
      expect(err.message).not.toContain('Body has already been consumed');
    }
  });

  it('handles empty error response gracefully', async () => {
    const mockResponse = new Response('', {
      status: 500,
      statusText: 'Internal Server Error',
    });

    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(mockResponse);

    try {
      await apiClient.get('/gaps');
      expect.fail('Expected error was not thrown');
    } catch (err: any) {
      expect(err.status).toBe(500);
      expect(err.message).toBe('Internal Server Error');
      expect(err.message).not.toContain('Body has already been consumed');
    }
  });

  it('standardizes endpoints under /api/v1 prefix automatically', async () => {
    let capturedUrl = '';
    vi.spyOn(globalThis, 'fetch').mockImplementationOnce(async (url) => {
      capturedUrl = url.toString();
      return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    });

    await apiClient.post('/auth/oauth/dev-connect', { provider: 'google' });
    expect(capturedUrl).toBe('/api/v1/auth/oauth/dev-connect');
  });

  it('formats HTML 404 errors cleanly instead of dumping raw markup', async () => {
    const html404 = '<!DOCTYPE html><html><body><h1>Page not found (404)</h1></body></html>';
    const mockResponse = new Response(html404, {
      status: 404,
      statusText: 'Not Found',
      headers: { 'Content-Type': 'text/html' },
    });

    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(mockResponse);

    try {
      await apiClient.get('/non-existent-route');
      expect.fail('Expected error was not thrown');
    } catch (err: any) {
      expect(err.status).toBe(404);
      expect(err.message).toContain('API endpoint error (404)');
      expect(err.message).toContain('/api/v1/non-existent-route');
      expect(err.message).not.toContain('<!DOCTYPE');
    }
  });
});
