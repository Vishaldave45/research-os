import React, { useState } from 'react';
import { useWorkspaceStore } from '../store/workspaceStore';
import { Settings, AlertTriangle, Check, Loader2 } from 'lucide-react';

export const WorkspaceSettingsPage: React.FC = () => {
  const { activeWorkspace } = useWorkspaceStore();
  const [name, setName] = useState(activeWorkspace?.name || '');
  const [description, setDescription] = useState(activeWorkspace?.description || '');
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 p-8">
      {/* Header */}
      <div className="border-b border-slate-200/80 pb-6">
        <h1 className="text-2xl font-bold text-slate-900">Workspace Settings</h1>
        <p className="text-xs text-slate-500 mt-1">
          Manage workspace profile and collaboration preferences.
        </p>
      </div>

      {/* General Settings */}
      <div className="rounded-xl border border-slate-200/80 bg-white p-6 shadow-xs space-y-6">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
          General
        </h3>

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Workspace Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Description
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 resize-none"
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            {isSaved ? (
              <span className="inline-flex items-center gap-1.5 text-xs text-emerald-600 font-semibold">
                <Check className="h-4 w-4" />
                Settings saved
              </span>
            ) : <div />}

            <button
              type="submit"
              className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-indigo-700 transition cursor-pointer"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>

      {/* Danger Zone */}
      <div className="rounded-xl border border-rose-200 bg-rose-50/50 p-6 space-y-4">
        <div className="flex items-center gap-2 text-rose-800">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <h3 className="text-sm font-bold uppercase tracking-wider">
            Danger Zone
          </h3>
        </div>
        <p className="text-xs text-rose-700 leading-relaxed">
          Archiving a workspace hides all associated research projects and restricts further entity creation. Only workspace owners can execute this action.
        </p>
        <button
          type="button"
          onClick={() => alert('Workspace archiving is protected.')}
          className="rounded-lg border border-rose-300 bg-white px-3.5 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-100 transition cursor-pointer"
        >
          Archive Workspace
        </button>
      </div>
    </div>
  );
};
