import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from './Button';

interface TestLayoutProps {
  title: string;
  subtitle: string;
  onBack: () => void;
  progress: number;
  children: React.ReactNode;
}

export const TestLayout: React.FC<TestLayoutProps> = ({ 
  title, 
  subtitle, 
  onBack, 
  progress, 
  children 
}) => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Button variant="ghost" onClick={onBack} className="p-2">
              <ArrowLeft size={20} />
            </Button>
            <div>
              <h1 className="text-lg font-bold text-slate-800 leading-tight">{title}</h1>
              <p className="text-xs text-slate-500">{subtitle}</p>
            </div>
          </div>
          <div className="text-sm font-semibold text-indigo-600">{Math.round(progress)}%</div>
        </div>
        <div className="h-1 w-full bg-slate-200">
          <div 
            className="h-full bg-indigo-600 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </header>

      <main className="flex-1 max-w-3xl w-full mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
};