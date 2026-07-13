import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}));

vi.mock('@/components/swagger/swagger-editor', () => ({
  SwaggerEditor: ({
    onChange,
    value,
  }: Readonly<{
    onChange: (value: string) => void;
    value: string;
  }>) => (
    <textarea
      aria-label="swagger-editor"
      value={value}
      onChange={(event) => onChange(event.target.value)}
    />
  ),
}));

vi.mock('@/components/swagger/viewer-content', () => ({
  ViewerContent: () => <div data-testid="viewer-content" />,
}));

import { EditorBody } from '@/components/swagger/editor-body';
import { EditorPane } from '@/components/swagger/editor-pane';
import { EditorToolbar } from '@/components/swagger/editor-toolbar';
import { SwaggerSection } from '@/components/swagger/swagger-section';

const FULL = JSON.stringify({ openapi: '3.0.0', info: { title: 'T', version: '1' }, paths: {} });

describe('EditorToolbar', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('hides Save for unauthenticated users', () => {
    render(
      <EditorToolbar
        contentRef={{ current: FULL }}
        format="json"
        formatRef={{ current: 'json' }}
        isAuthenticated={false}
        onToggleFormat={vi.fn()}
        schemaStatus="valid"
      />
    );

    expect(screen.queryByRole('button', { name: /save/i })).not.toBeInTheDocument();
  });

  it('hides Save until the schema is valid', () => {
    render(
      <EditorToolbar
        contentRef={{ current: FULL }}
        format="json"
        formatRef={{ current: 'json' }}
        isAuthenticated
        onToggleFormat={vi.fn()}
        schemaStatus="invalid"
      />
    );

    expect(screen.queryByRole('button', { name: /save/i })).not.toBeInTheDocument();
  });

  it('saves a valid schema and shows saved feedback', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ success: true }),
      })
    );

    render(
      <EditorToolbar
        contentRef={{ current: FULL }}
        format="json"
        formatRef={{ current: 'json' }}
        isAuthenticated
        onToggleFormat={vi.fn()}
        schemaStatus="valid"
      />
    );

    await userEvent.click(screen.getByRole('button', { name: /save/i }));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /saved/i })).toBeInTheDocument();
    });
  });
});

describe('EditorBody', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('shows a restore spinner for authenticated users while loading', () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() => new Promise(() => {}))
    );

    render(
      <EditorBody content="" format="yaml" isAuthenticated onChange={vi.fn()} onLoad={vi.fn()} />
    );

    expect(screen.getByText('restoringSchema')).toBeInTheDocument();
    expect(screen.queryByLabelText('swagger-editor')).not.toBeInTheDocument();
  });

  it('renders the editor immediately for guests', () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    render(
      <EditorBody
        content={FULL}
        format="json"
        isAuthenticated={false}
        onChange={vi.fn()}
        onLoad={vi.fn()}
      />
    );

    expect(screen.getByLabelText('swagger-editor')).toBeInTheDocument();
    expect(screen.queryByText('restoringSchema')).not.toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('loads restored content into the editor', async () => {
    const onLoad = vi.fn();

    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ content: FULL, format: 'json' }),
      })
    );

    render(
      <EditorBody content="" format="yaml" isAuthenticated onChange={vi.fn()} onLoad={onLoad} />
    );

    await waitFor(() => {
      expect(onLoad).toHaveBeenCalledWith(FULL, 'json');
      expect(screen.getByLabelText('swagger-editor')).toBeInTheDocument();
    });
  });
});

describe('EditorPane', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('wires toolbar save to the latest editor content via refs', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true }),
    });
    vi.stubGlobal('fetch', fetchMock);

    const { rerender } = render(
      <EditorPane
        content=""
        format="yaml"
        isAuthenticated
        onChange={vi.fn()}
        onLoad={vi.fn()}
        onToggleFormat={vi.fn()}
        schemaStatus="idle"
      />
    );

    rerender(
      <EditorPane
        content={FULL}
        format="json"
        isAuthenticated
        onChange={vi.fn()}
        onLoad={vi.fn()}
        onToggleFormat={vi.fn()}
        schemaStatus="valid"
      />
    );

    await act(async () => {
      await Promise.resolve();
    });

    await userEvent.click(screen.getByRole('button', { name: /save/i }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith('/api/schemas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: FULL, format: 'json' }),
      });
    });
  });
});

describe('SwaggerSection', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('restores a saved schema for authenticated users', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ content: FULL, format: 'json' }),
      })
    );

    render(<SwaggerSection isAuthenticated />);

    await waitFor(() => {
      expect(screen.getByLabelText('swagger-editor')).toHaveValue(FULL);
      expect(screen.getByText('statusValid')).toBeInTheDocument();
    });
  });

  it('does not fetch saved schemas for guests', () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    render(<SwaggerSection isAuthenticated={false} />);

    expect(fetchMock).not.toHaveBeenCalled();
    expect(screen.getByLabelText('swagger-editor')).toBeInTheDocument();
  });
});
