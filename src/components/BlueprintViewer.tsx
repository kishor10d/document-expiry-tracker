/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { FileCode, Clipboard, Check, FolderGit, Cpu, Layers, FileJson, CheckCircle } from 'lucide-react';
import { BLUEPRINTS, EXPO_PROJECT_STRUCTURE } from '../data/blueprints';

export default function BlueprintViewer() {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [copied, setCopied] = useState<Record<number, boolean>>({});

  const activeBlueprint = BLUEPRINTS[selectedIdx];

  const handleCopy = (code: string, idx: number) => {
    navigator.clipboard.writeText(code);
    setCopied({ ...copied, [idx]: true });
    setTimeout(() => {
      setCopied(prev => ({ ...prev, [idx]: false }));
    }, 2000);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl flex flex-col lg:flex-row min-h-[550px]">
      
      {/* Left sidebar: File explorer list */}
      <div className="w-full lg:w-72 bg-slate-950/70 border-b lg:border-b-0 lg:border-r border-slate-800/80 p-4 shrink-0">
        
        {/* Project directory block */}
        <div className="mb-6">
          <h4 className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5">
            <FolderGit size={14} className="text-emerald-500" />
            <span>Expo Mobile Blueprint</span>
          </h4>
          <pre className="font-mono text-[10px] text-slate-300 bg-slate-900 p-3 rounded-lg border border-slate-800/60 overflow-x-auto leading-relaxed">
            {EXPO_PROJECT_STRUCTURE}
          </pre>
        </div>

        {/* Technical production blueprints */}
        <div>
          <h4 className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
            <Cpu size={14} className="text-amber-500" />
            <span>Core App Configurations</span>
          </h4>
          <div className="space-y-1">
            {BLUEPRINTS.map((item, index) => (
              <button
                key={index}
                onClick={() => setSelectedIdx(index)}
                className={`w-full flex items-start gap-2.5 px-3 py-2.5 rounded-lg text-left transition-all ${
                  selectedIdx === index 
                    ? 'bg-emerald-600/15 text-emerald-400 border border-emerald-500/30' 
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 border border-transparent'
                }`}
              >
                <FileCode size={15} className={`shrink-0 mt-0.5 ${selectedIdx === index ? 'text-emerald-400' : 'text-slate-500'}`} />
                <div className="min-w-0">
                  <div className="text-xs font-semibold truncate">{item.fileName}</div>
                  <div className="text-[10px] opacity-75 truncate">{item.language}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Compliance checklist */}
        <div className="mt-6 border-t border-slate-800/80 pt-4 text-[11px] text-slate-400 space-y-2">
          <span className="font-bold text-slate-300 text-xs block mb-1">Architecture Rules met:</span>
          <div className="flex items-start gap-1.5">
            <CheckCircle size={12} className="text-emerald-500 shrink-0 mt-0.5" />
            <span>Offline caching enabled explicitly</span>
          </div>
          <div className="flex items-start gap-1.5">
            <CheckCircle size={12} className="text-emerald-500 shrink-0 mt-0.5" />
            <span>3-step notification cadence</span>
          </div>
          <div className="flex items-start gap-1.5">
            <CheckCircle size={12} className="text-emerald-500 shrink-0 mt-0.5" />
            <span>iOS queue capping limit of 64</span>
          </div>
          <div className="flex items-start gap-1.5">
            <CheckCircle size={12} className="text-emerald-500 shrink-0 mt-0.5" />
            <span>Zero-Trust FireStore protection rules</span>
          </div>
        </div>

      </div>

      {/* Right panel: Blueprint details & file contents */}
      <div className="flex-1 flex flex-col min-w-0 bg-slate-900">
        
        {/* Banner Details of Selected file */}
        <div className="p-4 bg-slate-950/40 border-b border-slate-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold font-mono text-slate-200">{activeBlueprint.fileName}</span>
              <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-400 text-[9px] uppercase tracking-wider font-mono">
                {activeBlueprint.language}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed max-w-xl">
              {activeBlueprint.description}
            </p>
          </div>
          <button
            onClick={() => handleCopy(activeBlueprint.code, selectedIdx)}
            className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs hover:shadow-md transition-all duration-200 self-stretch sm:self-auto justify-center"
          >
            {copied[selectedIdx] ? (
              <>
                <Check size={13} />
                <span>Copied Code!</span>
              </>
            ) : (
              <>
                <Clipboard size={13} />
                <span>Copy File</span>
              </>
            )}
          </button>
        </div>

        {/* Code Content Editor Look */}
        <div className="flex-1 p-4 overflow-auto max-h-[500px]">
          <pre className="font-mono text-xs text-slate-300 leading-relaxed overflow-x-auto whitespace-pre">
            <code>{activeBlueprint.code}</code>
          </pre>
        </div>

        {/* Status indicator bar simulating production sync */}
        <div className="px-4 py-2 bg-slate-950/60 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-500 font-mono">
          <span>PROJECT: LifeVault (React Native Managed Workflow)</span>
          <span className="flex items-center gap-1.5 text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>STANDALONE BLUEPRINT READY</span>
          </span>
        </div>

      </div>

    </div>
  );
}
