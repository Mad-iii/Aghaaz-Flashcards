import React, { useState } from 'react';
import ClientFlow from './components/ClientFlow';
import Sidebar from './components/Sidebar';
import AdminDashboard from './components/AdminDashboard';
import FlowBuilder from './components/FlowBuilder';
import LeadData from './components/LeadData';
import Settings from './components/Settings';
import AdminLockScreen from './components/AdminLockScreen';

export default function App() {
  const [viewMode, setViewMode] = useState<'client' | 'admin'>('client');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [adminTab, setAdminTab] = useState<string>('dashboard');
  const [triggerNewCardCount, setTriggerNewCardCount] = useState<number>(0);

  // Handle direct navigation requests from client flow cards
  const handleNavigateToAdmin = (tab?: string) => {
    setViewMode('admin');
    if (tab) {
      setAdminTab(tab);
    }
  };

  const handleAddNewCardFromSidebar = () => {
    setAdminTab('flow-builder');
    setTriggerNewCardCount(prev => prev + 1);
  };

  if (viewMode === 'client') {
    return (
      <ClientFlow 
        onNavigateToAdmin={handleNavigateToAdmin} 
      />
    );
  }

  // Secure Gate Lock checks
  if (viewMode === 'admin' && !isAuthenticated) {
    return (
      <AdminLockScreen 
        onVerify={(pass) => {
          const meta = import.meta as any;
          const securePasscode = meta.env?.VITE_ADMIN_PASSCODE;
          console.log('DEBUG — entered:', JSON.stringify(pass), 'expected:', JSON.stringify(securePasscode));
          if (pass === securePasscode) {
            setIsAuthenticated(true);
            return true;
          }
          return false;
        }}
        onCancel={() => setViewMode('client')}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0B0D] text-slate-200 flex">
      {/* Admin Panel Sidebar */}
      <Sidebar 
        activeTab={adminTab} 
        onTabChange={setAdminTab} 
        onExitAdmin={() => {
          setIsAuthenticated(false);
          setViewMode('client');
        }} 
        onTriggerNewCard={handleAddNewCardFromSidebar}
      />

      {/* Main Panel Content Area */}
      <div className="pl-64 flex-1 flex flex-col min-h-screen">
        {adminTab === 'dashboard' && (
          <AdminDashboard 
            onNavigateToTab={setAdminTab} 
          />
        )}
        
        {adminTab === 'flow-builder' && (
          <FlowBuilder 
            onTriggerDeploy={() => {
              alert('Live Deployment Successful! All new visitor sequences will route through this strategic card path.');
              setViewMode('client');
            }} 
            triggerNewCardCount={triggerNewCardCount}
          />
        )}

        {adminTab === 'lead-data' && (
          <LeadData />
        )}

        {adminTab === 'settings' && (
          <Settings />
        )}
      </div>
    </div>
  );
}
