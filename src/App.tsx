import React from 'react';
import { useRacerOps } from './context/RacerOpsContext';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { CommandCenterView } from './views/CommandCenterView';
import { BusinessesView } from './views/BusinessesView';
import { FinanceView } from './views/FinanceView';
import { MarketingView } from './views/MarketingView';
import { LeadsView } from './views/LeadsView';
import { ContentView } from './views/ContentView';
import { AgentsView } from './views/AgentsView';
import { AutomationsView } from './views/AutomationsView';
import { ProjectsView } from './views/ProjectsView';
import { TasksView } from './views/TasksView';
import { ReportsView } from './views/ReportsView';
import { IntegrationsView } from './views/IntegrationsView';
import { SettingsView } from './views/SettingsView';

// Modals
import { DailyBriefModal } from './components/modals/DailyBriefModal';
import { HealthBreakdownModal } from './components/modals/HealthBreakdownModal';
import { AskRacerOpsDrawer } from './components/modals/AskRacerOpsDrawer';
import { GlobalSearchModal } from './components/modals/GlobalSearchModal';
import { AssignTaskModal } from './components/modals/AssignTaskModal';
import { IngestDataModal } from './components/modals/IngestDataModal';
import { AddLeadModal } from './components/modals/AddLeadModal';
import { AddInventoryModal } from './components/modals/AddInventoryModal';
import { AddRevenueModal } from './components/modals/AddRevenueModal';
import { IntegrationConfigModal } from './components/modals/IntegrationConfigModal';

export const AppContent: React.FC = () => {
  const { activeView, toastMessage } = useRacerOps();

  const renderActiveView = () => {
    switch (activeView) {
      case 'command-center':
        return <CommandCenterView />;
      case 'businesses':
        return <BusinessesView />;
      case 'finance':
        return <FinanceView />;
      case 'marketing':
        return <MarketingView />;
      case 'leads':
        return <LeadsView />;
      case 'content':
        return <ContentView />;
      case 'agents':
        return <AgentsView />;
      case 'automations':
        return <AutomationsView />;
      case 'projects':
        return <ProjectsView />;
      case 'tasks':
        return <TasksView />;
      case 'reports':
        return <ReportsView />;
      case 'integrations':
        return <IntegrationsView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <CommandCenterView />;
    }
  };

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 font-sans overflow-hidden">
      {/* Global Navigation Sidebar */}
      <Sidebar />

      {/* Main Execution Surface */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header />
        
        <main className="flex-1 overflow-y-auto bg-slate-950/60 pb-16">
          {renderActiveView()}
        </main>
      </div>

      {/* Floating Global Modals & Drawers */}
      <DailyBriefModal />
      <HealthBreakdownModal />
      <AskRacerOpsDrawer />
      <GlobalSearchModal />
      <AssignTaskModal />
      <IngestDataModal />
      <AddLeadModal />
      <AddInventoryModal />
      <AddRevenueModal />
      <IntegrationConfigModal />

      {/* Toast Notification Notification Pill */}
      {toastMessage && (
        <div className="fixed bottom-5 right-6 z-50 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <div className="px-4 py-2.5 rounded-xl bg-slate-900/95 border border-cyan-500/50 text-xs font-semibold text-cyan-200 shadow-xl shadow-cyan-950/40 flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
            <span>{toastMessage}</span>
          </div>
        </div>
      )}
    </div>
  );
};
