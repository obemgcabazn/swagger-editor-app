import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import {
  EditorWorkspacePane,
  SplitWorkspace,
  ViewerWorkspacePane,
} from '@/components/swagger/split-workspace';

describe('SplitWorkspace', () => {
  it('uses orientation-based layout classes instead of breakpoint-based ones', () => {
    render(
      <SplitWorkspace>
        <EditorWorkspacePane>
          <span>Editor</span>
        </EditorWorkspacePane>
        <ViewerWorkspacePane>
          <span>Viewer</span>
        </ViewerWorkspacePane>
      </SplitWorkspace>
    );

    const workspace = document.querySelector('.split-workspace');
    const editor = document.querySelector('.split-workspace__editor');
    const viewer = document.querySelector('.split-workspace__viewer');

    expect(workspace).toBeInTheDocument();
    expect(editor).toBeInTheDocument();
    expect(viewer).toBeInTheDocument();
    expect(document.querySelector('.lg\\:flex-row')).not.toBeInTheDocument();

    expect(screen.getByText('Editor')).toBeInTheDocument();
    expect(screen.getByText('Viewer')).toBeInTheDocument();
  });

  it('preserves editor and viewer anchor ids for history empty-state links', () => {
    render(
      <SplitWorkspace>
        <EditorWorkspacePane>Editor</EditorWorkspacePane>
        <ViewerWorkspacePane>Viewer</ViewerWorkspacePane>
      </SplitWorkspace>
    );

    expect(document.getElementById('editor')).not.toBeNull();
    expect(document.getElementById('viewer')).not.toBeNull();
  });
});
