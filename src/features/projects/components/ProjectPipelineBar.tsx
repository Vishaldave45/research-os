import React from 'react';
import {
  HelpCircle,
  BookOpen,
  AlertCircle,
  Lightbulb,
  FlaskConical,
  BarChart3,
  GitBranch,
  ShieldCheck,
  ArrowRight,
} from 'lucide-react';
import { ProjectSummary } from '../../../types/research';

export interface ProjectPipelineBarProps {
  summary?: ProjectSummary;
  activeStage?: string;
  onStageClick?: (stage: string) => void;
}

export const ProjectPipelineBar: React.FC<ProjectPipelineBarProps> = ({
  summary,
  activeStage,
  onStageClick,
}) => {
  const stages = [
    {
      id: 'questions',
      label: 'Questions',
      count: summary?.questionsCount ?? 0,
      icon: HelpCircle,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50 border-indigo-200',
    },
    {
      id: 'papers',
      label: 'Papers',
      count: summary?.papersCount ?? 0,
      icon: BookOpen,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 border-blue-200',
    },
    {
      id: 'gaps',
      label: 'Gaps',
      count: summary?.gapsCount ?? 0,
      icon: AlertCircle,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50 border-amber-200',
    },
    {
      id: 'hypotheses',
      label: 'Hypotheses',
      count: summary?.hypothesesCount ?? 0,
      icon: Lightbulb,
      color: 'text-teal-600',
      bgColor: 'bg-teal-50 border-teal-200',
    },
    {
      id: 'experiments',
      label: 'Experiments',
      count: summary?.experimentsCount ?? 0,
      icon: FlaskConical,
      color: 'text-rose-600',
      bgColor: 'bg-rose-50 border-rose-200',
    },
    {
      id: 'results',
      label: 'Results',
      count: summary?.resultsCount ?? 0,
      icon: BarChart3,
      color: 'text-cyan-600',
      bgColor: 'bg-cyan-50 border-cyan-200',
    },
    {
      id: 'decisions',
      label: 'Decisions',
      count: summary?.decisionsCount ?? 0,
      icon: GitBranch,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50 border-purple-200',
    },
    {
      id: 'claims',
      label: 'Claims',
      count: summary?.claimsCount ?? 0,
      icon: ShieldCheck,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50 border-emerald-200',
    },
  ];

  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
      {stages.map((stage, idx) => {
        const Icon = stage.icon;
        const isActive = activeStage === stage.id;
        return (
          <React.Fragment key={stage.id}>
            <button
              onClick={() => onStageClick?.(stage.id)}
              className={`flex items-center gap-2.5 rounded-xl border px-3.5 py-2 transition shrink-0 cursor-pointer ${
                isActive
                  ? 'border-indigo-600 bg-indigo-50/80 shadow-xs'
                  : 'border-slate-200/80 bg-white hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              <div className={`p-1 rounded-lg ${stage.bgColor} ${stage.color}`}>
                <Icon className="h-3.5 w-3.5" />
              </div>
              <div className="text-left">
                <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                  {stage.label}
                </div>
                <div className="text-sm font-bold text-slate-900 leading-tight">
                  {stage.count}
                </div>
              </div>
            </button>
            {idx < stages.length - 1 && (
              <ArrowRight className="h-3.5 w-3.5 text-slate-300 shrink-0" />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};
