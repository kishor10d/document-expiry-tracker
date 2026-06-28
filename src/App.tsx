/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Shield, 
  FilePlus, 
  Search, 
  Bell, 
  Filter, 
  Info, 
  Code, 
  Layers, 
  Trash2, 
  CheckCircle, 
  Sparkles, 
  HelpCircle,
  Clock,
  AlertTriangle,
  Smartphone,
  Wifi,
  Battery,
  Settings,
  Check,
  RotateCcw,
  Home
} from 'lucide-react';
import { LocalDocument, DocCategory } from './types';
import DocCard from './components/DocCard';
import DocFormModal from './components/DocFormModal';
import BlueprintViewer from './components/BlueprintViewer';

// Setup Mock Initial Documents synchronized with current date (June 28, 2026)
const getInitialDocuments = (): LocalDocument[] => {
  const baseTime = new Date('2026-06-28T09:00:00');
  
  const d1 = new Date(baseTime);
  d1.setDate(d1.getDate() + 3); // Expiring in 3 days -> Red

  const d2 = new Date(baseTime);
  d2.setDate(d2.getDate() + 18); // Expiring in 18 days -> Yellow

  const d3 = new Date(baseTime);
  d3.setDate(d3.getDate() - 5); // Expired 5 days ago -> Red (Overdue)

  const d4 = new Date(baseTime);
  d4.setFullYear(d4.getFullYear() + 1); // Expiring in 1 year -> Green

  const d5 = new Date(baseTime);
  d5.setDate(d5.getDate() + 45); // Expiring in 45 days -> Green

  return [
    {
      id: 'doc-1',
      category: DocCategory.VEHICLE,
      title: 'PUC Emissions Certificate',
      referenceNo: 'PUC-29F123',
      expiryDate: d1,
      alertActive: true,
      notes: 'Required for driving legally. Renewal costs around $10. Needs direct exhaust analysis.',
      updatedAt: baseTime
    },
    {
      id: 'doc-2',
      category: DocCategory.VEHICLE,
      title: 'Honda Car Insurance',
      referenceNo: 'POL-COV-99882',
      expiryDate: d2,
      alertActive: true,
      notes: 'No-claim bonus applies. Check renewal premium discounts before July 12th.',
      updatedAt: baseTime
    },
    {
      id: 'doc-3',
      category: DocCategory.MEDICAL,
      title: 'Primary Health Policy',
      referenceNo: 'M-INS-2831',
      expiryDate: d3,
      alertActive: false,
      notes: 'Grace period has expired. Reach out to the agent urgently for state medical corrections.',
      updatedAt: baseTime
    },
    {
      id: 'doc-4',
      category: DocCategory.PERSONAL,
      title: 'Passport (Global Visa travel)',
      referenceNo: 'PASS-V771A',
      expiryDate: d4,
      alertActive: true,
      notes: 'Must remain valid for at least 6 months when traveling internationally. Multi-page booklet.',
      updatedAt: baseTime
    },
    {
      id: 'doc-5',
      category: DocCategory.FINANCE,
      title: 'HDFC Fixed Deposit Maturity',
      referenceNo: 'FD-HDF-2810',
      expiryDate: d5,
      alertActive: true,
      notes: 'Auto-renewal instruction is off. Reinvest or deposit to savings account immediately.',
      updatedAt: baseTime
    }
  ];
};

export default function App() {
  const [documents, setDocuments] = useState<LocalDocument[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedUrgency, setSelectedUrgency] = useState<string>('ALL');
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editDoc, setEditDoc] = useState<LocalDocument | null>(null);

  // Active view: Simulator Dashboard vs Complete Developer blue-print specs
  const [activeTab, setActiveTab] = useState<'SIMULATOR' | 'BLUEPRINTS'>('SIMULATOR');

  // Interactive View mode: PHONE (default) or DESKTOP
  const [viewMode, setViewMode] = useState<'PHONE' | 'DESKTOP'>('PHONE');

  // Simulated live notification banner state
  const [simulatedNotification, setSimulatedNotification] = useState<{
    title: string;
    body: string;
    icon: string;
  } | null>(null);

  // Bottom Mobile tab navigation simulation inside the phone frame
  const [mobileActiveTab, setMobileActiveTab] = useState<'VAULT' | 'ALERTS' | 'SYNC'>('VAULT');

  // Load from local storage for durable persistence simulation
  useEffect(() => {
    const saved = localStorage.getItem('lifevault_documents');
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as LocalDocument[];
        // Rehydrate Dates
        const formatted = parsed.map(d => ({
          ...d,
          expiryDate: new Date(d.expiryDate),
          updatedAt: new Date(d.updatedAt)
        }));
        setDocuments(formatted);
      } catch (err) {
        setDocuments(getInitialDocuments());
      }
    } else {
      const initial = getInitialDocuments();
      setDocuments(initial);
      localStorage.setItem('lifevault_documents', JSON.stringify(initial));
    }
  }, []);

  // Save to local storage whenever list changes
  const saveDocumentsToCache = (newDocs: LocalDocument[]) => {
    setDocuments(newDocs);
    localStorage.setItem('lifevault_documents', JSON.stringify(newDocs));
  };

  // Add or update document
  const handleSaveDocument = (docData: Omit<LocalDocument, 'id' | 'updatedAt'> & { id?: string }) => {
    const todayStr = new Date();
    
    if (docData.id) {
      // Edit mode
      const updated = documents.map(d => {
        if (d.id === docData.id) {
          return {
            ...d,
            category: docData.category,
            title: docData.title,
            referenceNo: docData.referenceNo,
            expiryDate: docData.expiryDate,
            alertActive: docData.alertActive,
            notes: docData.notes,
            updatedAt: todayStr
          };
        }
        return d;
      });
      saveDocumentsToCache(updated);
    } else {
      // Create mode
      const newDoc: LocalDocument = {
        id: `doc-${Date.now()}`,
        category: docData.category,
        title: docData.title,
        referenceNo: docData.referenceNo,
        expiryDate: docData.expiryDate,
        alertActive: docData.alertActive,
        notes: docData.notes,
        updatedAt: todayStr
      };
      saveDocumentsToCache([newDoc, ...documents]);
    }
  };

  // Delete document
  const handleDeleteDocument = (id: string) => {
    if (confirm('Are you sure you want to cancel tracking for this document? This will purge all scheduled system notifications.')) {
      const filtered = documents.filter(d => d.id !== id);
      saveDocumentsToCache(filtered);
    }
  };

  // Trigger editing modal
  const handleEditTrigger = (doc: LocalDocument) => {
    setEditDoc(doc);
    setIsModalOpen(true);
  };

  // Trigger adding modal
  const handleAddTrigger = () => {
    setEditDoc(null);
    setIsModalOpen(true);
  };

  // Handler to trigger a simulated push notification
  const handleSimulatePushAlert = () => {
    if (documents.length === 0) {
      setSimulatedNotification({
        title: "LifeVault Push Notification",
        body: "No tracked documents found. Tap 'Track Document' to add one and trigger simulated push alerts.",
        icon: "⚠️"
      });
      return;
    }

    // Sort documents by remaining days
    const sorted = [...documents].sort((a, b) => {
      const aTime = new Date(a.expiryDate).getTime();
      const bTime = new Date(b.expiryDate).getTime();
      return aTime - bTime;
    });

    const closestDoc = sorted[0];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const expiry = new Date(closestDoc.expiryDate);
    expiry.setHours(0, 0, 0, 0);
    const days = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    let statusMsg = days < 0 
      ? `is expired and is ${Math.abs(days)} days overdue!` 
      : `expires in ${days} days (${expiry.toLocaleDateString()}).`;

    setSimulatedNotification({
      title: `LifeVault Alert: ${closestDoc.title}`,
      body: `This vital document ${statusMsg} Open companion alerts to renew.`,
      icon: days <= 7 ? "🚨" : days <= 30 ? "⚠️" : "🛡️"
    });

    // Auto dismiss after 6 seconds
    setTimeout(() => {
      setSimulatedNotification(null);
    }, 6000);
  };

  // Handler to clear cache and reset default items
  const handleResetSimulatorData = () => {
    if (confirm("Are you sure you want to reset the simulator? This will restore the default list of documents.")) {
      const initial = getInitialDocuments();
      saveDocumentsToCache(initial);
      setSimulatedNotification({
        title: "State Refreshed",
        body: "Mock database restored successfully to standard verification assets.",
        icon: "⚡"
      });
    }
  };

  // Calculations for stats
  const stats = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let redAlertsCount = 0;
    let yellowAlertsCount = 0;
    let greenAlertsCount = 0;
    let activeAlertTriggersCount = 0;

    documents.forEach(d => {
      const expiry = new Date(d.expiryDate);
      expiry.setHours(0, 0, 0, 0);
      const diffTime = expiry.getTime() - today.getTime();
      const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (days <= 7) {
        redAlertsCount++;
      } else if (days <= 30) {
        yellowAlertsCount++;
      } else {
        greenAlertsCount++;
      }

      if (d.alertActive) {
        // Calculate how many of the 30d, 15d, 1d alerts are still in the future
        const expiryTime = expiry.getTime();
        const nowTime = today.getTime();
        [30, 15, 1].forEach(offsetDays => {
          const triggerTime = expiryTime - (offsetDays * 24 * 60 * 60 * 1000);
          if (triggerTime > nowTime) {
            activeAlertTriggersCount++;
          }
        });
      }
    });

    // Capping at 64 for iOS compliance
    const iosNotificationCount = Math.min(activeAlertTriggersCount, 64);

    return {
      total: documents.length,
      red: redAlertsCount,
      yellow: yellowAlertsCount,
      green: greenAlertsCount,
      triggers: activeAlertTriggersCount,
      iosQueue: iosNotificationCount
    };
  }, [documents]);

  // Filter and Search logic
  const filteredDocuments = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return documents.filter(d => {
      // 1. Search Query
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch = !query || 
        d.title.toLowerCase().includes(query) || 
        (d.referenceNo && d.referenceNo.toLowerCase().includes(query)) ||
        (d.notes && d.notes.toLowerCase().includes(query));

      // 2. Category Filter
      const matchesCategory = selectedCategory === 'ALL' || d.category === selectedCategory;

      // 3. Urgency Filter
      const expiry = new Date(d.expiryDate);
      expiry.setHours(0, 0, 0, 0);
      const diffTime = expiry.getTime() - today.getTime();
      const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      let matchesUrgency = true;
      if (selectedUrgency !== 'ALL') {
        if (selectedUrgency === 'RED') {
          matchesUrgency = days <= 7;
        } else if (selectedUrgency === 'YELLOW') {
          matchesUrgency = days >= 8 && days <= 30;
        } else if (selectedUrgency === 'GREEN') {
          matchesUrgency = days > 30;
        } else if (selectedUrgency === 'OVERDUE') {
          matchesUrgency = days < 0;
        }
      }

      return matchesSearch && matchesCategory && matchesUrgency;
    });
  }, [documents, searchQuery, selectedCategory, selectedUrgency]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#1E293B] flex flex-col font-sans selection:bg-blue-500/25 selection:text-blue-900">
      
      {/* Upper Navigation bar with status - Geometric Balance styling */}
      <header className="h-[80px] bg-white border-b border-[#E2E8F0] sticky top-0 z-30">
        <div className="max-w-7xl mx-auto h-full px-4 sm:px-10 flex items-center justify-between">
          
          {/* Logo brand */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-[#2563EB] rounded-[8px] flex items-center justify-center text-white font-black text-[20px]">
              V
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-[22px] font-bold tracking-[-0.5px] text-[#1E293B]">LifeVault</h1>
                <span className="hidden sm:inline-block bg-blue-50 border border-blue-200 text-[#2563EB] text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">Mobile Hub</span>
              </div>
              <p className="hidden md:block text-[11px] text-[#64748B] font-medium leading-none mt-0.5">Personal Document Expiry & Smart Alert Companion</p>
            </div>
          </div>

          {/* Nav meta - sync badge and avatar */}
          <div className="flex items-center gap-6">
            
            {/* Toggle buttons between app simulation and file templates */}
            <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
              <button
                onClick={() => setActiveTab('SIMULATOR')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'SIMULATOR'
                    ? 'bg-white text-[#1E293B] shadow-xs'
                    : 'text-[#64748B] hover:text-[#1E293B]'
                }`}
              >
                <Smartphone size={13} />
                <span className="hidden sm:inline">Companion</span>
                <span className="sm:hidden">App</span>
              </button>
              <button
                onClick={() => setActiveTab('BLUEPRINTS')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'BLUEPRINTS'
                    ? 'bg-white text-[#1E293B] shadow-xs'
                    : 'text-[#64748B] hover:text-[#1E293B]'
                }`}
              >
                <Code size={13} />
                <span className="hidden sm:inline">Expo Blueprints</span>
                <span className="sm:hidden">Specs</span>
              </button>
            </div>

            <div className="hidden sm:flex items-center gap-4">
              <div className="sync-badge">
                <span className="w-2 h-2 bg-[#10B981] rounded-full inline-block"></span>
                <span>Cloud Synced</span>
              </div>
              <div className="w-10 h-10 bg-[#E2E8F0] rounded-full flex items-center justify-center font-bold text-xs text-[#64748B]" title="kishor10d@gmail.com">
                KV
              </div>
            </div>

          </div>

        </div>
      </header>

      {/* Stats Bar - Geometric Balance styling */}
      <div className="bg-white border-b border-[#E2E8F0] py-5 px-4 sm:px-10">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center gap-10">
          <div className="flex flex-col">
            <span className="text-[12px] text-[#64748B] font-medium">Active Docs</span>
            <span className="text-[24px] font-bold text-[#1E293B]">{stats.total}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[12px] text-[#64748B] font-medium">Critical ( &lt; 7d )</span>
            <span className="text-[24px] font-bold text-[#DC2626]">{stats.red}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[12px] text-[#64748B] font-medium">Warning ( &lt; 30d )</span>
            <span className="text-[24px] font-bold text-[#D97706]">{stats.yellow}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[12px] text-[#64748B] font-medium">Scheduled Alerts</span>
            <span className="text-[24px] font-bold text-[#16A34A]">{stats.triggers}</span>
          </div>
          <div className="flex flex-col ml-auto">
            <span className="text-[12px] text-[#64748B] font-medium text-right">iOS Queue</span>
            <span className="text-xs font-mono font-bold bg-[#F1F5F9] text-[#64748B] px-2 py-0.5 rounded-md">
              {stats.iosQueue} / 64 LIMIT
            </span>
          </div>
        </div>
      </div>

      {/* Main Container Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-10 py-8">

        {activeTab === 'SIMULATOR' ? (
          <div className="space-y-6">

            {/* Simulated Live Action Notification Banner */}
            <div className="bg-[#FFFBEB] border border-[#FEF3C7] rounded-[16px] p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
              <div className="flex items-start gap-3.5">
                <div className="p-2.5 bg-[#D97706]/10 text-[#D97706] rounded-[8px] shrink-0 mt-0.5 sm:mt-0">
                  <Sparkles size={16} />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-[#1E293B] leading-none">Simulating Native Offline Caching & Sync Triggers</h4>
                  <p className="text-xs text-[#64748B] mt-1.5 leading-relaxed">
                    This interactive UI operates on an <b>offline-first state engine</b>. Changes persist automatically in browser storage, mimicking Firestore local cache. Tap edit or add a document to simulate real Expo alerts.
                  </p>
                </div>
              </div>
              <button
                onClick={handleAddTrigger}
                className="shrink-0 flex items-center gap-2 px-4 py-2.5 bg-[#2563EB] hover:bg-blue-700 text-white rounded-[8px] text-xs font-bold shadow-[0_4px_6px_-1px_rgba(37,99,235,0.2)] hover:shadow-md transition-all self-stretch sm:self-auto justify-center"
              >
                <PlusCircle size={14} />
                <span>Track Document</span>
              </button>
            </div>

            {/* Filter controls and items grid */}
            <div className="space-y-6">
              
              {/* Search & Category filter header bar */}
              <div className="bg-white p-5 rounded-[16px] border border-[#E2E8F0] shadow-[0_4px_6px_-1px_rgba(0,0,0,0.02)] flex flex-col md:flex-row gap-4">
                
                {/* Search bar */}
                <div className="relative flex-1">
                  <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
                  <input
                    type="text"
                    placeholder="Search documents by name, reference ID, notes..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-11 pr-4 py-2.5 border border-[#E2E8F0] rounded-[10px] text-sm text-[#1E293B] placeholder-[#94A3B8] focus:outline-hidden focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB] transition-all bg-[#F8FAFC]/50"
                  />
                </div>

                {/* Filters Row */}
                <div className="flex flex-wrap items-center gap-3">
                  
                  {/* Category Selector */}
                  <div className="flex items-center gap-1 bg-[#F1F5F9] p-1 rounded-[8px] border border-[#E2E8F0]/30">
                    <span className="p-1 text-[#64748B]" title="Category Filter">
                      <Filter size={12} />
                    </span>
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="bg-transparent border-none text-[12px] font-bold text-[#64748B] focus:outline-hidden pr-6 py-1 cursor-pointer"
                    >
                      <option value="ALL">All Categories</option>
                      <option value="VEHICLE">🚗 Vehicle</option>
                      <option value="PERSONAL">🆔 Personal</option>
                      <option value="MEDICAL">🏥 Medical</option>
                      <option value="FINANCE">💼 Finance</option>
                    </select>
                  </div>

                  {/* Urgency/Expiry Selector */}
                  <div className="flex items-center gap-1 bg-[#F1F5F9] p-1 rounded-[8px] border border-[#E2E8F0]/30">
                    <span className="p-1 text-[#64748B]" title="Urgency Filter">
                      <Clock size={12} />
                    </span>
                    <select
                      value={selectedUrgency}
                      onChange={(e) => setSelectedUrgency(e.target.value)}
                      className="bg-transparent border-none text-[12px] font-bold text-[#64748B] focus:outline-hidden pr-6 py-1 cursor-pointer"
                    >
                      <option value="ALL">All Alerts</option>
                      <option value="RED">🚨 Urgent (&lt;7d)</option>
                      <option value="YELLOW">⚠️ Warning (8-30d)</option>
                      <option value="GREEN">🟢 Safe (31d+)</option>
                      <option value="OVERDUE">⛔ Overdue</option>
                    </select>
                  </div>

                </div>

              </div>

              {/* TWO CARD PER ROW MOBILE GRID INTERFACE */}
              {/* This class enforces grid-cols-2 on small devices exactly as requested, scaling up cleanly on large screens */}
              {filteredDocuments.length > 0 ? (
                <div className="grid grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-6">
                  {filteredDocuments.map(doc => (
                    <DocCard
                      key={doc.id}
                      doc={doc}
                      onEdit={handleEditTrigger}
                      onDelete={handleDeleteDocument}
                    />
                  ))}
                </div>
              ) : (
                <div className="bg-white border border-[#E2E8F0] rounded-[16px] p-12 text-center max-w-md mx-auto shadow-xs">
                  <div className="p-4 bg-slate-50 text-slate-400 rounded-full w-fit mx-auto mb-4">
                    <Search size={28} />
                  </div>
                  <h3 className="font-bold text-[#1E293B] text-base">No tracked documents match filter</h3>
                  <p className="text-xs text-[#64748B] mt-2 leading-relaxed">
                    Try adjusting your search query, selecting "All Categories", or register a brand-new custom document to begin monitoring.
                  </p>
                  <button
                    onClick={handleAddTrigger}
                    className="mt-5 px-4 py-2 bg-[#2563EB] hover:bg-blue-700 text-white text-xs font-bold rounded-[8px] inline-flex items-center gap-1.5 shadow-xs transition-all"
                  >
                    <PlusCircle size={14} />
                    <span>Track New Document</span>
                  </button>
                </div>
              )}

            </div>

          </div>
        ) : (
          <div className="space-y-6">
            
            {/* Developer blueprint explanation tab banner */}
            <div className="bg-white p-5 rounded-[16px] border border-[#E2E8F0] shadow-xs">
              <div className="flex items-start gap-3.5">
                <div className="p-2.5 bg-blue-50 text-[#2563EB] rounded-xl shrink-0">
                  <Code size={18} />
                </div>
                <div>
                  <h3 className="font-bold text-base text-[#1E293B] leading-none">Standalone React Native Expo Code Templates</h3>
                  <p className="text-xs text-[#64748B] mt-1.5 leading-relaxed">
                    Below is the fully functional, production-ready source code specification for your <b>"LifeVault" Expo</b> mobile app. 
                    These blueprints are 100% complete with no empty "todo" blocks. Copy these templates directly into your Expo project workspace.
                  </p>
                </div>
              </div>
            </div>

            {/* Blueprint code codeblock browser */}
            <BlueprintViewer />

          </div>
        )}

      </main>

      {/* Footer copyright */}
      <footer className="bg-white border-t border-[#E2E8F0] mt-12 py-6 text-center text-[#64748B] text-xs font-medium">
        <div className="max-w-7xl mx-auto px-10 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-[#10B981] rounded-full inline-block"></span>
            <span>LifeVault — Standalone Personal Security Vault</span>
          </div>
          <div>
            <span>Developed for multi-device cross-platform synchronization (Android & iOS)</span>
          </div>
        </div>
      </footer>

      {/* Interactive Form Dialog */}
      <DocFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveDocument}
        editDoc={editDoc}
      />

    </div>
  );
}

// Inline custom mini icon addition to helper inside forms
function PlusCircle({ size }: { size: number }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2.5" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className="shrink-0"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M12 8v8M8 12h8" />
    </svg>
  );
}
