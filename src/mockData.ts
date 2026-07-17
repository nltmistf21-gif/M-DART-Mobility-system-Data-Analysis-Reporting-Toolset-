import { SensorDataPoint, SensorMetadata, FEAComparison } from './types';

export const MOCK_SENSORS: SensorMetadata[] = [
  { id: 'SG-01', name: 'Main Frame Strain A', unit: 'MPa', type: 'Strain', location: { x: 10, y: 5, z: 2 } },
  { id: 'SG-02', name: 'Main Frame Strain B', unit: 'MPa', type: 'Strain', location: { x: 10, y: -5, z: 2 } },
  { id: 'ACC-01', name: 'Hull Acceleration', unit: 'g', type: 'Acceleration', location: { x: 0, y: 0, z: 0 } },
  { id: 'SG-03', name: 'Axle Stress Left', unit: 'MPa', type: 'Strain', location: { x: -5, y: 15, z: -1 } },
  { id: 'SG-04', name: 'Axle Stress Right', unit: 'MPa', type: 'Strain', location: { x: -5, y: -15, z: -1 } },
];

export const generateMockSensorData = (sensorId: string, points: number = 1000): SensorDataPoint[] => {
  const data: SensorDataPoint[] = [];
  const now = Date.now();
  let val = 50;
  
  for (let i = 0; i < points; i++) {
    // Simulate some noise and events
    const noise = (Math.random() - 0.5) * 5;
    const event = (i > 400 && i < 450) ? Math.sin((i - 400) * 0.2) * 40 : 0; // Impact event
    val = 50 + noise + event;
    data.push({
      timestamp: now + i * 10, // 100Hz
      value: parseFloat(val.toFixed(2))
    });
  }
  return data;
};

export const MOCK_FEA_CORRELATION: FEAComparison[] = [
  { sensorId: 'SG-01', testValue: 145.2, feaValue: 142.0, errorRate: 2.25, status: 'Safe' },
  { sensorId: 'SG-02', testValue: 148.5, feaValue: 142.0, errorRate: 4.57, status: 'Safe' },
  { sensorId: 'SG-03', testValue: 285.0, feaValue: 260.0, errorRate: 9.61, status: 'Warning' },
  { sensorId: 'SG-04', testValue: 110.2, feaValue: 108.0, errorRate: 2.03, status: 'Safe' },
];
