import React, { useState, useRef } from 'react';
import {
  X,
  Upload,
  FileSpreadsheet,
  Download,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  FileText,
  Table,
  Sparkles,
  ArrowRight,
  Database
} from 'lucide-react';
import { useRacerOps } from '../../context/RacerOpsContext';
import { parseCSV, convertRowsToLeads, convertRowsToInventory } from '../../utils/csvParser';
import { IngestionPreview } from '../../types';

export const IngestDataModal: React.FC = () => {
  const {
    isIngestModalOpen,
    setIsIngestModalOpen,
    resetToBlankSlate,
    restoreDemoData,
    ingestLeadsList,
    ingestInventoryList,
    exportDatabaseJson,
    importDatabaseJson,
    showToast
  } = useRacerOps();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const jsonInputRef = useRef<HTMLInputElement>(null);

  const [activeTab, setActiveTab] = useState<'csv' | 'backup' | 'wipe'>('csv');
  const [ingestionType, setIngestionType] = useState<IngestionPreview['type']>('leads');
  const [preview, setPreview] = useState<IngestionPreview | null>(null);

  if (!isIngestModalOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = parseCSV(text, file.name, ingestionType);
        setPreview(parsed);
      } catch (err: any) {
        showToast(err.message || 'Failed to parse CSV');
      }
    };
    reader.readAsText(file);
  };

  const handleApplyPreview = () => {
    if (!preview) return;

    if (preview.type === 'leads') {
      const converted = convertRowsToLeads(preview.rows);
      ingestLeadsList(converted);
    } else if (preview.type === 'inventory') {
      const converted = convertRowsToInventory(preview.rows);
      ingestInventoryList(converted);
    }

    setPreview(null);
    setIsIngestModalOpen(false);
  };

  const handleJsonRestore = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const data = JSON.parse(text);
        importDatabaseJson(data);
        setIsIngestModalOpen(false);
      } catch (err: any) {
        showToast('Invalid JSON backup file');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-gradient-to-r from-slate-900 via-slate-850 to-cyan-950/40">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100 flex items-center space-x-2">
                <span>Data Ingestion & Blank Slate Hub</span>
              </h2>
              <p className="text-xs text-slate-400">
                Wipe sample data, upload live business CSVs, or backup state
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsIngestModalOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Bar */}
        <div className="flex border-b border-slate-800 px-6 pt-2 bg-slate-950/60">
          <button
            onClick={() => { setActiveTab('csv'); setPreview(null); }}
            className={`px-4 py-2 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === 'csv'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Upload Real CSV
          </button>
          <button
            onClick={() => { setActiveTab('wipe'); setPreview(null); }}
            className={`px-4 py-2 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === 'wipe'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Blank Slate (Erase Sample Data)
          </button>
          <button
            onClick={() => { setActiveTab('backup'); setPreview(null); }}
            className={`px-4 py-2 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === 'backup'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Backup & Export
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          {/* TAB 1: CSV INGESTION */}
          {activeTab === 'csv' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Select Data Stream to Upload
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => { setIngestionType('leads'); setPreview(null); }}
                    className={`p-3 rounded-xl border text-left text-xs font-medium transition-all ${
                      ingestionType === 'leads'
                        ? 'bg-cyan-950/60 border-cyan-500/60 text-cyan-200'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <FileSpreadsheet className="w-4 h-4 text-cyan-400 mb-1" />
                    <span className="font-bold block">Leads / CRM Contacts</span>
                    <span className="text-[10px] text-slate-400">Over50FitLife, NutriPlan, Rhino</span>
                  </button>

                  <button
                    onClick={() => { setIngestionType('inventory'); setPreview(null); }}
                    className={`p-3 rounded-xl border text-left text-xs font-medium transition-all ${
                      ingestionType === 'inventory'
                        ? 'bg-cyan-950/60 border-cyan-500/60 text-cyan-200'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <FileSpreadsheet className="w-4 h-4 text-pink-400 mb-1" />
                    <span className="font-bold block">Kim's Closet Inventory</span>
                    <span className="text-[10px] text-slate-400">SKUs, costs, listing prices, platforms</span>
                  </button>
                </div>
              </div>

              {/* Upload Dropzone */}
              {!preview ? (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-800 hover:border-cyan-500/60 bg-slate-950/60 rounded-2xl p-8 text-center cursor-pointer transition-all group"
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept=".csv"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <Upload className="w-8 h-8 text-slate-400 group-hover:text-cyan-400 mx-auto mb-2 transition-colors" />
                  <p className="text-xs font-bold text-slate-200">
                    Click to select your {ingestionType.toUpperCase()} CSV file
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Columns will be intelligently auto-mapped to your RacerOps database
                  </p>
                </div>
              ) : (
                /* Preview Table */
                <div className="space-y-3">
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-slate-200 flex items-center space-x-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span>Parsed {preview.fileName}</span>
                      </p>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {preview.rowCount} rows discovered • Columns: {preview.headers.join(', ')}
                      </span>
                    </div>
                    <button
                      onClick={() => setPreview(null)}
                      className="text-xs text-rose-400 hover:underline"
                    >
                      Clear
                    </button>
                  </div>

                  {/* Sample rows */}
                  <div className="border border-slate-800 rounded-xl overflow-hidden max-h-48 overflow-y-auto">
                    <table className="w-full text-left text-[11px]">
                      <thead className="bg-slate-950 border-b border-slate-800 text-[10px] font-mono text-slate-400 uppercase">
                        <tr>
                          {preview.headers.slice(0, 4).map((h, i) => (
                            <th key={i} className="p-2">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60">
                        {preview.rows.slice(0, 4).map((r, rIdx) => (
                          <tr key={rIdx} className="hover:bg-slate-850">
                            {preview.headers.slice(0, 4).map((h, cIdx) => (
                              <td key={cIdx} className="p-2 text-slate-300 font-mono">{r[h]}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <button
                    onClick={handleApplyPreview}
                    className="w-full py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center justify-center space-x-2 transition-all shadow-md shadow-cyan-600/20"
                  >
                    <span>Apply to Dashboard & Update All Numbers</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: WIPE SAMPLE DATA & BLANK SLATE */}
          {activeTab === 'wipe' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider font-mono">
                  Erase Sample Data & Start Blank
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  This will zero-out all demo revenue figures, sample leads, demo inventory items, and alerts.
                  All four business cards (<strong className="text-white">Over50FitLife, NutriPlanPro, Kim's Closet, Team Rhino</strong>) and agent slots will remain perfectly formatted in a clean zero-state ready for your real data.
                </p>
              </div>

              <div className="flex items-center space-x-3 pt-2">
                <button
                  onClick={() => {
                    resetToBlankSlate();
                    setIsIngestModalOpen(false);
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-all shadow-md shadow-rose-600/20 flex items-center justify-center space-x-1.5"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Erase Sample Data (Blank Slate)</span>
                </button>

                <button
                  onClick={() => {
                    restoreDemoData();
                    setIsIngestModalOpen(false);
                  }}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-all"
                >
                  Reload Demo Data
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: BACKUP & RESTORE */}
          {activeTab === 'backup' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider font-mono">
                  Export & Import JSON Snapshot
                </h3>
                <p className="text-xs text-slate-400">
                  Save a full backup of all business metrics, leads, inventory, and tasks to a JSON file on your machine.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={exportDatabaseJson}
                  className="p-4 rounded-xl bg-slate-950 border border-slate-800 hover:border-cyan-500/50 text-left transition-all group"
                >
                  <Download className="w-5 h-5 text-cyan-400 mb-2 group-hover:scale-110 transition-transform" />
                  <span className="font-bold text-slate-200 text-xs block">Export Database JSON</span>
                  <span className="text-[10px] text-slate-400">Download snapshot to local drive</span>
                </button>

                <div
                  onClick={() => jsonInputRef.current?.click()}
                  className="p-4 rounded-xl bg-slate-950 border border-slate-800 hover:border-cyan-500/50 text-left transition-all cursor-pointer group"
                >
                  <input
                    type="file"
                    ref={jsonInputRef}
                    accept=".json"
                    onChange={handleJsonRestore}
                    className="hidden"
                  />
                  <Upload className="w-5 h-5 text-emerald-400 mb-2 group-hover:scale-110 transition-transform" />
                  <span className="font-bold text-slate-200 text-xs block">Restore Backup JSON</span>
                  <span className="text-[10px] text-slate-400">Upload saved database snapshot</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
