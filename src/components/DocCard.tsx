/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Calendar, Bell, AlertTriangle, CheckCircle, Clock, Trash2, Edit3, ChevronDown, ChevronUp, FileText } from 'lucide-react';
import { LocalDocument, DocCategory } from '../types';
import CategoryBadge from './CategoryBadge';

interface DocCardProps {
  key?: string;
  doc: LocalDocument;
  onEdit: (doc: LocalDocument) => void;
  onDelete: (id: string) => void;
}

export default function DocCard({ doc, onEdit, onDelete }: DocCardProps) {
  const [showAlerts, setShowAlerts] = useState(false);

  // Parse dates
  const expiryDate = new Date(doc.expiryDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const expiry = new Date(expiryDate);
  expiry.setHours(0, 0, 0, 0);

  // Days remaining calculation
  const diffTime = expiry.getTime() - today.getTime();
  const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  // Determine urgency and color matching "Geometric Balance"
  // Red for <7 days/Overdue, Yellow for 8-30 days, Green for 31+ days
  let statusClass = '';
  let textThemeColor = '';
  let statusText = '';

  if (daysRemaining <= 7) {
    statusClass = 'bg-[#FEF2F2] text-[#DC2626] border-[#FEE2E2]';
    textThemeColor = 'text-[#DC2626]';
    statusText = daysRemaining < 0 ? 'Overdue' : 'Critical';
  } else if (daysRemaining <= 30) {
    statusClass = 'bg-[#FFFBEB] text-[#D97706] border-[#FEF3C7]';
    textThemeColor = 'text-[#D97706]';
    statusText = 'Expiring Soon';
  } else {
    statusClass = 'bg-[#F0FDF4] text-[#16A34A] border-[#DCFCE7]';
    textThemeColor = 'text-[#16A34A]';
    statusText = 'Secure';
  }

  // Format date
  const formattedExpiry = expiryDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  // Calculate 3 alerts dates (30d, 15d, 1d)
  const alerts = [30, 15, 1].map(days => {
    const alertTime = expiry.getTime() - (days * 24 * 60 * 60 * 1000);
    const alertDate = new Date(alertTime);
    const isPast = alertTime <= today.getTime();
    return {
      daysBefore: days,
      date: alertDate,
      isPast,
      formatted: alertDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    };
  });

  // Category label helper
  const getCategoryLabel = (cat: DocCategory) => {
    switch (cat) {
      case DocCategory.VEHICLE: return 'Vehicle';
      case DocCategory.PERSONAL: return 'Personal';
      case DocCategory.MEDICAL: return 'Medical';
      case DocCategory.FINANCE: return 'Finance';
      default: return cat;
    }
  };

  return (
    <div 
      id={`doc-card-${doc.id}`}
      className="flex flex-col justify-between bg-white border border-[#E2E8F0] rounded-[16px] p-6 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05)] hover:shadow-lg hover:border-slate-300 transition-all duration-300 h-full group"
    >
      {/* Top Header Row of Card */}
      <div className="flex justify-between items-start gap-3">
        <div>
          {/* Category Pill */}
          <span className="inline-block bg-[#F1F5F9] px-3 py-1.5 rounded-[8px] text-[11px] font-bold text-[#64748B] uppercase tracking-[0.5px]">
            {getCategoryLabel(doc.category)}
          </span>
          
          {/* Document Title */}
          <h3 className="text-[20px] font-bold text-[#1E293B] mt-4 mb-1 leading-snug group-hover:text-blue-600 transition-colors" title={doc.title}>
            {doc.title}
          </h3>
          
          {/* Reference/Policy Number */}
          <p className="text-sm font-mono text-[#94A3B8] mb-5">
            {doc.referenceNo ? `Policy: #${doc.referenceNo}` : 'No reference code'}
          </p>
        </div>

        {/* Status Badge & Actions Column */}
        <div className="flex flex-col items-end gap-3.5">
          <span className={`px-3 py-1.5 rounded-[8px] text-[13px] font-bold border ${statusClass}`}>
            {statusText}
          </span>
          
          {/* Quick Actions */}
          <div className="flex items-center gap-1.5">
            <button 
              onClick={() => onEdit(doc)}
              className="p-1.5 text-[#94A3B8] hover:text-[#2563EB] rounded-lg hover:bg-slate-50 transition-colors"
              title="Edit document"
            >
              <Edit3 size={15} />
            </button>
            <button 
              onClick={() => onDelete(doc.id)}
              className="p-1.5 text-[#94A3B8] hover:text-[#DC2626] rounded-lg hover:bg-red-50 transition-colors"
              title="Delete document"
            >
              <Trash2 size={15} />
            </button>
          </div>
        </div>
      </div>

      {/* Center section: Notes if any */}
      {doc.notes && (
        <p className="text-xs text-[#64748B] italic border-l-2 border-slate-200 pl-3 py-1 my-3 line-clamp-2" title={doc.notes}>
          "{doc.notes}"
        </p>
      )}

      {/* Bottom Row of Card: Expiry info + CountDown */}
      <div className="flex justify-between items-end border-t border-[#F1F5F9] pt-5 mt-4">
        <div>
          <div className="text-[11px] uppercase tracking-wider text-[#94A3B8] mb-1">Expiry Date</div>
          <div className="text-base font-semibold text-[#1E293B] flex items-center gap-1.5">
            <Calendar size={14} className="text-[#94A3B8]" />
            <span>{formattedExpiry}</span>
          </div>
        </div>
        
        <div className="text-right">
          <div className={`text-[32px] font-extrabold tracking-tight leading-none ${textThemeColor}`}>
            {daysRemaining < 0 ? `-${Math.abs(daysRemaining)}` : String(daysRemaining).padStart(2, '0')}
          </div>
          <div className={`text-[12px] font-semibold tracking-wider uppercase mt-1 ${textThemeColor}`}>
            {daysRemaining < 0 ? 'DAYS OVERDUE' : daysRemaining === 1 ? 'DAY LEFT' : 'DAYS LEFT'}
          </div>
        </div>
      </div>

      {/* Companion smart alerts schedule indicator */}
      <div className="mt-4 pt-3.5 border-t border-slate-100 flex flex-col gap-2">
        <div className="flex items-center justify-between text-xs">
          <span className="flex items-center gap-1.5 font-medium text-slate-500">
            <Bell size={13} className={doc.alertActive ? 'text-emerald-500 shrink-0' : 'text-slate-400 shrink-0'} />
            <span>Smart Alerts Companion</span>
          </span>
          <span className={`font-semibold px-2 py-0.5 rounded text-[10px] ${doc.alertActive ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-slate-100 text-slate-600'}`}>
            {doc.alertActive ? 'ACTIVE' : 'DISABLED'}
          </span>
        </div>

        {doc.alertActive && (
          <div>
            <button 
              onClick={() => setShowAlerts(!showAlerts)}
              className="w-full flex items-center justify-between text-[11px] text-[#64748B] hover:text-[#2563EB] py-1.5 px-2 bg-slate-50 hover:bg-slate-100/80 rounded-lg transition-colors border border-slate-100"
            >
              <span>View scheduled triggers</span>
              {showAlerts ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
            </button>
            
            {showAlerts && (
              <div className="mt-2 p-2.5 bg-[#F8FAFC] border border-slate-100 rounded-lg space-y-1.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Triggers for device sync:</span>
                {alerts.map((alert, idx) => (
                  <div key={idx} className="flex items-center justify-between text-[10px]">
                    <span className="flex items-center gap-1.5">
                      <span className={`w-1.5 h-1.5 rounded-full ${alert.isPast ? 'bg-slate-300' : 'bg-amber-400'}`} />
                      <span className="text-slate-500">{alert.daysBefore} days prior:</span>
                    </span>
                    <span className={`font-mono ${alert.isPast ? 'text-slate-400 line-through' : 'text-slate-700 font-semibold'}`}>
                      {alert.formatted} {alert.isPast ? '(Sent)' : '(Pending)'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

    </div>
  );
}
