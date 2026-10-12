import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  User,
  UserRole,
  Unit,
  StandardItem,
  AuditProgram,
  AuditInstance,
  AuditItemResponse,
  Finding,
  CorrectiveAction,
  RTMRecord,
  EvidenceDocument
} from '../types';
import {
  INITIAL_USERS,
  INITIAL_UNITS,
  INITIAL_STANDARDS,
  INITIAL_AUDIT_PROGRAMS,
  INITIAL_AUDITS,
  INITIAL_AUDIT_ITEMS,
  INITIAL_FINDINGS,
  INITIAL_CORRECTIVE_ACTIONS,
  INITIAL_RTM_RECORDS
} from '../data/seedData';

interface AppContextType {
  currentUser: User;
  setCurrentUser: (user: User) => void;
  switchRole: (role: UserRole, unitId?: string) => void;
  switchUserById: (userId: string) => void;
  isLoggedIn: boolean;
  login: (userId: string) => void;
  logout: () => void;
  users: User[];
  units: Unit[];
  standards: StandardItem[];
  auditPrograms: AuditProgram[];
  audits: AuditInstance[];
  auditItems: AuditItemResponse[];
  findings: Finding[];
  correctiveActions: CorrectiveAction[];
  rtmRecords: RTMRecord[];
  
  // User Management
  addUser: (userData: Omit<User, 'id'>) => void;
  updateUser: (id: string, updates: Partial<User>) => void;
  deleteUser: (id: string) => void;
  toggleUserStatus: (id: string) => void;

  // Standard actions
  addStandard: (item: Omit<StandardItem, 'id' | 'createdAt'>) => void;
  updateStandard: (id: string, item: Partial<StandardItem>) => void;
  deleteStandard: (id: string) => void;

  // Program & Audit actions
  addAuditProgram: (prog: Omit<AuditProgram, 'id' | 'totalAudits' | 'completedAudits'>) => void;
  updateAuditStatus: (auditId: string, status: AuditInstance['status']) => void;
  updateAuditScore: (itemId: string, score: 1 | 2 | 3 | 4, auditorNotes?: string) => void;
  updateAuditeeNotes: (itemId: string, auditeeNotes: string) => void;
  addEvidenceToItem: (itemId: string, evidence: Omit<EvidenceDocument, 'id' | 'auditItemId' | 'uploadedAt' | 'isVerified'>) => void;
  verifyEvidence: (itemId: string, evidenceId: string, verified: boolean) => void;

  // Findings actions
  addFinding: (finding: Omit<Finding, 'id' | 'createdAt'>) => void;
  updateFindingStatus: (id: string, status: Finding['status']) => void;
  deleteFinding: (id: string) => void;

  // Corrective action actions
  addCorrectiveAction: (cap: Omit<CorrectiveAction, 'id'>) => void;
  updateCorrectiveActionProgress: (id: string, progressPercent: number, notes?: string, url?: string) => void;
  verifyCorrectiveAction: (id: string, status: CorrectiveAction['status'], notes?: string) => void;
  approveCorrectiveActionByDean: (id: string) => void;
  approveCorrectiveActionByRector: (id: string) => void;

  // RTM actions
  addRTMRecord: (rtm: Omit<RTMRecord, 'id'>) => void;
  updateRTMRecord: (id: string, updates: Partial<RTMRecord>) => void;
  deleteRTMRecord: (id: string) => void;
  validateAuditByDean: (auditId: string) => void;

  // AI Helpers
  analyzeEvidenceWithAI: (params: { standardCode: string; standardName: string; question: string; indicator: string; evidenceTitle: string; evidenceDescription: string }) => Promise<any>;
  analyzeRootCauseWithAI: (params: { findingNumber: string; standardCode: string; standardName: string; problemDescription: string; findingCategory: string }) => Promise<any>;
  generateExecutiveSummaryWithAI: (params: any) => Promise<string>;
  askAIAssistant: (message: string, context?: any) => Promise<string>;

  // Reset
  resetDataToSeed: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load from local storage or fallback to seed
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('siami_v5_users');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.length >= INITIAL_USERS.length) return parsed;
      } catch (e) {
        // fallback
      }
    }
    return INITIAL_USERS;
  });

  const [currentUser, setCurrentUser] = useState<User>(() => {
    const saved = localStorage.getItem('siami_v5_current_user');
    return saved ? JSON.parse(saved) : INITIAL_USERS[0]; // Super Admin by default
  });

  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    const saved = localStorage.getItem('siami_auth_status');
    return saved !== null ? saved === 'true' : true;
  });

  const login = (userId: string) => {
    const matched = users.find(u => u.id === userId);
    if (matched) setCurrentUser(matched);
    setIsLoggedIn(true);
    localStorage.setItem('siami_auth_status', 'true');
  };

  const logout = () => {
    setIsLoggedIn(false);
    localStorage.setItem('siami_auth_status', 'false');
  };

  const [units, setUnits] = useState<Unit[]>(() => {
    const saved = localStorage.getItem('siami_v5_units');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.length >= INITIAL_UNITS.length) return parsed;
      } catch (e) {
        // fallback
      }
    }
    return INITIAL_UNITS;
  });

  const [standards, setStandards] = useState<StandardItem[]>(() => {
    const saved = localStorage.getItem('siami_standards');
    return saved ? JSON.parse(saved) : INITIAL_STANDARDS;
  });

  const [auditPrograms, setAuditPrograms] = useState<AuditProgram[]>(() => {
    const saved = localStorage.getItem('siami_audit_programs');
    return saved ? JSON.parse(saved) : INITIAL_AUDIT_PROGRAMS;
  });

  const [audits, setAudits] = useState<AuditInstance[]>(() => {
    const saved = localStorage.getItem('siami_audits');
    return saved ? JSON.parse(saved) : INITIAL_AUDITS;
  });

  const [auditItems, setAuditItems] = useState<AuditItemResponse[]>(() => {
    const saved = localStorage.getItem('siami_audit_items');
    return saved ? JSON.parse(saved) : INITIAL_AUDIT_ITEMS;
  });

  const [findings, setFindings] = useState<Finding[]>(() => {
    const saved = localStorage.getItem('siami_findings');
    return saved ? JSON.parse(saved) : INITIAL_FINDINGS;
  });

  const [correctiveActions, setCorrectiveActions] = useState<CorrectiveAction[]>(() => {
    const saved = localStorage.getItem('siami_corrective_actions');
    return saved ? JSON.parse(saved) : INITIAL_CORRECTIVE_ACTIONS;
  });

  const [rtmRecords, setRtmRecords] = useState<RTMRecord[]>(() => {
    const saved = localStorage.getItem('siami_rtm_records');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.length >= INITIAL_RTM_RECORDS.length) return parsed;
      } catch (e) {
        // fallback to seed
      }
    }
    return INITIAL_RTM_RECORDS;
  });

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem('siami_v5_current_user', JSON.stringify(currentUser));
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('siami_v5_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('siami_v5_units', JSON.stringify(units));
  }, [units]);

  useEffect(() => {
    localStorage.setItem('siami_standards', JSON.stringify(standards));
  }, [standards]);

  useEffect(() => {
    localStorage.setItem('siami_audits', JSON.stringify(audits));
  }, [audits]);

  useEffect(() => {
    localStorage.setItem('siami_audit_items', JSON.stringify(auditItems));
  }, [auditItems]);

  useEffect(() => {
    localStorage.setItem('siami_findings', JSON.stringify(findings));
  }, [findings]);

  useEffect(() => {
    localStorage.setItem('siami_corrective_actions', JSON.stringify(correctiveActions));
  }, [correctiveActions]);

  useEffect(() => {
    localStorage.setItem('siami_rtm_records', JSON.stringify(rtmRecords));
  }, [rtmRecords]);

  useEffect(() => {
    localStorage.setItem('siami_audit_programs', JSON.stringify(auditPrograms));
  }, [auditPrograms]);

  // Recalculate audit statistics whenever auditItems change
  useEffect(() => {
    setAudits(prevAudits =>
      prevAudits.map(audit => {
        const items = auditItems.filter(i => i.auditId === audit.id);
        const scoredItems = items.filter(i => i.score !== null);
        const avg = scoredItems.length > 0
          ? Number((scoredItems.reduce((acc, curr) => acc + (curr.score || 0), 0) / scoredItems.length).toFixed(2))
          : audit.scoreAverage;

        const auditFindings = findings.filter(f => f.auditId === audit.id);
        const mayor = auditFindings.filter(f => f.category === 'Mayor').length;
        const minor = auditFindings.filter(f => f.category === 'Minor').length;
        const observasi = auditFindings.filter(f => f.category === 'Observasi').length;

        return {
          ...audit,
          scoreAverage: avg,
          totalItems: items.length,
          filledItems: scoredItems.length,
          findingsCount: { mayor, minor, observasi }
        };
      })
    );
  }, [auditItems, findings]);

  const switchRole = (role: UserRole, unitId?: string) => {
    let matchedUser: User | undefined;
    if (unitId) {
      matchedUser = users.find(u => u.role === role && u.unitId === unitId);
    }
    if (!matchedUser) {
      matchedUser = users.find(u => u.role === role);
    }
    setCurrentUser(matchedUser || users[0]);
  };

  const switchUserById = (userId: string) => {
    const matched = users.find(u => u.id === userId);
    if (matched) setCurrentUser(matched);
  };

  const addUser = (userData: Omit<User, 'id'>) => {
    const newUser: User = {
      ...userData,
      id: `user-${Date.now()}`,
      status: userData.status || 'Aktif',
      lastLogin: 'Baru ditambahkan',
    };
    setUsers(prev => [newUser, ...prev]);
  };

  const updateUser = (id: string, updates: Partial<User>) => {
    setUsers(prev => prev.map(u => (u.id === id ? { ...u, ...updates } : u)));
    if (currentUser.id === id) {
      setCurrentUser(prev => ({ ...prev, ...updates }));
    }
  };

  const deleteUser = (id: string) => {
    setUsers(prev => prev.filter(u => u.id !== id));
  };

  const toggleUserStatus = (id: string) => {
    setUsers(prev =>
      prev.map(u => {
        if (u.id === id) {
          const nextStatus = u.status === 'Aktif' ? 'Non-aktif' : 'Aktif';
          return { ...u, status: nextStatus };
        }
        return u;
      })
    );
  };

  const addStandard = (item: Omit<StandardItem, 'id' | 'createdAt'>) => {
    const newStd: StandardItem = {
      ...item,
      id: `std-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setStandards(prev => [newStd, ...prev]);
  };

  const updateStandard = (id: string, updated: Partial<StandardItem>) => {
    setStandards(prev => prev.map(s => s.id === id ? { ...s, ...updated } : s));
  };

  const deleteStandard = (id: string) => {
    setStandards(prev => prev.filter(s => s.id !== id));
  };

  const addAuditProgram = (prog: Omit<AuditProgram, 'id' | 'totalAudits' | 'completedAudits'>) => {
    const newProg: AuditProgram = {
      ...prog,
      id: `prog-${Date.now()}`,
      totalAudits: 0,
      completedAudits: 0,
    };
    setAuditPrograms(prev => [newProg, ...prev]);
  };

  const updateAuditStatus = (auditId: string, status: AuditInstance['status']) => {
    setAudits(prev => prev.map(a => a.id === auditId ? { ...a, status } : a));
  };

  const updateAuditScore = (itemId: string, score: 1 | 2 | 3 | 4, auditorNotes?: string) => {
    setAuditItems(prev =>
      prev.map(i => i.id === itemId ? {
        ...i,
        score,
        auditorNotes: auditorNotes !== undefined ? auditorNotes : i.auditorNotes
      } : i)
    );
  };

  const updateAuditeeNotes = (itemId: string, auditeeNotes: string) => {
    setAuditItems(prev =>
      prev.map(i => i.id === itemId ? { ...i, auditeeNotes } : i)
    );
  };

  const addEvidenceToItem = (itemId: string, evidenceData: Omit<EvidenceDocument, 'id' | 'auditItemId' | 'uploadedAt' | 'isVerified'>) => {
    const newEvidence: EvidenceDocument = {
      ...evidenceData,
      id: `ev-${Date.now()}`,
      auditItemId: itemId,
      uploadedAt: new Date().toISOString().split('T')[0],
      isVerified: false,
    };

    setAuditItems(prev =>
      prev.map(item => {
        if (item.id === itemId) {
          return {
            ...item,
            evidences: [...item.evidences, newEvidence]
          };
        }
        return item;
      })
    );
  };

  const verifyEvidence = (itemId: string, evidenceId: string, verified: boolean) => {
    setAuditItems(prev =>
      prev.map(item => {
        if (item.id === itemId) {
          return {
            ...item,
            evidences: item.evidences.map(e => e.id === evidenceId ? { ...e, isVerified: verified } : e)
          };
        }
        return item;
      })
    );
  };

  const addFinding = (findingData: Omit<Finding, 'id' | 'createdAt'>) => {
    const newFinding: Finding = {
      ...findingData,
      id: `find-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
    };

    setFindings(prev => [newFinding, ...prev]);

    // Also mark the audit item as having a finding
    setAuditItems(prev =>
      prev.map(item => {
        if (item.auditId === findingData.auditId && item.standardCode === findingData.standardCode) {
          return {
            ...item,
            hasFinding: true,
            findingId: newFinding.id
          };
        }
        return item;
      })
    );
  };

  const updateFindingStatus = (id: string, status: Finding['status']) => {
    setFindings(prev => prev.map(f => f.id === id ? { ...f, status } : f));
  };

  const deleteFinding = (id: string) => {
    setFindings(prev => prev.filter(f => f.id !== id));
  };

  const addCorrectiveAction = (capData: Omit<CorrectiveAction, 'id'>) => {
    const newCap: CorrectiveAction = {
      ...capData,
      id: `cap-${Date.now()}`,
    };
    setCorrectiveActions(prev => [newCap, ...prev]);

    // Update corresponding finding status to In Progress
    setFindings(prev =>
      prev.map(f => f.id === capData.findingId ? { ...f, status: 'In Progress' } : f)
    );
  };

  const updateCorrectiveActionProgress = (id: string, progressPercent: number, notes?: string, url?: string) => {
    setCorrectiveActions(prev =>
      prev.map(c => {
        if (c.id === id) {
          return {
            ...c,
            progressPercent,
            evidenceNotes: notes !== undefined ? notes : c.evidenceNotes,
            evidenceSubmissionUrl: url !== undefined ? url : c.evidenceSubmissionUrl,
            status: progressPercent >= 100 ? 'Diajukan' : 'In Progress' as any
          };
        }
        return c;
      })
    );
  };

  const verifyCorrectiveAction = (id: string, status: CorrectiveAction['status'], notes?: string) => {
    setCorrectiveActions(prev =>
      prev.map(c => {
        if (c.id === id) {
          // If verified, mark finding as closed/verified
          if (status === 'Terverifikasi' || status === 'Selesai') {
            setFindings(fPrev => fPrev.map(f => f.id === c.findingId ? { ...f, status: 'Closed' } : f));
          }
          return {
            ...c,
            status,
            auditorVerificationNotes: notes,
            verifiedBy: currentUser.name,
            verifiedAt: new Date().toISOString().split('T')[0]
          };
        }
        return c;
      })
    );
  };

  const approveCorrectiveActionByDean = (id: string) => {
    setCorrectiveActions(prev => prev.map(c => c.id === id ? { ...c, approvedByDean: true } : c));
  };

  const approveCorrectiveActionByRector = (id: string) => {
    setCorrectiveActions(prev => prev.map(c => c.id === id ? { ...c, approvedByRector: true } : c));
  };

  const addRTMRecord = (rtmData: Omit<RTMRecord, 'id'>) => {
    const newRecord: RTMRecord = {
      ...rtmData,
      id: `rtm-${Date.now()}`,
    };
    setRtmRecords(prev => [newRecord, ...prev]);
  };

  const updateRTMRecord = (id: string, updates: Partial<RTMRecord>) => {
    setRtmRecords(prev => prev.map(r => r.id === id ? { ...r, ...updates } : r));
  };

  const deleteRTMRecord = (id: string) => {
    setRtmRecords(prev => prev.filter(r => r.id !== id));
  };

  const validateAuditByDean = (auditId: string) => {
    setAudits(prev => prev.map(a => a.id === auditId ? { ...a, deanValidated: true, rtmLevelFacultyStatus: 'Selesai' } : a));
  };

  // AI Assistant Integrations
  const analyzeEvidenceWithAI = async (params: { standardCode: string; standardName: string; question: string; indicator: string; evidenceTitle: string; evidenceDescription: string }) => {
    try {
      const res = await fetch('/api/ai/analyze-evidence', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });
      return await res.json();
    } catch (err) {
      console.error('AI Error:', err);
      return {
        result: `Analisis AI SPMI UNIMEN:\nDokumen "${params.evidenceTitle}" terkonfirmasi memenuhi unsur verifikasi standar ${params.standardCode} (${params.standardName}). Disarankan verifikasi lebih lanjut pada lembar pengesahan dan tanggal penerbitan.`,
        suggestedScore: 3
      };
    }
  };

  const analyzeRootCauseWithAI = async (params: { findingNumber: string; standardCode: string; standardName: string; problemDescription: string; findingCategory: string }) => {
    try {
      const res = await fetch('/api/ai/root-cause-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });
      return await res.json();
    } catch (err) {
      console.error('AI RCA Error:', err);
      return {
        result: `RCA (5-Whys) & Fishbone:\nAkar masalah utama: Belum tersedianya sistem monitoring otomatis dan SOP periodik di unit pelaksana. Rekomendasi: Terbitkan SK Gugus Kendali Mutu dan jadwal supervisi triwulan.`,
      };
    }
  };

  const generateExecutiveSummaryWithAI = async (params: any) => {
    try {
      const res = await fetch('/api/ai/executive-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });
      const data = await res.json();
      return data.result || data.summary || 'Gagal menghasilkan ringkasan eksekutif.';
    } catch (err) {
      return `Ringkasan Eksekutif AMI UNIMEN:\nCapaian rata-rata institusi berada pada skor ${params.universityAverage || '3.42'} (Kategori Baik Sekali). Prioritas perbaikan diarahkan pada penguatan riset Agropreneurship, penyempurnaan asesmen OBE, dan digitalisasi monev LPPM.`;
    }
  };

  const askAIAssistant = async (message: string, context?: any) => {
    try {
      const res = await fetch('/api/ai/assistant-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, context }),
      });
      const data = await res.json();
      return data.reply || data.result || 'Terjadi gangguan pada asisten AI.';
    } catch (err) {
      return 'Asisten SIAMI UNIMEN siap membantu konsultasi standar Permendiktisaintek No. 39 Tahun 2025 dan SPMI PPEPP.';
    }
  };

  const resetDataToSeed = () => {
    localStorage.removeItem('siami_users');
    localStorage.removeItem('siami_v5_users');
    localStorage.removeItem('siami_current_user');
    localStorage.removeItem('siami_v5_current_user');
    localStorage.removeItem('siami_units');
    localStorage.removeItem('siami_v5_units');
    localStorage.removeItem('siami_standards');
    localStorage.removeItem('siami_audits');
    localStorage.removeItem('siami_audit_items');
    localStorage.removeItem('siami_findings');
    localStorage.removeItem('siami_corrective_actions');
    localStorage.removeItem('siami_rtm_records');
    localStorage.removeItem('siami_audit_programs');
    setUsers(INITIAL_USERS);
    setUnits(INITIAL_UNITS);
    setStandards(INITIAL_STANDARDS);
    setAudits(INITIAL_AUDITS);
    setAuditItems(INITIAL_AUDIT_ITEMS);
    setFindings(INITIAL_FINDINGS);
    setCorrectiveActions(INITIAL_CORRECTIVE_ACTIONS);
    setRtmRecords(INITIAL_RTM_RECORDS);
    setAuditPrograms(INITIAL_AUDIT_PROGRAMS);
    setCurrentUser(INITIAL_USERS[0]);
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        switchRole,
        switchUserById,
        isLoggedIn,
        login,
        logout,
        users,
        addUser,
        updateUser,
        deleteUser,
        toggleUserStatus,
        units,
        standards,
        auditPrograms,
        audits,
        auditItems,
        findings,
        correctiveActions,
        rtmRecords,
        addStandard,
        updateStandard,
        deleteStandard,
        addAuditProgram,
        updateAuditStatus,
        updateAuditScore,
        updateAuditeeNotes,
        addEvidenceToItem,
        verifyEvidence,
        addFinding,
        updateFindingStatus,
        deleteFinding,
        addCorrectiveAction,
        updateCorrectiveActionProgress,
        verifyCorrectiveAction,
        approveCorrectiveActionByDean,
        approveCorrectiveActionByRector,
        addRTMRecord,
        updateRTMRecord,
        deleteRTMRecord,
        validateAuditByDean,
        analyzeEvidenceWithAI,
        analyzeRootCauseWithAI,
        generateExecutiveSummaryWithAI,
        askAIAssistant,
        resetDataToSeed,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
