/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface SensorDataPoint {
  timestamp: number;
  value: number;
}

export interface SensorMetadata {
  id: string;
  name: string;
  unit: string;
  type: 'Strain' | 'Acceleration' | 'Pressure' | 'Temperature';
  location: { x: number; y: number; z: number };
}

export interface FEAComparison {
  sensorId: string;
  testValue: number;
  feaValue: number;
  errorRate: number;
  status: 'Safe' | 'Warning' | 'Critical';
}

export interface TestReport {
  id: string;
  title: string;
  date: string;
  tester: string;
  summary: string;
  peakValues: { sensorId: string; value: number; timestamp: number }[];
  conclusions: string[];
}

export type ViewMode = 'Dashboard' | 'Correlation' | 'Reporting';
