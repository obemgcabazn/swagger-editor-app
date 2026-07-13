import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}));

vi.mock('@/components/swagger/swagger-editor', () => ({
  SwaggerEditor: () => <textarea aria-label="swagger-editor" />,
}));

vi.mock('@/hooks/use-restore-schema', () => ({
  useRestoreSchema: () => ({ restoreStatus: { phase: 'idle' as const } }),
}));

vi.mock('@/hooks/use-save-schema', () => ({
  useSaveSchema: () => ({ save: vi.fn(), saveStatus: { phase: 'idle' as const } }),
}));

import { SwaggerSection } from '@/components/swagger/swagger-section';

describe('SwaggerSection layout', () => {
  it('wraps the split workspace in the shared app container and bordered panel', () => {
    const { container } = render(<SwaggerSection isAuthenticated={false} />);

    const main = container.querySelector('main');
    expect(main).toHaveClass('flex', 'min-h-0', 'flex-1', 'flex-col');

    const appContainer = main?.querySelector(':scope > .app-container');
    expect(appContainer).not.toBeNull();
    expect(appContainer).toHaveClass('flex', 'min-h-0', 'flex-1', 'flex-col');

    const panel = appContainer?.querySelector(':scope > .rounded-xl.border');
    expect(panel).not.toBeNull();
    expect(panel?.querySelector('.split-workspace')).not.toBeNull();

    expect(document.getElementById('editor')).not.toBeNull();
    expect(document.getElementById('viewer')).not.toBeNull();
    expect(screen.getByLabelText('swagger-editor')).toBeInTheDocument();
  });
});
