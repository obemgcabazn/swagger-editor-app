'use client';

import dynamic from 'next/dynamic';

type SwaggerEditorProps = Readonly<{
  format: 'json' | 'yaml';
  onChange: (value: string) => void;
  value: string;
}>;

const MonacoEditor = dynamic(() => import('@monaco-editor/react').then((mod) => mod.default), {
  ssr: false,
  loading: () => <div className="bg-muted h-full min-h-[300px]" />,
});

export function SwaggerEditor({ format, onChange, value }: SwaggerEditorProps) {
  return (
    <MonacoEditor
      key={format}
      defaultLanguage="yaml"
      height="100%"
      language={format}
      onChange={(newValue) => {
        if (newValue !== undefined) onChange(newValue);
      }}
      options={{
        automaticLayout: true,
        bracketPairColorization: { enabled: true },
        folding: true,
        foldingStrategy: 'indentation',
        fontFamily: "'Geist Mono', monospace",
        fontSize: 13,
        formatOnPaste: true,
        glyphMargin: false,
        guides: { indentation: true },
        lineHeight: 1.6,
        lineNumbers: 'on',
        lineNumbersMinChars: 3,
        minimap: { enabled: false },
        padding: { bottom: 12, top: 12 },
        renderLineHighlight: 'line',
        scrollBeyondLastLine: false,
        smoothScrolling: true,
        tabSize: 2,
        wordWrap: 'on',
      }}
      theme="vs-dark"
      value={value}
    />
  );
}
