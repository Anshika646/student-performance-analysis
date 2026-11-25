import React, { useState } from 'react';
import { Download, X } from 'lucide-react';
import { ProjectFileItem } from '../types';

export const ProjectFilesModal: React.FC<{
  open: boolean;
  onClose: () => void;
  files: ProjectFileItem[];
}> = ({ open, onClose, files }) => {
  const [selectedIdx, setSelectedIdx] = useState(0);
  if (!open) return null;

  const active = files[selectedIdx] || files[0];

  const handleDownload = (file: ProjectFileItem) => {
    const blob = new Blob([file.content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.name;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-xl shadow-xl w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
          <div>
            <h3 className="text-base font-display font-semibold text-slate-900">
              VS Code Python / Streamlit Project Files
            </h3>
            <p className="text-xs text-slate-500">
              Download or inspect app.py, requirements.txt, and README.md for local VS Code execution
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 px-5 py-3 bg-slate-50 border-b border-slate-200">
          <div className="flex items-center gap-1.5">
            {files.map((f, idx) => (
              <button
                key={f.name}
                type="button"
                onClick={() => setSelectedIdx(idx)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-colors ${
                  idx === selectedIdx
                    ? 'bg-blue-600 text-white font-semibold'
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                {f.name}
              </button>
            ))}
          </div>

          {active && (
            <button
              type="button"
              onClick={() => handleDownload(active)}
              className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold inline-flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download {active.name}</span>
            </button>
          )}
        </div>

        <pre className="p-5 overflow-auto text-xs font-mono text-slate-800 bg-slate-50/50 leading-relaxed flex-1">
          {active?.content || 'Loading project files...'}
        </pre>
      </div>
    </div>
  );
};
