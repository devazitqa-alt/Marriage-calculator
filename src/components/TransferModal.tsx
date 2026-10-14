import React, { useState } from 'react';
import { X, ArrowLeftRight, Download, Upload, Copy, Check, AlertTriangle, ShieldCheck } from 'lucide-react';
import { StorageService } from '../services/storageService';
import { SoundEffects } from '../utils/audio';

interface TransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDataRestored: () => void;
}

export const TransferModal: React.FC<TransferModalProps> = ({
  isOpen,
  onClose,
  onDataRestored,
}) => {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<'export' | 'import'>('export');
  const [copied, setCopied] = useState(false);
  const [importJson, setImportJson] = useState('');
  const [importMode, setImportMode] = useState<'merge' | 'replace'>('merge');
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleCopyExport = () => {
    SoundEffects.playClick();
    const data = StorageService.exportAllData();
    navigator.clipboard.writeText(data);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadFile = () => {
    SoundEffects.playClick();
    const data = StorageService.exportAllData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `marriage_point_calculator_backup_${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    if (!importJson.trim()) return;
    SoundEffects.playClick();

    const res = StorageService.importData(importJson, importMode);
    if (res.success) {
      setStatusMessage({ type: 'success', text: `${res.message} (${res.stats?.games} games, ${res.stats?.players} players loaded)` });
      onDataRestored();
      setImportJson('');
    } else {
      setStatusMessage({ type: 'error', text: res.message });
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setImportJson(text);
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[92vh] flex flex-col overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-700 via-red-600 to-rose-600 px-5 py-3.5 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ArrowLeftRight className="w-5 h-5 text-amber-300" />
            <div>
              <h3 className="font-extrabold text-sm sm:text-base tracking-tight">Transfer & Backup Data</h3>
              <p className="text-[11px] text-red-100">Sync between phones & safe local storage</p>
            </div>
          </div>
          <button
            onClick={() => {
              SoundEffects.playClick();
              onClose();
            }}
            className="p-1 rounded-lg hover:bg-white/20 active:scale-95 transition-colors text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="flex border-b border-slate-200 bg-slate-50 text-xs font-bold text-slate-600">
          <button
            onClick={() => setActiveTab('export')}
            className={`flex-1 py-2.5 text-center border-b-2 transition-colors ${
              activeTab === 'export' ? 'border-red-600 text-red-600 bg-white' : 'border-transparent'
            }`}
          >
            Export Backup
          </button>
          <button
            onClick={() => setActiveTab('import')}
            className={`flex-1 py-2.5 text-center border-b-2 transition-colors ${
              activeTab === 'import' ? 'border-red-600 text-red-600 bg-white' : 'border-transparent'
            }`}
          >
            Import / Transfer to this Device
          </button>
        </div>

        {/* Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 text-xs">
          {statusMessage && (
            <div
              className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center gap-2 ${
                statusMessage.type === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : 'bg-rose-50 text-rose-800 border-rose-200'
              }`}
            >
              {statusMessage.type === 'success' ? (
                <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0" />
              )}
              <span>{statusMessage.text}</span>
            </div>
          )}

          {activeTab === 'export' ? (
            <div className="space-y-3">
              <p className="text-slate-600 leading-relaxed">
                Export all your games, player histories, house rules profiles, and Callbreak scorecards to a secure
                JSON backup.
              </p>

              <div className="grid grid-cols-2 gap-2 pt-2">
                <button
                  type="button"
                  onClick={handleDownloadFile}
                  className="py-3 px-3 bg-slate-800 hover:bg-slate-900 active:scale-95 text-white font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-sm"
                >
                  <Download className="w-4 h-4 text-amber-400" />
                  <span>Download .json</span>
                </button>

                <button
                  type="button"
                  onClick={handleCopyExport}
                  className="py-3 px-3 bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-2xs active:scale-95"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  <span>{copied ? 'Copied to Clipboard!' : 'Copy String'}</span>
                </button>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-500">
                🔒 Privacy guarantee: All your card scores remain completely local on this device.
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-slate-600">
                Transfer games from your friends' devices or restore an earlier backup.
              </p>

              {/* Upload file button */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Upload Backup File</label>
                <input
                  type="file"
                  accept=".json,application/json"
                  onChange={handleFileUpload}
                  className="w-full text-xs text-slate-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-red-50 file:text-red-700 hover:file:bg-red-100"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Or Paste JSON Data</label>
                <textarea
                  rows={4}
                  value={importJson}
                  onChange={(e) => setImportJson(e.target.value)}
                  placeholder="Paste exported JSON here..."
                  className="w-full p-2 border border-slate-300 rounded-lg font-mono text-[10px] focus:outline-none focus:ring-1 focus:ring-red-500"
                />
              </div>

              {/* Merge vs Replace mode */}
              <div className="flex gap-4 pt-1">
                <label className="flex items-center gap-1.5 cursor-pointer text-slate-700">
                  <input
                    type="radio"
                    name="importMode"
                    checked={importMode === 'merge'}
                    onChange={() => setImportMode('merge')}
                    className="text-red-600"
                  />
                  <span className="font-bold">Merge with existing</span>
                </label>

                <label className="flex items-center gap-1.5 cursor-pointer text-slate-700">
                  <input
                    type="radio"
                    name="importMode"
                    checked={importMode === 'replace'}
                    onChange={() => setImportMode('replace')}
                    className="text-red-600"
                  />
                  <span className="font-bold text-rose-600">Replace all</span>
                </label>
              </div>

              <button
                type="button"
                disabled={!importJson.trim()}
                onClick={handleImport}
                className={`w-full py-2.5 rounded-xl font-extrabold flex items-center justify-center gap-1.5 text-xs transition-all ${
                  importJson.trim()
                    ? 'bg-red-600 hover:bg-red-700 text-white shadow-md active:scale-95'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                <Upload className="w-4 h-4" />
                <span>Restore / Transfer Data</span>
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            type="button"
            onClick={() => {
              SoundEffects.playClick();
              onClose();
            }}
            className="px-4 py-1.5 bg-slate-800 text-white rounded-xl text-xs font-bold"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
