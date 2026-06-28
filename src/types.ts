/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export enum DocCategory {
  VEHICLE = 'VEHICLE',
  PERSONAL = 'PERSONAL',
  MEDICAL = 'MEDICAL',
  FINANCE = 'FINANCE'
}

export interface LocalDocument {
  id: string;
  category: DocCategory;
  title: string;
  referenceNo?: string;
  expiryDate: Date | string; // Dates are stored as Firestore Timestamps (or string ISO in serialization)
  alertActive: boolean;
  notes?: string;
  updatedAt: Date | string;
}

export interface SimulatedAlert {
  id: string;
  documentId: string;
  documentTitle: string;
  category: DocCategory;
  alertType: '30_DAYS' | '15_DAYS' | '1_DAY';
  scheduledTime: Date;
  daysRemainingBeforeTrigger: number;
}
