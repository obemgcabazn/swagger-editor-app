import { describe, expect, it, vi } from 'vitest';

const mockNextResponseJson = vi.fn((body: unknown, init?: { status?: number }) => ({
  body,
  status: init?.status ?? 200,
}));

vi.mock('next/server', () => ({
  NextResponse: {
    json: (body: unknown, init?: { status?: number }) => mockNextResponseJson(body, init),
  },
}));

const mockParseExecuteRequestPayload = vi.fn();
const mockExecuteExternalRequest = vi.fn();

vi.mock('@/lib/requests/execute-request', () => ({
  executeExternalRequest: (payload: unknown) => mockExecuteExternalRequest(payload),
  parseExecuteRequestPayload: (payload: unknown) => mockParseExecuteRequestPayload(payload),
}));

const mockRecordRequestHistory = vi.fn();
vi.mock('@/lib/requests/request-history', () => ({
  recordRequestHistory: (result: unknown) => mockRecordRequestHistory(result),
}));

import { POST } from '@/app/api/requests/execute/route';

describe('POST /api/requests/execute', () => {
  it('returns 400 when request body is not valid JSON', async () => {
    const request = {
      json: vi.fn().mockRejectedValue(new Error('bad json')),
    } as unknown as Request;

    const response = await POST(request);

    expect(mockNextResponseJson).toHaveBeenCalledWith(
      { error: 'Request body must be valid JSON.' },
      { status: 400 }
    );
    expect(response).toEqual({
      body: { error: 'Request body must be valid JSON.' },
      status: 400,
    });
  });

  it('returns 400 when payload validation fails', async () => {
    const payload = { ok: false };
    const request = { json: vi.fn().mockResolvedValue(payload) } as unknown as Request;

    mockParseExecuteRequestPayload.mockReturnValue({ data: null, error: 'Invalid payload' });

    const response = await POST(request);

    expect(mockParseExecuteRequestPayload).toHaveBeenCalledWith(payload);
    expect(mockExecuteExternalRequest).not.toHaveBeenCalled();
    expect(mockNextResponseJson).toHaveBeenCalledWith(
      { error: 'Invalid payload' },
      { status: 400 }
    );
    expect(response).toEqual({
      body: { error: 'Invalid payload' },
      status: 400,
    });
  });

  it('returns the execute result plus analytics on success', async () => {
    const payload = { request: 'data' };
    const request = { json: vi.fn().mockResolvedValue(payload) } as unknown as Request;

    const parsedPayload = { method: 'GET', url: 'https://api.example.com' };
    const executeResult = { request: parsedPayload, response: { status: 200 }, error: null };

    mockParseExecuteRequestPayload.mockReturnValue({ data: parsedPayload, error: null });
    mockExecuteExternalRequest.mockResolvedValue(executeResult);
    mockRecordRequestHistory.mockResolvedValue({ recorded: true });

    const response = await POST(request);

    expect(mockExecuteExternalRequest).toHaveBeenCalledWith(parsedPayload);
    expect(mockRecordRequestHistory).toHaveBeenCalledWith(executeResult);
    expect(response).toEqual({
      body: {
        analytics: { recorded: true },
        ...executeResult,
      },
      status: 200,
    });
  });

  it('returns the execute result even when history recording throws', async () => {
    const payload = { request: 'data' };
    const request = { json: vi.fn().mockResolvedValue(payload) } as unknown as Request;

    const parsedPayload = { method: 'GET', url: 'https://api.example.com' };
    const executeResult = { request: parsedPayload, response: { status: 200 }, error: null };

    mockParseExecuteRequestPayload.mockReturnValue({ data: parsedPayload, error: null });
    mockExecuteExternalRequest.mockResolvedValue(executeResult);
    mockRecordRequestHistory.mockRejectedValue(new Error('db down'));

    const response = await POST(request);

    expect(response).toEqual({
      body: executeResult,
      status: 200,
    });
  });
});
