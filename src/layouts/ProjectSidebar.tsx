import React from 'react';
import {
  LayoutDashboard,
  HelpCircle,
  FileText,
  AlertCircle,
  Lightbulb,
  FlaskConical,
  BarChart3,
  GitBranch,
  ShieldCheck,
  Network,
  ArrowLeft,
} from 'lucide-react';
import { ProjectViewMode, Project } from '../types/research';

export interface ProjectSidebarProps {
  project: Project;
  currentView: ProjectViewMode;
  onSelectView: (view: ProjectViewMode) => void;
  onBackToProjects: () => void;
}

export const ProjectSidebar: React.FC<ProjectSidebarProps> = ({
  project,
  currentView,
  onSelectView,
  onBackToProjects,
}) => {
  const sections: Array<{
    title?: string;
    items: Array<{
      id: ProjectViewMode;
      label: string;
      icon: React.FC<{ className?: string }>;
    }>;
  }> = [
    {
      items: [
        { id: 'overview', label: 'Overview', icon: LayoutDashboard },
      ],
    },
    {
      title: 'RESEARCH',
      items: [
        { id: 'questions', label: 'Questions', icon: HelpCircle },
        { id: 'papers', label: 'Papers', icon: FileText },
        { id: 'gaps', label: 'Gaps', icon: AlertCircle },
        { id: 'hypotheses', label: 'Hypotheses', icon: Lightbulb },
      ],
    },
    {
      title: 'EXECUTION',
      items: [
        { id: 'experiments', label: 'Experiments', icon: FlaskConical },
        { id: 'results', label: 'Results', icon: BarChart3 },
      ],
    },
    {
      title: 'DECISIONS',
      items: [
        { id: 'decisions', label: 'Decisions', icon: GitBranch },
        { id: 'claims', label: 'Claims', icon: ShieldCheck },
      ],
    },
    {
      title: 'TRACEABILITY',
      items: [
        { id: 'traceability', label: 'Traceability', icon: Network },
      ],
    },
  ];

  return (
    <aside className="w-60 h-full border-r border-slate-200 bg-white flex flex-col justify-between p-3 shrink-0 select-none overflow-y-auto">
      <div className="space-y-4">
        {/* Project Header & Back Button */}
        <div className="border-b border-slate-100 pb-3 px-1">
          <button
            onClick={onBackToProjects}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-600 transition mb-2 cursor-pointer"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>All Projects</span>
          </button>

          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 truncate">
            {project.name}
          </h2>
          {project.researchArea && (
            <span className="text-[10px] font-semibold text-indigo-600">
              {project.researchArea}
            </span>
          )}
        </div>

        {/* Navigation Sections */}
        <div className="space-y-4">
          {sections.map((section, idx) => (
            <div key={idx} className="space-y-1">
              {section.title && (
                <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  {section.title}
                </div>
              )}
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = currentView === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => onSelectView(item.id)}
                    className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-semibold transition cursor-pointer ${
                      isActive
                        ? 'bg-indigo-50 text-indigo-700 shadow-2xs'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <Icon className={`h-4 w-4 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
};
