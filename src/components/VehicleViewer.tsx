import React, { useState, useRef, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment, ContactShadows, Float, Html } from '@react-three/drei';
import * as THREE from 'three';
import { Info, Box, Shield, Zap, Target, Search, X } from 'lucide-react';
import { cn } from '../utils';

interface BOMItem {
  name: string;
  code: string;
  qty: number;
}

interface ChangeLog {
  date: string;
  version: string;
  note: string;
  docNo: string;
}

interface PartInfo {
  id: string;
  name: string;
  code: string;
  description: string;
  position: [number, number, number];
  subBOM: BOMItem[];
  history: ChangeLog[];
  status: 'OPERATIONAL' | 'NEEDS_MAINTENANCE' | 'CRITICAL';
}

const VEHICLE_PARTS: PartInfo[] = [
  { 
    id: 'hull', 
    name: 'Main Chassis & Hull', 
    code: 'K9-HULL-SYS', 
    description: 'All-welded steel armor hull providing protection against 155mm shell fragments and 14.5mm armor-piercing bullets.', 
    position: [0, 0.35, 0],
    subBOM: [
      { name: 'Lower Chassis Plate', code: 'CP-K9-001', qty: 1 },
      { name: 'Side Armor Plate', code: 'AP-K9-S12', qty: 2 },
      { name: 'Bottom Blast Shield', code: 'BS-K9-B05', qty: 1 }
    ],
    history: [
      { date: '2025.12.20', version: 'v2.4', docNo: 'ECR-K9-0841', note: 'Reinforced anti-mine plating added to floor' },
      { date: '2025.08.15', version: 'v2.3', docNo: 'ECR-K9-0312', note: 'Composite material density optimized' }
    ],
    status: 'OPERATIONAL'
  },
  { 
    id: 'turret', 
    name: '155mm Main Turret', 
    code: 'K9-TRT-155', 
    description: 'Large-volume rear-mounted turret housing the 155mm/52-cal gun and automatic fire control system.', 
    position: [0, 1.1, -0.8],
    subBOM: [
      { name: 'Turret Shell', code: 'TS-K9-155', qty: 1 },
      { name: 'Traverse Drive', code: 'TD-K9-015', qty: 1 },
      { name: 'Ammo Rack Module', code: 'AM-K9-R24', qty: 2 }
    ],
    history: [
      { date: '2026.03.10', version: 'v4.1', docNo: 'ECR-K9-0105', note: 'Improved stabilization algorithm deployed' },
      { date: '2025.11.02', version: 'v4.0', docNo: 'ECR-K9-1120', note: 'New ballistic computer integration' }
    ],
    status: 'NEEDS_MAINTENANCE'
  },
  { 
    id: 'barrel', 
    name: '155mm CN98 Barrel', 
    code: 'K9-BRL-CN98', 
    description: '155mm/52-caliber long-range barrel with double-baffle muzzle brake and thermal sleeve.', 
    position: [0, 1.25, 2.8],
    subBOM: [
      { name: 'Chrome Lined Tube', code: 'BT-K9-CN98', qty: 1 },
      { name: 'Muzzle Brake', code: 'MB-K9-155', qty: 1 },
      { name: 'Thermal Sleeve', code: 'TS-K9-B52', qty: 1 }
    ],
    history: [
      { date: '2026.04.15', version: 'v2.1', docNo: 'ECR-K9-0331', note: 'Advanced chromium plating for barrel longevity' },
      { date: '2025.11.30', version: 'v2.0', docNo: 'ECR-K9-0995', note: 'Thermal sleeve material optimization' }
    ],
    status: 'OPERATIONAL'
  },
  { 
    id: 'engine', 
    name: 'STX-MTU 1000HP Engine', 
    code: 'K9-ENG-1000', 
    description: 'Front-mounted 1000HP water-cooled diesel engine for high mobility in diverse terrains.', 
    position: [0.6, 0.6, 1.5],
    subBOM: [
      { name: 'MT881 Ka-500 Diesel', code: 'EN-MT-881', qty: 1 },
      { name: 'Cooling System', code: 'CS-K9-002', qty: 1 },
      { name: 'Transmission Unit', code: 'TR-K9-L4', qty: 1 }
    ],
    history: [
      { date: '2026.05.05', version: 'v5.2', docNo: 'ECR-K9-0419', note: 'Engine cooling efficiency update' },
      { date: '2025.12.12', version: 'v5.1', docNo: 'ECR-K9-0901', note: 'Fuel injection timing optimization' }
    ],
    status: 'CRITICAL'
  },
  { 
    id: 'tracks_l', 
    name: 'Left Suspension System', 
    code: 'K9-SUS-L', 
    description: 'Hydropneumatic suspension system allowing superior cross-country performance and firing stability.', 
    position: [-1.2, 0.25, 0],
    subBOM: [
      { name: 'Track Link Set', code: 'TL-K9-120', qty: 96 },
      { name: 'Road Wheel Module', code: 'RW-K9-001', qty: 6 },
      { name: 'Hydro-pneumatic Unit', code: 'HU-K9-S6', qty: 6 }
    ],
    history: [
      { date: '2026.01.22', version: 'v1.8', docNo: 'ECR-K9-0042', note: 'Shock absorber pressure range calibrated' },
      { date: '2025.09.14', version: 'v1.7', docNo: 'ECR-K9-0567', note: 'Road wheel rubber compound upgrade' }
    ],
    status: 'OPERATIONAL'
  },
  { 
    id: 'tracks_r', 
    name: 'Right Suspension System', 
    code: 'K9-SUS-R', 
    description: 'Hydropneumatic suspension system allowing superior cross-country performance and firing stability.', 
    position: [1.2, 0.25, 0],
    subBOM: [
      { name: 'Track Link Set', code: 'TL-K9-120', qty: 96 },
      { name: 'Road Wheel Module', code: 'RW-K9-001', qty: 6 },
      { name: 'Hydro-pneumatic Unit', code: 'HU-K9-S6', qty: 6 }
    ],
    history: [
      { date: '2026.01.22', version: 'v1.8', docNo: 'ECR-K9-0043', note: 'Shock absorber pressure range calibrated' },
      { date: '2025.09.14', version: 'v1.7', docNo: 'ECR-K9-0568', note: 'Road wheel rubber compound upgrade' }
    ],
    status: 'OPERATIONAL'
  },
];

function VehiclePart({ part, isSelected, onClick, showDefects }: { part: PartInfo; isSelected: boolean; onClick: () => void; showDefects: boolean }) {
  const meshRef = useRef<THREE.Mesh>(null!);
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (isSelected) {
      meshRef.current.scale.lerp(new THREE.Vector3(1.05, 1.05, 1.05), 0.1);
    } else {
      meshRef.current.scale.lerp(new THREE.Vector3(1, 1, 1), 0.1);
    }

    if (showDefects && (part.status === 'NEEDS_MAINTENANCE' || part.status === 'CRITICAL')) {
      const scale = 1 + Math.sin(state.clock.elapsedTime * 5) * 0.02;
      meshRef.current.scale.set(scale, scale, scale);
    }
  });

  const getGeometry = () => {
    switch (part.id) {
      case 'hull': return <boxGeometry args={[2.2, 0.7, 6]} />;
      case 'turret': return <boxGeometry args={[2, 0.8, 3.2]} />;
      case 'barrel': return <cylinderGeometry args={[0.08, 0.08, 5]} />;
      case 'engine': return <boxGeometry args={[0.9, 0.6, 1.8]} />;
      case 'tracks_l':
      case 'tracks_r': return <boxGeometry args={[0.6, 0.5, 6.2]} />;
      default: return <boxGeometry args={[1, 1, 1]} />;
    }
  };

  const getMaterialColor = () => {
    if (showDefects) {
      if (part.status === 'CRITICAL') return '#ef4444';
      if (part.status === 'NEEDS_MAINTENANCE') return '#f59e0b';
    }
    return isSelected ? '#F37321' : hovered ? '#475569' : '#2d3748';
  };

  return (
    <mesh
      ref={meshRef}
      position={part.position}
      rotation={part.id === 'barrel' ? [Math.PI / 2, 0, 0] : [0, 0, 0]}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
      castShadow
      receiveShadow
    >
      {getGeometry()}
      <meshStandardMaterial 
        color={getMaterialColor()} 
        roughness={0.4}
        metalness={0.7}
        emissive={getMaterialColor()}
        emissiveIntensity={isSelected || (showDefects && part.status !== 'OPERATIONAL') ? 0.5 : 0}
      />
    </mesh>
  );
}

function ArmoredVehicle({ selectedId, onSelectPart, showDefects }: { selectedId: string | null; onSelectPart: (id: string) => void; showDefects: boolean }) {
  return (
    <group>
      {VEHICLE_PARTS.map((part) => (
        <VehiclePart 
          key={part.id} 
          part={part} 
          isSelected={selectedId === part.id}
          onClick={() => onSelectPart(part.id)}
          showDefects={showDefects}
        />
      ))}
      
      {/* Decorative details for K9 look */}
      <mesh position={[0, 1.15, 0.4]}>
        <cylinderGeometry args={[0.5, 0.5, 0.4]} />
        <meshStandardMaterial color="#1a202c" />
      </mesh>
      
      {/* Muzzle brake decorative */}
      <mesh position={[0, 1.25, 5.3]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.15, 0.15, 0.4]} />
        <meshStandardMaterial color="#000000" metalness={0.9} />
      </mesh>
    </group>
  );
}

export default function VehicleViewer() {
  const [selectedPartId, setSelectedPartId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'info' | 'bom' | 'history'>('info');
  const [showDefects, setShowDefects] = useState(false);
  const selectedPart = VEHICLE_PARTS.find(p => p.id === selectedPartId);

  return (
    <div className="flex flex-col h-full bg-[#f8fafc] relative overflow-hidden">
      {/* Header */}
      <header className="h-16 border-b border-brand-border flex items-center justify-between px-6 bg-white z-10 glass-morphism">
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-semibold text-slate-900 tracking-tight apple-tight uppercase">K9 Thunder Assets</h2>
          <div className="h-4 w-px bg-slate-300" />
          <div className="flex items-center gap-2 text-[10px] font-mono text-hanwha-orange bg-hanwha-orange/10 px-2 py-1 rounded border border-hanwha-orange/20 uppercase tracking-[0.1em]">
            SPH Digital Twin v1.2
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setShowDefects(!showDefects)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all",
              showDefects 
                ? "bg-red-500 text-white shadow-lg shadow-red-500/20" 
                : "bg-slate-900 text-white hover:bg-black"
            )}
          >
            <Shield className={cn("w-4 h-4", showDefects && "animate-pulse")} />
            {showDefects ? "Stop Scan" : "Scan for Defects"}
          </button>
          <div className="h-8 w-px bg-slate-200" />
          <div className="flex -space-x-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-400">
                U{i}
              </div>
            ))}
          </div>
        </div>
      </header>

      <div className="flex-1 flex relative">
        {/* Sidebar Info */}
        <div className={cn(
          "absolute left-6 top-6 bottom-6 w-96 z-20 transition-all duration-500 transform",
          selectedPart ? "translate-x-0 opacity-100" : "-translate-x-12 opacity-0 pointer-events-none"
        )}>
          {selectedPart && (
            <div className="bg-white/90 backdrop-blur-xl border border-brand-border rounded-2xl shadow-2xl h-full flex flex-col overflow-hidden">
              {/* Header Info */}
              <div className="p-6 pb-4 border-b border-slate-100 bg-slate-50/50">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-hanwha-orange/10 rounded-xl flex items-center justify-center">
                    <Box className="w-6 h-6 text-hanwha-orange" />
                  </div>
                  <button 
                    onClick={() => setSelectedPartId(null)}
                    className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    <X className="w-4 h-4 text-slate-400" />
                  </button>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Part Name</h3>
                    <div className={cn(
                      "px-2 py-0.5 rounded text-[8px] font-bold uppercase",
                      selectedPart.status === 'OPERATIONAL' ? "bg-emerald-100 text-emerald-700" :
                      selectedPart.status === 'NEEDS_MAINTENANCE' ? "bg-amber-100 text-amber-700" :
                      "bg-red-100 text-red-700"
                    )}>
                      {selectedPart.status}
                    </div>
                  </div>
                  <p className="text-xl font-black text-slate-900 leading-tight uppercase apple-tight mb-2">{selectedPart.name}</p>
                  <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-slate-900 rounded-lg text-emerald-400 font-mono text-[10px] border border-slate-700">
                    <Zap className="w-3 h-3" />
                    {selectedPart.code}
                  </div>
                </div>
              </div>

              {/* Tabs */}
              <div className="flex border-b border-slate-100">
                {[
                  { id: 'info', label: 'Spec' },
                  { id: 'bom', label: 'BOM' },
                  { id: 'history', label: 'History' }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={cn(
                      "flex-1 py-3 text-[10px] font-bold uppercase tracking-widest transition-all border-b-2",
                      activeTab === tab.id 
                        ? "border-hanwha-orange text-hanwha-orange bg-hanwha-orange/5" 
                        : "border-transparent text-slate-400 hover:text-slate-600 hover:bg-slate-50"
                    )}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                {activeTab === 'info' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Detailed Description</h3>
                      <p className="text-sm text-slate-600 leading-relaxed font-medium">{selectedPart.description}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                        <span className="block text-[9px] font-bold text-slate-400 uppercase mb-1">Status</span>
                        <span className={cn(
                          "text-xs font-bold",
                          selectedPart.status === 'OPERATIONAL' ? "text-emerald-600" :
                          selectedPart.status === 'NEEDS_MAINTENANCE' ? "text-amber-600" :
                          "text-red-600"
                        )}>{selectedPart.status}</span>
                      </div>
                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                        <span className="block text-[9px] font-bold text-slate-400 uppercase mb-1">Last Inspection</span>
                        <span className="text-xs font-bold text-slate-700">2026.05.12</span>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'bom' && (
                  <div className="space-y-4">
                    <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Sub-Assembly BOM</h3>
                    <div className="space-y-2">
                      {selectedPart.subBOM.map((item, i) => (
                        <div key={i} className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between group hover:border-hanwha-orange/30 transition-colors">
                          <div>
                            <p className="text-xs font-bold text-slate-900 mb-0.5">{item.name}</p>
                            <p className="text-[9px] font-mono text-slate-400 uppercase">{item.code}</p>
                          </div>
                          <div className="text-[10px] font-bold text-slate-500 bg-white px-2 py-1 rounded border border-slate-200">
                            QTY: {item.qty}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === 'history' && (
                  <div className="space-y-4">
                    <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Engineering Change Logs</h3>
                    <div className="relative pl-4 space-y-6 before:absolute before:left-0 before:top-2 before:bottom-2 before:w-[1px] before:bg-slate-200">
                      {selectedPart.history.map((log, i) => (
                        <div key={i} className="relative">
                          <div className="absolute -left-[21px] top-1.5 w-3 h-3 rounded-full border-2 border-white bg-hanwha-orange shadow-sm" />
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex flex-col">
                              <span className="text-[10px] font-black text-slate-900">{log.version}</span>
                              <span className="text-[8px] font-mono text-slate-400 uppercase tracking-tight">Doc No: {log.docNo}</span>
                            </div>
                            <span className="text-[9px] font-bold text-slate-400">{log.date}</span>
                          </div>
                          <p className="text-[11px] text-slate-600 font-medium leading-normal">{log.note}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* 3D Stage */}
        <div className="flex-1 relative cursor-move">
          <Canvas shadows>
            <PerspectiveCamera makeDefault position={[5, 5, 5]} fov={50} />
            <OrbitControls 
              enablePan={false} 
              minDistance={4} 
              maxDistance={12}
              autoRotate={!selectedPartId && !showDefects}
              autoRotateSpeed={0.5}
            />
            
            <ambientLight intensity={0.5} />
            <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} castShadow />
            <pointLight position={[-10, -10, -10]} intensity={0.5} />
            
            <Suspense fallback={null}>
              <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.5}>
                <ArmoredVehicle 
                  selectedId={selectedPartId} 
                  showDefects={showDefects}
                  onSelectPart={(id) => {
                    setSelectedPartId(id);
                    setActiveTab('info');
                  }} 
                />
              </Float>
              
              <ContactShadows 
                position={[0, -0.5, 0]} 
                opacity={0.4} 
                scale={10} 
                blur={2} 
                far={4.5} 
              />
              <Environment preset="city" />
            </Suspense>
          </Canvas>

          {/* Legend Overlay */}
          {showDefects && (
            <div className="absolute right-6 bottom-6 flex flex-col gap-2 p-4 bg-white/80 backdrop-blur border border-brand-border rounded-2xl shadow-xl">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
                <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">Critical Defect</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-amber-500 animate-pulse" />
                <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">Maintenance Required</span>
              </div>
            </div>
          )}
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #cbd5e1;
        }
      `}} />
    </div>
  );
}

