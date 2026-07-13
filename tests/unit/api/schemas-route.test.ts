import { afterEach, describe, expect, it, vi } from 'vitest';

type QueryResult = Readonly<{
  data: unknown;
  error: { message: string } | null;
}>;

function createSupabaseTableMock(
  result: QueryResult,
  updateError: { message: string } | null = null
) {
  const maybeSingle = vi.fn().mockResolvedValue(result);
  const updateEq = vi.fn().mockResolvedValue({ error: updateError });
  const insert = vi.fn().mockResolvedValue({ error: updateError });

  const chain = {
    eq: vi.fn(),
    insert,
    limit: vi.fn(),
    maybeSingle,
    order: vi.fn(),
    select: vi.fn(),
    update: vi.fn(() => ({ eq: updateEq })),
  };

  chain.eq.mockReturnValue(chain);
  chain.limit.mockReturnValue(chain);
  chain.order.mockReturnValue(chain);
  chain.select.mockReturnValue(chain);

  return { chain, insert, maybeSingle, updateEq };
}

const { mockCreateSupabaseServerClient, mockFrom, mockGetAuthClaims } = vi.hoisted(() => {
  const mockGetAuthClaims = vi.fn();
  const mockFrom = vi.fn();
  const mockCreateSupabaseServerClient = vi.fn(async () => ({ from: mockFrom }));

  return { mockCreateSupabaseServerClient, mockFrom, mockGetAuthClaims };
});

vi.mock('@/lib/supabase/server', () => ({
  createSupabaseServerClient: mockCreateSupabaseServerClient,
  getAuthClaims: mockGetAuthClaims,
}));

import { GET, POST } from '@/app/api/schemas/route';

const FULL = JSON.stringify({ openapi: '3.0.0', info: { title: 'T', version: '1' }, paths: {} });

function mockAuthenticatedClaims() {
  mockGetAuthClaims.mockResolvedValue({ sub: 'user-1' });
}

describe('GET /api/schemas', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('returns 401 when the user is not authenticated', async () => {
    mockGetAuthClaims.mockResolvedValue(null);

    const response = await GET();

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({ error: 'Unauthorized' });
    expect(mockFrom).not.toHaveBeenCalled();
  });

  it('returns the saved schema for the authenticated user', async () => {
    mockAuthenticatedClaims();
    const { chain } = createSupabaseTableMock({
      data: { content: FULL, format: 'json' },
      error: null,
    });
    mockFrom.mockReturnValue(chain);

    const response = await GET();

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ content: FULL, format: 'json' });
    expect(chain.select).toHaveBeenCalledWith('content, format');
    expect(chain.eq).toHaveBeenCalledWith('user_id', 'user-1');
  });

  it('returns an empty schema when the user has no saved row', async () => {
    mockAuthenticatedClaims();
    const { chain } = createSupabaseTableMock({ data: null, error: null });
    mockFrom.mockReturnValue(chain);

    const response = await GET();

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ content: '', format: 'yaml' });
  });

  it('returns 500 when Supabase returns an error', async () => {
    mockAuthenticatedClaims();
    const { chain } = createSupabaseTableMock({ data: null, error: { message: 'db down' } });
    mockFrom.mockReturnValue(chain);

    const response = await GET();

    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toEqual({ error: 'db down' });
  });
});

describe('POST /api/schemas', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('returns 401 when the user is not authenticated', async () => {
    mockGetAuthClaims.mockResolvedValue(null);

    const response = await POST(
      new Request('http://localhost/api/schemas', {
        method: 'POST',
        body: JSON.stringify({ content: FULL, format: 'json' }),
      })
    );

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({ error: 'Unauthorized' });
  });

  it('returns 400 for invalid JSON', async () => {
    mockAuthenticatedClaims();

    const response = await POST(
      new Request('http://localhost/api/schemas', {
        method: 'POST',
        body: 'not-json',
      })
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({ error: 'Invalid JSON body' });
  });

  it('returns 400 when required fields are missing', async () => {
    mockAuthenticatedClaims();

    const response = await POST(
      new Request('http://localhost/api/schemas', {
        method: 'POST',
        body: JSON.stringify({ content: FULL }),
      })
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({ error: 'content and format are required' });
  });

  it('returns 400 for unsupported formats', async () => {
    mockAuthenticatedClaims();

    const response = await POST(
      new Request('http://localhost/api/schemas', {
        method: 'POST',
        body: JSON.stringify({ content: FULL, format: 'xml' }),
      })
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({ error: 'format must be json or yaml' });
  });

  it('updates an existing saved schema', async () => {
    mockAuthenticatedClaims();
    const { chain, updateEq } = createSupabaseTableMock({
      data: { id: 'schema-1' },
      error: null,
    });
    mockFrom.mockReturnValue(chain);

    const response = await POST(
      new Request('http://localhost/api/schemas', {
        method: 'POST',
        body: JSON.stringify({ content: FULL, format: 'yaml' }),
      })
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ success: true });
    expect(chain.update).toHaveBeenCalled();
    expect(updateEq).toHaveBeenCalledWith('id', 'schema-1');
    expect(chain.insert).not.toHaveBeenCalled();
  });

  it('returns 500 when update fails', async () => {
    mockAuthenticatedClaims();
    const { chain } = createSupabaseTableMock(
      { data: { id: 'schema-1' }, error: null },
      { message: 'update failed' }
    );
    mockFrom.mockReturnValue(chain);

    const response = await POST(
      new Request('http://localhost/api/schemas', {
        method: 'POST',
        body: JSON.stringify({ content: FULL, format: 'yaml' }),
      })
    );

    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toEqual({ error: 'update failed' });
  });

  it('inserts a saved schema when none exists', async () => {
    mockAuthenticatedClaims();
    const { chain } = createSupabaseTableMock({ data: null, error: null });
    mockFrom.mockReturnValue(chain);

    const response = await POST(
      new Request('http://localhost/api/schemas', {
        method: 'POST',
        body: JSON.stringify({ content: FULL, format: 'json' }),
      })
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ success: true });
    expect(chain.insert).toHaveBeenCalledWith({
      user_id: 'user-1',
      content: FULL,
      format: 'json',
    });
  });

  it('returns 500 when insert fails', async () => {
    mockAuthenticatedClaims();
    const { chain } = createSupabaseTableMock(
      { data: null, error: null },
      { message: 'insert failed' }
    );
    mockFrom.mockReturnValue(chain);

    const response = await POST(
      new Request('http://localhost/api/schemas', {
        method: 'POST',
        body: JSON.stringify({ content: FULL, format: 'json' }),
      })
    );

    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toEqual({ error: 'insert failed' });
  });
});
