import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import VehicleViewer from './components/VehicleViewer';
import ReportPanel from './components/ReportPanel';
import Minesweeper from './components/Minesweeper';
import { ViewMode } from './types';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [currentView, setCurrentView] = useState<ViewMode>('VehicleViewer');

  const renderView = () => {
    switch (currentView) {
      case 'VehicleViewer':
        return <VehicleViewer />;
      case 'Reporting':
        return <ReportPanel />;
      case 'Minesweeper':
        return <Minesweeper />;
      default:
        return <VehicleViewer />;
    }
  };

  return (
    <div className="flex h-screen bg-brand-bg text-slate-200 font-sans antialiased overflow-hidden">
      <Sidebar currentView={currentView} onViewChange={setCurrentView} />
      
      <main className="flex-1 relative flex flex-col overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentView}
            initial={{ opacity: 0, y: 10, filter: 'blur(10px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -10, filter: 'blur(10px)' }}
            transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
            className="flex-1 h-full overflow-hidden"
          >
            {renderView()}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}

