/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { X, Calendar, FileText, Settings, Shield, PlusCircle, BellRing } from 'lucide-react';
import { LocalDocument, DocCategory } from '../types';

interface DocFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (docData: Omit<LocalDocument, 'id' | 'updatedAt'> & { id?: string }) => void;
  editDoc?: LocalDocument | null;
}

export default function DocFormModal({ isOpen, onClose, onSave, editDoc }: DocFormModalProps) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<DocCategory>(DocCategory.VEHICLE);
  const [referenceNo, setReferenceNo] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [alertActive, setAlertActive] = useState(true);
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  // Synchronize state with editDoc if editing
  useEffect(() => {
    if (editDoc) {
      setTitle(editDoc.title);
      setCategory(editDoc.category);
      setReferenceNo(editDoc.referenceNo || '');
      setAlertActive(editDoc.alertActive);
      setNotes(editDoc.notes || '');
      
      // Parse date to YYYY-MM-DD
      const date = new Date(editDoc.expiryDate);
      if (!isNaN(date.getTime())) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        setExpiryDate(`${year}-${month}-${day}`);
      } else {
        setExpiryDate('');
      }
    } else {
      // Default initial states
      setTitle('');
      setCategory(DocCategory.VEHICLE);
      setReferenceNo('');
      setAlertActive(true);
      setNotes('');
      
      // Set default expiry date as 1 year from today for quick convenience
      const nextYear = new Date();
      nextYear.setFullYear(nextYear.getFullYear() + 1);
      const year = nextYear.getFullYear();
      const month = String(nextYear.getMonth() + 1).padStart(2, '0');
      const day = String(nextYear.getDate()).padStart(2, '0');
      setExpiryDate(`${year}-${month}-${day}`);
    }
    setError('');
  }, [editDoc, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Custom form validations
    if (!title.trim()) {
      setError('Document title is required.');
      return;
    }
    if (!expiryDate) {
      setError('Please select a valid expiry date.');
      return;
    }

    const parsedDate = new Date(expiryDate);
    if (isNaN(parsedDate.getTime())) {
      setError('The selected expiry date is invalid.');
      return;
    }

    onSave({
      id: editDoc?.id, // Includes ID if editing
      title: title.trim(),
      category,
      referenceNo: referenceNo.trim() || undefined,
      expiryDate: parsedDate,
      alertActive,
      notes: notes.trim() || undefined
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop overlay */}
      <div 
        className="absolute inset-0 bg-slate-900/45 backdrop-blur-xs transition-opacity animate-fadeIn" 
        onClick={onClose} 
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden z-10 animate-scaleUp">
        
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-blue-100 text-blue-700">
              <FileText size={18} />
            </span>
            <h2 className="font-sans font-bold text-slate-800 text-base">
              {editDoc ? 'Edit Life Document' : 'Track New Document'}
            </h2>
          </div>
          <button 
            onClick={onClose} 
            className="p-1.5 hover:bg-slate-200 text-slate-400 hover:text-slate-700 rounded-full transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-100 rounded-lg text-rose-700 text-xs font-medium">
              ⚠️ {error}
            </div>
          )}

          {/* Title Field */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
              Document Name / Title *
            </label>
            <input 
              type="text" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Passport, Honda Car Insurance, PUC Certificate"
              className="w-full px-3.5 py-2 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500/25 focus:border-blue-500 transition-all"
              required
            />
          </div>

          {/* Grid fields for Category & Reference No */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Category selection */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                Category Group
              </label>
              <select 
                value={category}
                onChange={(e) => setCategory(e.target.value as DocCategory)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500/25 focus:border-blue-500 transition-all"
              >
                <option value={DocCategory.VEHICLE}>🚗 Vehicle & Transport</option>
                <option value={DocCategory.PERSONAL}>🆔 Personal & Identity</option>
                <option value={DocCategory.MEDICAL}>🏥 Medical & Healthcare</option>
                <option value={DocCategory.FINANCE}>💼 Finance & Banking</option>
              </select>
            </div>

            {/* Reference No */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                Reference / Policy Number
              </label>
              <input 
                type="text" 
                value={referenceNo}
                onChange={(e) => setReferenceNo(e.target.value)}
                placeholder="e.g. AP39F1234, POL-98782"
                className="w-full px-3.5 py-2 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500/25 focus:border-blue-500 transition-all"
              />
            </div>

          </div>

          {/* Grid fields for Expiry Date & Alert Checkbox */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Expiry Date */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                Expiration Date *
              </label>
              <div className="relative">
                <input 
                  type="date" 
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  className="w-full px-3 py-2 pl-9 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500/25 focus:border-blue-500 transition-all"
                  required
                />
                <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              </div>
            </div>

            {/* Alert Toggle */}
            <div className="flex flex-col justify-center">
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                Alert Companion
              </label>
              <label className="inline-flex items-center gap-2 cursor-pointer select-none bg-slate-50 border border-slate-200/60 p-2 rounded-lg">
                <input 
                  type="checkbox" 
                  checked={alertActive}
                  onChange={(e) => setAlertActive(e.target.checked)}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
                />
                <span className="text-xs font-medium text-slate-700 flex items-center gap-1">
                  <BellRing size={12} className={alertActive ? 'text-blue-500' : 'text-slate-400'} />
                  Enable 30/15/1d Alerts
                </span>
              </label>
            </div>

          </div>

          {/* Notes field */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
              Additional Notes / Tips
            </label>
            <textarea 
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Keep photocopy in dashboard, Renewal discount applies if renewed online, Medical insurer hotline is 1-800-..."
              rows={3}
              className="w-full px-3.5 py-2 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500/25 focus:border-blue-500 transition-all resize-none"
            />
          </div>

          {/* Actions Footer */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button 
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-lg text-sm font-medium transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold flex items-center gap-1.5 shadow-xs hover:shadow-md transition-all duration-200"
            >
              <PlusCircle size={15} />
              <span>{editDoc ? 'Apply Changes' : 'Schedule Tracking'}</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
