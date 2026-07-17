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
}

const VEHICLE_PARTS: PartInfo[] = [
  { 
    id: 'hull', 
    name: 'Main Hull Structure', 
    code: 'AS-HULL-900X', 
    description: 'Advanced composite armor hull with integrated blast protection.', 
    position: [0, 0.5, 0],
    subBOM: [
      { name: 'Lower Chassis Plate', code: 'CP-LW-001', qty: 1 },
      { name: 'Sponson Armor Module', code: 'AM-SP-042', qty: 2 },
      { name: 'Internal Spall Liner', code: 'SL-IN-900', qty: 1 }
    ],
    history: [
      { date: '2025.12.20', version: 'v2.4', docNo: 'ECR-2025-0841', note: 'Reinforced anti-mine plating added to floor' },
      { date: '2025.08.15', version: 'v2.3', docNo: 'ECR-2025-0312', note: 'Composite material density optimized' }
    ]
  },
  { 
    id: 'turret', 
    name: '30mm Remote Turret', 
    code: 'TR-RM-30MM', 
    description: 'Stabilized remote weapon station with thermal imaging.', 
    position: [0, 1.2, 0.5],
    subBOM: [
      { name: 'MK44 Bushmaster II', code: 'GN-BM-30', qty: 1 },
      { name: 'Servo Drive Unit', code: 'SD-TR-015', qty: 2 },
      { name: 'Ammo Feed Chute', code: 'AF-CH-30', qty: 1 }
    ],
    history: [
      { date: '2026.03.10', version: 'v4.1', docNo: 'ECR-2026-0105', note: 'Improved stabilization algorithm deployed' },
      { date: '2025.11.02', version: 'v4.0', docNo: 'ECR-2025-1120', note: 'Thermal sensor sensitivity upgrade' }
    ]
  },
  { 
    id: 'tracks_l', 
    name: 'Left Track Assembly', 
    code: 'TK-DR-L22', 
    description: 'High-durability rubber composite tracks for low vibration.', 
    position: [-1.2, 0.2, 0],
    subBOM: [
      { name: 'Rubber Track Segment', code: 'TS-RB-22', qty: 84 },
      { name: 'Drive Sprocket', code: 'DS-TK-008', qty: 1 },
      { name: 'Road Wheel Module', code: 'RW-TK-012', qty: 7 }
    ],
    history: [
      { date: '2026.01.22', version: 'v1.8', docNo: 'ECR-2026-0042', note: 'Cold weather resilience testing passed' },
      { date: '2025.09.14', version: 'v1.7', docNo: 'ECR-2025-0567', note: 'Tensioner hydraulic seal replaced' }
    ]
  },
  { 
    id: 'tracks_r', 
    name: 'Right Track Assembly', 
    code: 'TK-DR-R22', 
    description: 'High-durability rubber composite tracks for low vibration.', 
    position: [1.2, 0.2, 0],
    subBOM: [
      { name: 'Rubber Track Segment', code: 'TS-RB-22', qty: 84 },
      { name: 'Drive Sprocket', code: 'DS-TK-008', qty: 1 },
      { name: 'Road Wheel Module', code: 'RW-TK-012', qty: 7 }
    ],
    history: [
      { date: '2026.01.22', version: 'v1.8', docNo: 'ECR-2026-0043', note: 'Cold weather resilience testing passed' },
      { date: '2025.09.14', version: 'v1.7', docNo: 'ECR-2025-0568', note: 'Tensioner hydraulic seal replaced' }
    ]
  },
  { 
    id: 'engine', 
    name: 'Power Pack Module', 
    code: 'PP-DS-1200HP', 
    description: '1200HP Multi-fuel engine with hybrid electric drive capability.', 
    position: [0, 0.6, -1.8],
    subBOM: [
      { name: 'Turbocharged Diesel Unit', code: 'EN-DS-1200', qty: 1 },
      { name: 'Electric Motor/Generator', code: 'MG-HB-400', qty: 1 },
      { name: 'Cooling Radiator Core', code: 'RD-CR-900', qty: 2 }
    ],
    history: [
      { date: '2026.05.05', version: 'v5.2', docNo: 'ECR-2026-0419', note: 'Hybrid controller firmware update' },
      { date: '2025.12.12', version: 'v5.1', docNo: 'ECR-2025-0901', note: 'Exhaust filtration system upgrade' }
    ]
  },
  { 
    id: 'sensor_mast', 
    name: 'Panoramic Sight', 
    code: 'SN-OP-PAN01', 
    description: '360-degree electro-optical situational awareness system.', 
    position: [0.4, 1.6, 0.3],
    subBOM: [
      { name: 'IR Imaging Core', code: 'SN-IR-V3', qty: 1 },
      { name: 'Laser Range Finder', code: 'SN-LR-002', qty: 1 },
      { name: 'Gimbal Stabilizer', code: 'GM-OP-011', qty: 1 }
    ],
    history: [
      { date: '2026.02.28', version: 'v3.5', docNo: 'ECR-2026-0088', note: 'Night vision resolution enhancement' },
      { date: '2025.10.19', version: 'v3.4', docNo: 'ECR-2025-0722', note: 'Optical coating anti-glare update' }
    ]
  },
  { 
    id: 'barrel', 
    name: '30mm Main Cannon Barrel', 
    code: 'GN-BR-30X', 
    description: 'High-velocity 30mm automatic cannon barrel with integrated thermal sleeve.', 
    position: [0, 1.2, 1.8],
    subBOM: [
      { name: 'Barrel Thermal Sleeve', code: 'TS-BR-30', qty: 1 },
      { name: 'Muzzle Brake Unit', code: 'MB-BR-30', qty: 1 },
      { name: 'Gas Port Assembly', code: 'GP-BR-012', qty: 1 }
    ],
    history: [
      { date: '2026.04.15', version: 'v2.1', docNo: 'ECR-2026-0331', note: 'Advanced chromium plating for barrel longevity' },
      { date: '2025.11.30', version: 'v2.0', docNo: 'ECR-2025-0995', note: 'Thermal sleeve material optimization' }
    ]
  },
];

function VehiclePart({ part, isSelected, onClick }: { part: PartInfo; isSelected: boolean; onClick: () => void }) {
  const meshRef = useRef<THREE.Mesh>(null!);
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (isSelected) {
      meshRef.current.scale.lerp(new THREE.Vector3(1.05, 1.05, 1.05), 0.1);
    } else {
      meshRef.current.scale.lerp(new THREE.Vector3(1, 1, 1), 0.1);
    }
  });

  const getGeometry = () => {
    switch (part.id) {
      case 'hull': return <boxGeometry args={[2, 0.8, 4.5]} />;
      case 'turret': return <boxGeometry args={[1.5, 0.6, 1.5]} />;
      case 'tracks_l':
      case 'tracks_r': return <boxGeometry args={[0.5, 0.6, 4.8]} />;
      case 'engine': return <boxGeometry args={[1.6, 0.7, 1.2]} />;
      case 'sensor_mast': return <cylinderGeometry args={[0.1, 0.1, 0.4]} />;
      case 'barrel': return <cylinderGeometry args={[0.08, 0.08, 2.5]} />;
      default: return <boxGeometry args={[1, 1, 1]} />;
    }
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
        color={isSelected ? '#F37321' : hovered ? '#475569' : '#1e293b'} 
        roughness={0.3}
        metalness={0.8}
        emissive={isSelected ? '#F37321' : '#000000'}
        emissiveIntensity={isSelected ? 0.5 : 0}
      />
    </mesh>
  );
}

function ArmoredVehicle({ selectedId, onSelectPart }: { selectedId: string | null; onSelectPart: (id: string) => void }) {
  return (
    <group>
      {VEHICLE_PARTS.map((part) => (
        <VehiclePart 
          key={part.id} 
          part={part} 
          isSelected={selectedId === part.id}
          onClick={() => onSelectPart(part.id)}
        />
      ))}
    </group>
  );
}

export default function VehicleViewer() {
  const [selectedPartId, setSelectedPartId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'info' | 'bom' | 'history'>('info');
  const selectedPart = VEHICLE_PARTS.find(p => p.id === selectedPartId);

  return (
    <div className="flex flex-col h-full bg-[#f8fafc] relative overflow-hidden">
      {/* Header */}
      <header className="h-16 border-b border-brand-border flex items-center justify-between px-6 bg-white z-10 glass-morphism">
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-semibold text-slate-900 tracking-tight apple-tight uppercase">Interactive Vehicle Asset</h2>
          <div className="h-4 w-px bg-slate-300" />
          <div className="flex items-center gap-2 text-[10px] font-mono text-hanwha-orange bg-hanwha-orange/10 px-2 py-1 rounded border border-hanwha-orange/20 uppercase tracking-[0.1em]">
            AS21 Redback Digital Twin
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex -space-x-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-400">
                U{i}
              </div>
            ))}
          </div>
          <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">3 active viewers</div>
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
                  <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Part Name</h3>
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
                        <span className="text-xs font-bold text-emerald-600">OPERATIONAL</span>
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
              autoRotate={!selectedPartId}
              autoRotateSpeed={0.5}
            />
            
            <ambientLight intensity={0.5} />
            <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} castShadow />
            <pointLight position={[-10, -10, -10]} intensity={0.5} />
            
            <Suspense fallback={null}>
              <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.5}>
                <ArmoredVehicle 
                  selectedId={selectedPartId} 
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

          {/* Controls UI Overlay */}
          <div className="absolute right-6 bottom-6 flex flex-col gap-3">
            <div className="p-4 bg-white/80 backdrop-blur border border-brand-border rounded-2xl shadow-xl space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-hanwha-orange animate-ping" />
                <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">Real-time Telemetry</span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center text-[11px] font-medium text-slate-500">
                  <span>HULL STRESS</span>
                  <span className="font-mono text-slate-900">12.4%</span>
                </div>
                <div className="h-1 w-32 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 w-[12.4%]" />
                </div>
              </div>
            </div>
            
            {!selectedPartId && (
              <div className="flex items-center gap-3 px-4 py-3 bg-slate-900 text-white rounded-full shadow-2xl animate-bounce">
                <Shield className="w-4 h-4 text-hanwha-orange" />
                <span className="text-[10px] font-bold uppercase tracking-widest">Click parts to inspect</span>
              </div>
            )}
          </div>
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

