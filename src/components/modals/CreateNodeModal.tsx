import React, { useState } from 'react';
import { X, Plus, Sparkles } from 'lucide-react';
import { useResearchStore } from '../../store/useResearchStore';
import { EntityType, ResearchEntity } from '../../types/research';

export const CreateNodeModal: React.FC = () => {
  const {
    isCreateModalOpen,
    createModalInitialType,
    closeCreateModal,
    addEntity,
    getAllEntities,
  } = useResearchStore();

  const [type, setType] = useState<EntityType>(createModalInitialType);
  const [title, setTitle] = useState('');
  const [code, setCode] = useState('');
  const [statementOrDesc, setStatementOrDesc] = useState('');
  const [rationale, setRationale] = useState('');
  const [authors, setAuthors] = useState('');
  const [venue, setVenue] = useState('');
  const [year, setYear] = useState('2026');
  const [metricFps, setMetricFps] = useState('45.0');
  const [metricWatts, setMetricWatts] = useState('2.1');
  const [metricAuc, setMetricAuc] = useState('0.95');

  React.useEffect(() => {
    if (isCreateModalOpen) {
      setType(createModalInitialType);
      const all = getAllEntities().filter((e) => e.type === createModalInitialType);
      const prefix = createModalInitialType[0].toUpperCase();
      setCode(`${prefix}-00${all.length + 1}`);
      setTitle('');
      setStatementOrDesc('');
      setRationale('');
    }
  }, [isCreateModalOpen, createModalInitialType]);

  if (!isCreateModalOpen) return null;

  const handleTypeChange = (newType: EntityType) => {
    setType(newType);
    const all = getAllEntities().filter((e) => e.type === newType);
    const prefix = newType[0].toUpperCase();
    setCode(`${prefix}-00${all.length + 1}`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const id = `${type[0]}-${Date.now()}`;
    const base = {
      id,
      code: code.trim() || `${type[0].toUpperCase()}-${Date.now().toString().slice(-3)}`,
      title: title.trim(),
      createdAt: new Date().toISOString(),
    };

    let newEntity: ResearchEntity;

    switch (type) {
      case 'question':
        newEntity = {
          ...base,
          type: 'question',
          description: statementOrDesc,
          status: 'active',
          priority: 'high',
        };
        break;
      case 'paper':
        newEntity = {
          ...base,
          type: 'paper',
          authors: authors.split(',').map((a) => a.trim()).filter(Boolean),
          year: parseInt(year, 10) || 2026,
          venue: venue.trim(),
          abstract: statementOrDesc,
        };
        break;
      case 'gap':
        newEntity = {
          ...base,
          type: 'gap',
          description: statementOrDesc || title,
          impactLevel: 'high',
          status: 'open',
        };
        break;
      case 'hypothesis':
        newEntity = {
          ...base,
          type: 'hypothesis',
          statement: statementOrDesc || title,
          rationale: rationale || 'Identified from preliminary experimental observations.',
          status: 'draft',
          confidence: 0.8,
        };
        break;
      case 'experiment':
        newEntity = {
          ...base,
          type: 'experiment',
          description: statementOrDesc,
          status: 'planned',
          config: { batchSize: 1, precision: 'INT4' },
        };
        break;
      case 'result':
        newEntity = {
          ...base,
          type: 'result',
          summary: statementOrDesc || title,
          metrics: {
            throughputFps: parseFloat(metricFps) || 45.0,
            powerWatts: parseFloat(metricWatts) || 2.1,
            auc: parseFloat(metricAuc) || 0.95,
          },
          status: 'valid',
        };
        break;
      case 'decision':
        newEntity = {
          ...base,
          type: 'decision',
          outcome: 'accepted',
          rationale: statementOrDesc || rationale || title,
        };
        break;
      case 'claim':
        newEntity = {
          ...base,
          type: 'claim',
          statement: statementOrDesc || title,
          confidenceScore: 0.9,
          status: 'proposed',
        };
        break;
    }

    addEntity(newEntity);
    closeCreateModal();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-xs">
      <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-100 text-indigo-700">
              <Plus className="h-4 w-4" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">
              Create Research Node
            </h3>
          </div>
          <button
            onClick={closeCreateModal}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Node Archetype Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Entity Archetype
            </label>
            <div className="grid grid-cols-4 gap-1.5">
              {(
                [
                  'question',
                  'paper',
                  'gap',
                  'hypothesis',
                  'experiment',
                  'result',
                  'decision',
                  'claim',
                ] as EntityType[]
              ).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => handleTypeChange(t)}
                  className={`rounded-lg border px-2.5 py-1.5 text-xs font-semibold capitalize transition-all ${
                    type === t
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-900 ring-2 ring-indigo-200'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Code & Title */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700">Code</label>
              <input
                type="text"
                required
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-1.5 font-mono text-xs focus:border-indigo-500 focus:outline-hidden"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-slate-700">Title</label>
              <input
                type="text"
                required
                placeholder="Descriptive title..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-1.5 text-xs focus:border-indigo-500 focus:outline-hidden"
              />
            </div>
          </div>

          {/* Type Specific Fields */}
          {type === 'paper' && (
            <div className="grid grid-cols-3 gap-2">
              <div className="col-span-2">
                <label className="block text-xs font-semibold text-slate-700">Authors</label>
                <input
                  type="text"
                  placeholder="e.g. Smith, J., Doe, A."
                  value={authors}
                  onChange={(e) => setAuthors(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-1.5 text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700">Year</label>
                <input
                  type="number"
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-1.5 text-xs"
                />
              </div>
            </div>
          )}

          {type === 'result' && (
            <div className="grid grid-cols-3 gap-2 rounded-lg bg-slate-50 p-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600">FPS</label>
                <input
                  type="text"
                  value={metricFps}
                  onChange={(e) => setMetricFps(e.target.value)}
                  className="mt-1 w-full rounded border border-slate-200 bg-white px-2 py-1 text-xs font-mono"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600">Power (Watts)</label>
                <input
                  type="text"
                  value={metricWatts}
                  onChange={(e) => setMetricWatts(e.target.value)}
                  className="mt-1 w-full rounded border border-slate-200 bg-white px-2 py-1 text-xs font-mono"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600">AUC</label>
                <input
                  type="text"
                  value={metricAuc}
                  onChange={(e) => setMetricAuc(e.target.value)}
                  className="mt-1 w-full rounded border border-slate-200 bg-white px-2 py-1 text-xs font-mono"
                />
              </div>
            </div>
          )}

          {/* Statement / Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-700">
              {type === 'hypothesis' || type === 'claim'
                ? 'Scientific Statement'
                : type === 'result'
                ? 'Result Summary'
                : 'Description / Abstract'}
            </label>
            <textarea
              rows={3}
              placeholder="Detailed description or formal statement..."
              value={statementOrDesc}
              onChange={(e) => setStatementOrDesc(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-1.5 text-xs focus:border-indigo-500 focus:outline-hidden"
            />
          </div>

          {/* Footer Actions */}
          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={closeCreateModal}
              className="rounded-xl border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-700 shadow-xs cursor-pointer"
            >
              Create Node
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
