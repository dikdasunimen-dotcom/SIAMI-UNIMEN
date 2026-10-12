export type FacultyRole =
  | 'Dekan Fakultas Agama Islam'
  | 'Dekan Fakultas Ilmu Pendidikan'
  | 'Dekan Fakultas Sains, Teknologi dan Kesehatan'
  | 'Direktur Program Pascasarjana';

export type UserRole =
  | 'Super Admin'
  | 'Rektor'
  | 'LPM'
  | 'Auditor Internal'
  | 'Dekan'
  | 'Direktur Pascasarjana'
  | FacultyRole
  | 'Ketua Program Studi'
  | 'LPPM'
  | 'L2AIK'
  | 'Admin Fakultas'
  | 'Dosen'
  | 'Ketua GKM Fakultas'
  | 'Ketua UJM Prodi';

export interface FacultyRoleDefinition {
  role: UserRole;
  facultyId: string;
  facultyName: string;
  facultyCode: string;
  headName: string;
  headNidn: string;
  email: string;
  description: string;
  prodiNames: string[];
  prodiCodes: string[];
  canValidateProdi: boolean;
  canConductFacultyRTM: boolean;
  canViewFacultyReport: boolean;
  canManageFacultyStandards: boolean;
}

export function isFacultyLeaderRole(role: UserRole): boolean {
  return (
    role === 'Dekan' ||
    role === 'Direktur Pascasarjana' ||
    role === 'Dekan Fakultas Agama Islam' ||
    role === 'Dekan Fakultas Ilmu Pendidikan' ||
    role === 'Dekan Fakultas Sains, Teknologi dan Kesehatan' ||
    role === 'Direktur Program Pascasarjana'
  );
}

export type PPEPPStage = 'Penetapan' | 'Pelaksanaan' | 'Evaluasi' | 'Pengendalian' | 'Peningkatan';

export type StandardCategory =
  | 'STANDAR PENDIDIKAN'
  | 'STANDAR PENELITIAN'
  | 'STANDAR PENGABDIAN'
  | 'STANDAR AIK DAN KEKHASAN';

export type FindingCategory = 'Observasi' | 'Minor' | 'Mayor';

export type FindingStatus = 'Open' | 'In Progress' | 'Verified' | 'Closed';

export type AuditStatus = 'Draft' | 'Terjadwal' | 'Pelaksanaan' | 'Review' | 'Selesai' | 'RTM';

export interface User {
  id: string;
  name: string; // Nama & Gelar Lengkap
  title?: string;
  nipOrNidn: string;
  nidn?: string;
  email: string;
  role: UserRole;
  unitId: string;
  unitName: string; // Unit Kerja
  avatar?: string; // Foto Profil (URL atau Data URL)
  photoUrl?: string;
  phone?: string;
  whatsapp?: string; // No. WhatsApp
  specialty?: string;
  facultyId?: string;
  jabatanStruktural?: string;
  status?: 'Aktif' | 'Non-aktif' | 'Cuti';
  academicTitle?: string;
  canUploadEvidence?: boolean;
  canValidateProdi?: boolean;
  canViewFacultyReport?: boolean;
  isFacultyAuditor?: boolean;
  lastLogin?: string;
}

export interface Unit {
  id: string;
  code: string;
  name: string;
  type: 'Universitas' | 'Fakultas' | 'Program Pascasarjana' | 'Program Studi' | 'Lembaga' | 'Biro' | 'Pusat';
  parentUnitId?: string;
  facultyId?: string;
  headName: string;
  headNidn?: string;
  qualityScore: number; // 1.00 - 4.00
  targetScore: number;
  totalFindings: number;
  resolvedFindings: number;
}

export interface StandardIndicator {
  id: string;
  code: string;
  name: string;
  description: string;
  target: string;
  mandatoryEvidence: string;
  ppeppCycle: PPEPPStage;
}

export interface StandardItem {
  id: string;
  code: string; // e.g. STD-PEND-001
  category: StandardCategory;
  groupName: string; // e.g. Standar Kompetensi Lulusan, Standar Luaran Penelitian, Standar Pendidikan AIK
  title: string;
  description: string;
  legalBasis: string; // Permendiktisaintek No. 39 Tahun 2025 / SN Dikti / Statuta UNIMEN
  picUnit: string; // LPM / LPPM / L2AIK / Prodi
  indicators: StandardIndicator[];
  weight: number;
  createdAt: string;
}

export interface AuditProgram {
  id: string;
  code: string;
  name: string;
  academicYear: string;
  semester: 'Ganjil' | 'Genap';
  startDate: string;
  endDate: string;
  leadLpmId: string;
  status: AuditStatus;
  description: string;
  totalAudits: number;
  completedAudits: number;
}

export interface EvidenceDocument {
  id: string;
  auditItemId: string;
  title: string;
  fileType: string;
  fileUrl: string;
  fileSize: string;
  uploadedBy: string;
  uploadedAt: string;
  notes?: string;
  isVerified: boolean;
  aiVerifiedSummary?: string;
}

export interface AuditItemResponse {
  id: string;
  auditId: string;
  standardItemId: string;
  standardCode: string;
  standardGroup: string;
  question: string;
  indicator: string;
  mandatoryEvidence: string;
  target: string;
  weight: number;
  score: 1 | 2 | 3 | 4 | null; // 4 = Melampaui, 3 = Memenuhi, 2 = Sebagian, 1 = Tidak memenuhi
  auditeeNotes?: string;
  auditorNotes?: string;
  evidences: EvidenceDocument[];
  hasFinding: boolean;
  findingId?: string;
  ppeppStage: PPEPPStage;
}

export interface Finding {
  id: string;
  findingNumber: string; // e.g. UNIMEN/AMI-2026/F-001
  auditId: string;
  unitId: string;
  unitName: string;
  standardCode: string;
  standardName: string;
  category: FindingCategory;
  problemDescription: string;
  evidenceRef: string;
  rootCause: string;
  riskAnalysis: string;
  recommendation: string;
  picName: string;
  picRole: string;
  deadline: string;
  status: FindingStatus;
  createdAt: string;
  auditorId: string;
  auditorName: string;
}

export interface CorrectiveAction {
  id: string;
  findingId: string;
  findingNumber: string;
  unitId: string;
  unitName: string;
  correctivePlan: string; // Tindakan Koreksi
  preventivePlan: string; // Tindakan Pencegahan
  targetOutput: string;
  targetDate: string;
  progressPercent: number; // 0 - 100
  evidenceSubmissionUrl?: string;
  evidenceNotes?: string;
  auditorVerificationNotes?: string;
  verifiedBy?: string;
  verifiedAt?: string;
  status: 'Draft' | 'Diajukan' | 'Perlu Perbaikan' | 'Terverifikasi' | 'Selesai';
  approvedByDean?: boolean;
  approvedByRector?: boolean;
}

export interface AuditInstance {
  id: string;
  programId: string;
  programName: string;
  unitId: string;
  unitName: string;
  unitType: 'Program Studi' | 'Fakultas' | 'Lembaga' | 'Unit Kerja';
  leadAuditorId: string;
  leadAuditorName: string;
  memberAuditorId?: string;
  memberAuditorName?: string;
  auditeeHeadId: string;
  auditeeHeadName: string;
  scheduledDate: string;
  completionDate?: string;
  status: AuditStatus;
  scoreAverage: number;
  totalItems: number;
  filledItems: number;
  findingsCount: {
    mayor: number;
    minor: number;
    observasi: number;
  };
  rtmLevelUniversityStatus?: 'Pending' | 'Selesai';
  rtmLevelFacultyStatus?: 'Pending' | 'Selesai';
  deanValidated?: boolean;
}

export interface SummonedFindingRef {
  findingId: string;
  findingNumber: string;
  unitName: string;
  standardCode: string;
  category: FindingCategory;
  problemDescription: string;
  status: FindingStatus;
}

export interface RTMDecision {
  id: string;
  item: string;
  action: string;
  pic: string;
  deadline: string;
  ppeppTarget: string;
  budgetSupport?: string;
}

export interface RTMRecord {
  id: string;
  meetingNumber?: string;
  level: 'Universitas' | 'Fakultas';
  unitId: string;
  unitName: string;
  date: string;
  scheduledTime?: string;
  location?: string;
  leadName: string;
  leadRole?: string;
  agenda: string;
  sessionStatus?: 'Terjadwal' | 'Sedang Berlangsung' | 'Selesai' | 'Ditindaklanjuti';
  urgencyLevel?: 'Tinggi (Temuan Mayor)' | 'Sedang (Minor)' | 'Rutin Siklus AMI';
  summonedUnitIds?: string[];
  summonedUnitNames?: string[];
  summonedFindings?: SummonedFindingRef[];
  summonNotes?: string;
  requiredAuditeeRoles?: string[];
  participants: string[];
  discussionSummary: string;
  decisions: RTMDecision[];
  status: 'Draft' | 'Disetujui' | 'Ditindaklanjuti';
  evaluationOutcome?: {
    overallStatus: 'Memuaskan' | 'Perlu Perbaikan Segera' | 'Peringatan Mutu';
    leadershipDirective?: string;
    ppeppNextMilestone?: string;
    evaluatedAt?: string;
  };
}
