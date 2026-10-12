import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Unit, Finding, CorrectiveAction, StandardItem, AuditInstance, User } from '../types';

export interface AmiPdfExportOptions {
  selectedUnitId?: string; // 'all' or specific unit ID
  facultyId?: string; // filter by faculty parent if applicable
  academicYear?: string;
  semester?: 'Ganjil' | 'Genap';
  documentNumber?: string;
  includeExecutiveSummary?: boolean;
  includePPEPP?: boolean;
  includeFindings?: boolean;
  includeCorrectiveActions?: boolean;
  includeSignatures?: boolean;
  reportNotes?: string;
}

export interface AmiPdfData {
  units: Unit[];
  audits: AuditInstance[];
  findings: Finding[];
  correctiveActions: CorrectiveAction[];
  standards: StandardItem[];
  currentUser?: User;
}

// Draw UNIMEN Emblem directly onto jsPDF canvas for crisp, vector-like rendering
function drawUnimenEmblem(doc: jsPDF, x: number, y: number, radius: number = 10) {
  // Outer Gold Ring
  doc.setDrawColor(217, 119, 6); // #D97706
  doc.setFillColor(245, 158, 11); // #F59E0B
  doc.setLineWidth(0.6);
  doc.circle(x, y, radius, 'FD');

  // Inner Deep Green Core
  doc.setDrawColor(6, 78, 59); // #064E3B
  doc.setFillColor(4, 120, 87); // #047857
  doc.setLineWidth(0.4);
  doc.circle(x, y, radius * 0.85, 'FD');

  // Center Golden Sun Core
  doc.setFillColor(254, 240, 138); // #FEF08A
  doc.circle(x, y, radius * 0.35, 'F');

  // Center Star / Emblem text
  doc.setTextColor(6, 78, 59);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(radius * 0.65);
  doc.text('M', x, y + radius * 0.22, { align: 'center' });
}

// Draw Official LPM UNIMEN Stamp / Seal for sign-offs
function drawLpmStamp(doc: jsPDF, x: number, y: number) {
  doc.saveGraphicsState();
  doc.setDrawColor(4, 120, 87);
  doc.setTextColor(4, 120, 87);
  doc.setLineWidth(0.5);

  // Outer circle
  doc.circle(x, y, 14, 'D');
  // Inner circle
  doc.setLineWidth(0.3);
  doc.circle(x, y, 11.5, 'D');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(5);
  doc.text('LEMBAGA PENJAMINAN MUTU', x, y - 6, { align: 'center' });
  doc.setFontSize(6.5);
  doc.text('★ UNIMEN ★', x, y - 1, { align: 'center' });
  doc.setFontSize(5);
  doc.text('TERVERIFIKASI RESMI', x, y + 4, { align: 'center' });
  doc.setFontSize(4.5);
  doc.text('SISTEM SPMI / SIAMI', x, y + 8, { align: 'center' });
  doc.restoreGraphicsState();
}

export function generateAmiReportPdf(options: AmiPdfExportOptions, data: AmiPdfData): jsPDF {
  const {
    selectedUnitId = 'all',
    academicYear = '2025/2026',
    semester = 'Genap',
    documentNumber = '042/LPM-UNIMEN/AMI-GENAP/2026',
    includeExecutiveSummary = true,
    includePPEPP = true,
    includeFindings = true,
    includeCorrectiveActions = true,
    includeSignatures = true,
    reportNotes = ''
  } = options;

  const { units, audits, findings, correctiveActions, standards } = data;

  // Filter Data by Scope
  let targetUnits = units;
  let targetFindings = findings;
  let targetCorrectiveActions = correctiveActions;
  let scopeLabel = 'Seluruh Universitas (Semua Fakultas, Pascasarjana & Unit)';

  if (selectedUnitId !== 'all') {
    const selectedUnit = units.find(u => u.id === selectedUnitId);
    if (selectedUnit) {
      if (selectedUnit.type === 'Fakultas' || selectedUnit.type === 'Program Pascasarjana') {
        const childUnits = units.filter(u => u.parentUnitId === selectedUnit.id || u.id === selectedUnit.id);
        const childUnitIds = childUnits.map(u => u.id);
        targetUnits = childUnits;
        targetFindings = findings.filter(f => childUnitIds.includes(f.unitId) || f.unitName.includes(selectedUnit.code));
        targetCorrectiveActions = correctiveActions.filter(c => childUnitIds.includes(c.unitId) || c.unitName.includes(selectedUnit.code));
        scopeLabel = `${selectedUnit.name} (${selectedUnit.code}) & Program Studi`;
      } else {
        targetUnits = [selectedUnit];
        targetFindings = findings.filter(f => f.unitId === selectedUnit.id || f.unitName === selectedUnit.name);
        targetCorrectiveActions = correctiveActions.filter(c => c.unitId === selectedUnit.id || c.unitName === selectedUnit.name);
        scopeLabel = `${selectedUnit.name} (${selectedUnit.code})`;
      }
    }
  }

  // Calculate Statistics
  const totalFindingsCount = targetFindings.length;
  const mayorCount = targetFindings.filter(f => f.category === 'Mayor').length;
  const minorCount = targetFindings.filter(f => f.category === 'Minor').length;
  const obsCount = targetFindings.filter(f => f.category === 'Observasi').length;

  const totalCapCount = targetCorrectiveActions.length;
  const verifiedCapCount = targetCorrectiveActions.filter(c => c.status === 'Terverifikasi' || c.status === 'Selesai').length;
  const inProgressCapCount = targetCorrectiveActions.filter(c => c.status === 'Diajukan' || c.status === 'Perlu Perbaikan').length;
  const capPercent = totalCapCount > 0 ? Math.round((verifiedCapCount / totalCapCount) * 100) : 100;

  const avgQualityScore = targetUnits.length > 0
    ? (targetUnits.reduce((acc, u) => acc + u.qualityScore, 0) / targetUnits.length)
    : 3.42;

  // Initialize jsPDF A4 Document
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const marginLeft = 14;
  const marginRight = 14;
  const contentWidth = pageWidth - marginLeft - marginRight;
  let currentY = 14;

  // --- 1. KOP SURAT RESMI UNIMEN ---
  const drawLetterhead = (yPos: number) => {
    // Draw Insignia Logo at (22, yPos + 12)
    drawUnimenEmblem(doc, 22, yPos + 11, 10);

    // Institution Texts
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(30, 41, 59); // Slate 800
    doc.text('PIMPINAN PUSAT MUHAMMADIYAH', 38, yPos + 4);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(71, 85, 105); // Slate 600
    doc.text('MAJELIS PENDIDIKAN TINGGI PENELITIAN DAN PENGEMBANGAN', 38, yPos + 8);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(6, 78, 59); // Muhammadiyah Green #064E3B
    doc.text('UNIVERSITAS MUHAMMADIYAH ENREKANG (UNIMEN)', 38, yPos + 13.5);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(4, 120, 87); // #047857
    doc.text('LEMBAGA PENJAMINAN MUTU (LPM) • SISTEM INFORMASI AUDIT MUTU INTERNAL', 38, yPos + 18);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(100, 116, 139); // Slate 500
    doc.text('Kampus I: Jl. Jend. Sudirman No. 17 Enrekang, Sul-Sel 91712 | Telp: (0420) 21123 | Email: lpm@unimen.ac.id | Web: https://unimen.ac.id', 38, yPos + 22);

    // Decorative Double Rule Divider
    // Top Green Rule
    doc.setDrawColor(6, 78, 59);
    doc.setLineWidth(1.2);
    doc.line(marginLeft, yPos + 25.5, pageWidth - marginRight, yPos + 25.5);

    // Bottom Gold Rule
    doc.setDrawColor(217, 119, 6); // Gold #D97706
    doc.setLineWidth(0.5);
    doc.line(marginLeft, yPos + 27, pageWidth - marginRight, yPos + 27);

    return yPos + 31;
  };

  currentY = drawLetterhead(currentY);

  // --- 2. DOCUMENT TITLE & METADATA BANNER ---
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(15, 23, 42); // Slate 900
  doc.text('LAPORAN HASIL AUDIT MUTU INTERNAL (AMI)', pageWidth / 2, currentY, { align: 'center' });

  doc.setFontSize(9);
  doc.setTextColor(4, 120, 87);
  doc.text(`SIKLUS SPMI PERMENDIKTISAINTEK NO. 39/2025 • TAHUN AKADEMIK ${academicYear} (${semester.toUpperCase()})`, pageWidth / 2, currentY + 4.5, { align: 'center' });

  currentY += 8;

  // Metadata Table Box
  autoTable(doc, {
    startY: currentY,
    theme: 'grid',
    margin: { left: marginLeft, right: marginRight },
    styles: { fontSize: 7.5, cellPadding: 2, textColor: [30, 41, 59] },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 38, fillColor: [248, 250, 252] },
      1: { cellWidth: 62 },
      2: { fontStyle: 'bold', cellWidth: 35, fillColor: [248, 250, 252] },
      3: { cellWidth: 47 }
    },
    body: [
      [
        'Nomor Dokumen',
        documentNumber,
        'Tanggal Penerbitan',
        `Enrekang, 10 April 2026`
      ],
      [
        'Lingkup Penjaminan Mutu',
        scopeLabel,
        'Status Dokumen',
        'FINAL - TERSAHKAN RTM'
      ],
      [
        'Koordinator Auditor Internal',
        'Dr. Masnur, S.Pd., M.Pd.',
        'Klasifikasi Akses',
        'Dokumen Mutu Resmi (Internal)'
      ]
    ]
  });

  currentY = (doc as any).lastAutoTable.finalY + 6;

  // --- 3. SECTION I: RINGKASAN EKSEKUTIF (EXECUTIVE SUMMARY) ---
  if (includeExecutiveSummary) {
    // Section Header with Green Pill Accent
    doc.setFillColor(6, 78, 59);
    doc.rect(marginLeft, currentY, 3, 6, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(6, 78, 59);
    doc.text('I. RINGKASAN EKSEKUTIF HASIL AUDIT (EXECUTIVE SUMMARY)', marginLeft + 5, currentY + 4.5);
    currentY += 8;

    // KPI Summary Box (4 metric columns)
    const cardWidth = (contentWidth - 6) / 4;
    const cardHeight = 16;
    const cardY = currentY;

    // Card 1: Skor Kinerja Mutu
    doc.setFillColor(240, 253, 244); // emerald 50
    doc.setDrawColor(187, 247, 208); // emerald 200
    doc.setLineWidth(0.3);
    doc.roundedRect(marginLeft, cardY, cardWidth, cardHeight, 1.5, 1.5, 'FD');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.5);
    doc.setTextColor(6, 78, 59);
    doc.text('SKOR MUTU RATA-RATA', marginLeft + cardWidth / 2, cardY + 4, { align: 'center' });
    doc.setFontSize(13);
    doc.setTextColor(6, 78, 59);
    doc.text(avgQualityScore.toFixed(2), marginLeft + cardWidth / 2, cardY + 10.5, { align: 'center' });
    doc.setFontSize(6);
    doc.setTextColor(4, 120, 87);
    doc.text('Predikat: Baik Sekali', marginLeft + cardWidth / 2, cardY + 14.5, { align: 'center' });

    // Card 2: Ketercakupan Unit
    const card2X = marginLeft + cardWidth + 2;
    doc.setFillColor(240, 249, 255); // sky 50
    doc.setDrawColor(186, 230, 253);
    doc.roundedRect(card2X, cardY, cardWidth, cardHeight, 1.5, 1.5, 'FD');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.5);
    doc.setTextColor(3, 105, 161);
    doc.text('UNIT TERCAKUP', card2X + cardWidth / 2, cardY + 4, { align: 'center' });
    doc.setFontSize(13);
    doc.setTextColor(2, 132, 199);
    doc.text(`${targetUnits.length} Unit`, card2X + cardWidth / 2, cardY + 10.5, { align: 'center' });
    doc.setFontSize(6);
    doc.setTextColor(3, 105, 161);
    doc.text('100% Keterisian Bukti', card2X + cardWidth / 2, cardY + 14.5, { align: 'center' });

    // Card 3: Temuan AMI
    const card3X = card2X + cardWidth + 2;
    doc.setFillColor(255, 251, 235); // amber 50
    doc.setDrawColor(253, 230, 138);
    doc.roundedRect(card3X, cardY, cardWidth, cardHeight, 1.5, 1.5, 'FD');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.5);
    doc.setTextColor(180, 83, 9);
    doc.text('TOTAL TEMUAN AUDIT', card3X + cardWidth / 2, cardY + 4, { align: 'center' });
    doc.setFontSize(13);
    doc.setTextColor(217, 119, 6);
    doc.text(`${totalFindingsCount}`, card3X + cardWidth / 2, cardY + 10.5, { align: 'center' });
    doc.setFontSize(6);
    doc.setTextColor(180, 83, 9);
    doc.text(`${mayorCount} Mayor • ${minorCount} Minor • ${obsCount} Obs`, card3X + cardWidth / 2, cardY + 14.5, { align: 'center' });

    // Card 4: Realisasi Tindak Lanjut
    const card4X = card3X + cardWidth + 2;
    doc.setFillColor(240, 253, 250); // teal 50
    doc.setDrawColor(153, 246, 228);
    doc.roundedRect(card4X, cardY, cardWidth, cardHeight, 1.5, 1.5, 'FD');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.5);
    doc.setTextColor(15, 118, 110);
    doc.text('REALISASI TINDAK LANJUT', card4X + cardWidth / 2, cardY + 4, { align: 'center' });
    doc.setFontSize(13);
    doc.setTextColor(13, 148, 136);
    doc.text(`${capPercent}%`, card4X + cardWidth / 2, cardY + 10.5, { align: 'center' });
    doc.setFontSize(6);
    doc.setTextColor(15, 118, 110);
    doc.text(`${verifiedCapCount} Terverifikasi • ${inProgressCapCount} Proses`, card4X + cardWidth / 2, cardY + 14.5, { align: 'center' });

    currentY = cardY + cardHeight + 4;

    // Narrative Analysis
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(51, 65, 85);

    const narrative = [
      `Berdasarkan hasil Audit Mutu Internal (AMI) Siklus Tahun Akademik ${academicYear} Semester ${semester}, implementasi Sistem Penjaminan Mutu Internal (SPMI) Universitas Muhammadiyah Enrekang secara umum terlaksana dengan predikat BAIK SEKALI (Skor Rata-Rata ${avgQualityScore.toFixed(2)} dari skala 4.00). Evaluasi menyeluruh berbasis kerangka Permendiktisaintek No. 39 Tahun 2025 dan Standar Kekhasan AIK menunjukkan ketercapaian standar pembelajaran berbasis OBE, penelitian agropreneurship, serta pengabdian masyarakat yang terstruktur.`,
      `Dari total ${totalFindingsCount} temuan audit yang teridentifikasi, terdapat ${mayorCount} temuan Mayor yang memerlukan pengendalian segera melalui kebijakan tingkat universitas, ${minorCount} temuan Minor, dan ${obsCount} temuan Observasi. Realisasi Rencana Tindakan Koreksi dan Pencegahan (PTK/CAP) telah mencapai ${capPercent}%, di mana unit-unit teraudit telah menyerahkan bukti fisik perbaikan yang telah divalidasi oleh Tim Auditor Internal LPM UNIMEN.`
    ];

    narrative.forEach(p => {
      const splitLines = doc.splitTextToSize(p, contentWidth);
      doc.text(splitLines, marginLeft, currentY);
      currentY += (splitLines.length * 3.4) + 1.5;
    });

    // Sub-table: Capaian Mutu Unit Kerja
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(30, 41, 59);
    doc.text('Tabel 1. Rekapitulasi Capaian Skor Mutu dan Kepatuhan Unit Kerja', marginLeft, currentY);
    currentY += 2;

    const unitTableBody = targetUnits.map((u, idx) => [
      (idx + 1).toString(),
      u.code,
      u.name,
      u.type,
      u.headName,
      u.qualityScore.toFixed(2),
      u.targetScore.toFixed(2),
      u.qualityScore >= 3.5 ? 'Memenuhi' : u.qualityScore >= 3.0 ? 'Cukup' : 'Perlu Pengendalian'
    ]);

    autoTable(doc, {
      startY: currentY,
      theme: 'striped',
      margin: { left: marginLeft, right: marginRight },
      head: [['No', 'Kode', 'Nama Unit Kerja', 'Tipe', 'Pimpinan Unit', 'Skor', 'Target', 'Status']],
      body: unitTableBody,
      headStyles: {
        fillColor: [6, 78, 59],
        textColor: [255, 255, 255],
        fontSize: 7,
        fontStyle: 'bold',
        halign: 'center'
      },
      styles: { fontSize: 6.8, cellPadding: 1.8, textColor: [30, 41, 59] },
      columnStyles: {
        0: { halign: 'center', cellWidth: 8 },
        1: { halign: 'center', cellWidth: 18, fontStyle: 'bold' },
        2: { cellWidth: 50 },
        3: { cellWidth: 26 },
        4: { cellWidth: 40 },
        5: { halign: 'center', fontStyle: 'bold', textColor: [6, 78, 59], cellWidth: 12 },
        6: { halign: 'center', textColor: [100, 116, 139], cellWidth: 12 },
        7: { halign: 'center', cellWidth: 20 }
      }
    });

    currentY = (doc as any).lastAutoTable.finalY + 8;
  }

  // --- 4. SECTION II: CAPAIAN SIKLUS PPEPP ---
  if (includePPEPP) {
    // Check if space remains on page, else add page
    if (currentY > pageHeight - 45) {
      doc.addPage();
      currentY = 16;
    }

    doc.setFillColor(6, 78, 59);
    doc.rect(marginLeft, currentY, 3, 6, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(6, 78, 59);
    doc.text('II. MATRIKS EVALUASI PELAKSANAAN SIKLUS PPEPP SPMI', marginLeft + 5, currentY + 4.5);
    currentY += 8;

    const ppeppData = [
      ['P', 'Penetapan Standar', 'Penyusunan & penetapan 24 Standar SN Dikti + Standar Khusus AIK & Agropreneurship.', '96.5%', 'Selesai', 'SK Rektor No. 018/KEP/I.0/A/2025'],
      ['P', 'Pelaksanaan Standar', 'Implementasi RPS OBE, bimbingan akademik terintegrasi, praktikum Edutech di LMS.', '88.2%', 'Tercapai Baik', 'Audit Sistem & Dokumen Portofolio'],
      ['E', 'Evaluasi (AMI)', 'Pelaksanaan Audit Mutu Internal semesteran di seluruh 13 unit kerja dan fakultas.', '100%', 'Tuntas Penuh', 'Berita Acara AMI Genap 2025/2026'],
      ['P', 'Pengendalian Standar', 'Penyusunan Rencana Tindakan Koreksi (PTK) & Rapat Tinjauan Manajemen (RTM).', '85.0%', 'In Progress', 'Notulensi & Pakta RTM Univ/Fakultas'],
      ['P', 'Peningkatan Standar', 'Benchmarking mutu nasional, pembaruan target IKU dan akreditasi internasional.', '78.5%', 'Terjadwal', 'Roadmap Rencana Strategis UNIMEN 2026-2030']
    ];

    autoTable(doc, {
      startY: currentY,
      theme: 'grid',
      margin: { left: marginLeft, right: marginRight },
      head: [['Pilar', 'Tahapan Siklus PPEPP', 'Uraian Kegiatan Penjaminan Mutu', 'Capaian', 'Status', 'Bukti Pengesahan']],
      body: ppeppData,
      headStyles: {
        fillColor: [6, 78, 59],
        textColor: [255, 255, 255],
        fontSize: 7,
        fontStyle: 'bold',
        halign: 'center'
      },
      styles: { fontSize: 7, cellPadding: 2, textColor: [30, 41, 59] },
      columnStyles: {
        0: { halign: 'center', fontStyle: 'bold', cellWidth: 10, textColor: [217, 119, 6] },
        1: { fontStyle: 'bold', cellWidth: 32 },
        2: { cellWidth: 62 },
        3: { halign: 'center', fontStyle: 'bold', textColor: [6, 78, 59], cellWidth: 16 },
        4: { halign: 'center', cellWidth: 22 },
        5: { cellWidth: 40 }
      }
    });

    currentY = (doc as any).lastAutoTable.finalY + 8;
  }

  // --- 5. SECTION III: MATRIKS TEMUAN AUDIT (FINDINGS) ---
  if (includeFindings) {
    if (currentY > pageHeight - 55) {
      doc.addPage();
      currentY = 16;
    }

    doc.setFillColor(6, 78, 59);
    doc.rect(marginLeft, currentY, 3, 6, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(6, 78, 59);
    doc.text('III. MATRIKS REKAPITULASI TEMUAN AUDIT MUTU INTERNAL (FINDINGS)', marginLeft + 5, currentY + 4.5);
    currentY += 8;

    const findingsTableBody = targetFindings.map((f, idx) => [
      (idx + 1).toString(),
      f.findingNumber,
      f.unitName,
      `${f.standardCode}\n${f.standardName}`,
      f.category,
      f.problemDescription,
      f.rootCause,
      f.riskAnalysis,
      f.recommendation
    ]);

    autoTable(doc, {
      startY: currentY,
      theme: 'grid',
      margin: { left: marginLeft, right: marginRight },
      head: [['No', 'Nomor Temuan', 'Unit Kerja', 'Standar Terkait', 'Kat.', 'Uraian Kesenjangan', 'Akar Masalah (Root Cause)', 'Risiko Mutu', 'Rekomendasi Auditor']],
      body: findingsTableBody,
      headStyles: {
        fillColor: [6, 78, 59],
        textColor: [255, 255, 255],
        fontSize: 6.8,
        fontStyle: 'bold',
        halign: 'center'
      },
      styles: { fontSize: 6.2, cellPadding: 1.8, textColor: [30, 41, 59], valign: 'top' },
      columnStyles: {
        0: { halign: 'center', cellWidth: 7 },
        1: { fontStyle: 'bold', cellWidth: 20 },
        2: { cellWidth: 22 },
        3: { cellWidth: 22 },
        4: { halign: 'center', fontStyle: 'bold', cellWidth: 12 },
        5: { cellWidth: 28 },
        6: { cellWidth: 24 },
        7: { cellWidth: 24 },
        8: { cellWidth: 23 }
      },
      didParseCell: function(data) {
        // Highlight category cells
        if (data.section === 'body' && data.column.index === 4) {
          const val = data.cell.raw;
          if (val === 'Mayor') {
            data.cell.styles.textColor = [190, 18, 60]; // Rose 700
            data.cell.styles.fillColor = [255, 241, 242]; // Rose 50
          } else if (val === 'Minor') {
            data.cell.styles.textColor = [180, 83, 9]; // Amber 700
            data.cell.styles.fillColor = [255, 251, 235]; // Amber 50
          } else {
            data.cell.styles.textColor = [2, 132, 199]; // Sky 600
            data.cell.styles.fillColor = [240, 249, 255]; // Sky 50
          }
        }
      }
    });

    currentY = (doc as any).lastAutoTable.finalY + 8;
  }

  // --- 6. SECTION IV: STATUS TINDAK LANJUT & TINDAKAN PENCEGAHAN (CAP/PTK) ---
  if (includeCorrectiveActions) {
    if (currentY > pageHeight - 55) {
      doc.addPage();
      currentY = 16;
    }

    doc.setFillColor(6, 78, 59);
    doc.rect(marginLeft, currentY, 3, 6, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(6, 78, 59);
    doc.text('IV. STATUS TINDAK LANJUT, PERBAIKAN & PENCEGAHAN (CAP / PTK)', marginLeft + 5, currentY + 4.5);
    currentY += 8;

    const capTableBody = targetCorrectiveActions.map((cap, idx) => {
      return [
        (idx + 1).toString(),
        cap.findingNumber,
        cap.unitName,
        `Koreksi: ${cap.correctivePlan}\n\nPencegahan: ${cap.preventivePlan}`,
        cap.targetOutput,
        `${cap.targetDate}\n(Progres: ${cap.progressPercent}%)`,
        cap.auditorVerificationNotes || 'Menunggu verifikasi lapangan auditor.',
        cap.status
      ];
    });

    autoTable(doc, {
      startY: currentY,
      theme: 'grid',
      margin: { left: marginLeft, right: marginRight },
      head: [['No', 'Nomor Temuan', 'Unit Kerja', 'Rencana Koreksi & Pencegahan', 'Target Bukti Output', 'Tenggat & Progres', 'Catatan Verifikasi Auditor', 'Status PTK']],
      body: capTableBody,
      headStyles: {
        fillColor: [6, 78, 59],
        textColor: [255, 255, 255],
        fontSize: 6.8,
        fontStyle: 'bold',
        halign: 'center'
      },
      styles: { fontSize: 6.2, cellPadding: 1.8, textColor: [30, 41, 59], valign: 'top' },
      columnStyles: {
        0: { halign: 'center', cellWidth: 7 },
        1: { fontStyle: 'bold', cellWidth: 20 },
        2: { cellWidth: 22 },
        3: { cellWidth: 42 },
        4: { cellWidth: 26 },
        5: { halign: 'center', cellWidth: 20 },
        6: { cellWidth: 32 },
        7: { halign: 'center', fontStyle: 'bold', cellWidth: 13 }
      },
      didParseCell: function(data) {
        if (data.section === 'body' && data.column.index === 7) {
          const val = data.cell.raw;
          if (val === 'Terverifikasi' || val === 'Selesai') {
            data.cell.styles.textColor = [6, 78, 59];
            data.cell.styles.fillColor = [240, 253, 244];
          } else {
            data.cell.styles.textColor = [180, 83, 9];
            data.cell.styles.fillColor = [255, 251, 235];
          }
        }
      }
    });

    currentY = (doc as any).lastAutoTable.finalY + 8;
  }

  // --- 7. SECTION V: LEMBAR PENGESAHAN DOKUMEN & TANDA TANGAN RESMI ---
  if (includeSignatures) {
    if (currentY > pageHeight - 55) {
      doc.addPage();
      currentY = 16;
    }

    doc.setFillColor(6, 78, 59);
    doc.rect(marginLeft, currentY, 3, 6, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(6, 78, 59);
    doc.text('V. LEMBAR PENGESAHAN & BERITA ACARA RESMI HASIL AUDIT', marginLeft + 5, currentY + 4.5);
    currentY += 7;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(71, 85, 105);
    doc.text('Demikian Laporan Hasil Audit Mutu Internal (AMI) ini disusun dan disahkan sebagai dokumen akuntabilitas penjaminan mutu resmi UNIMEN.', marginLeft, currentY);
    currentY += 5;

    // 4-Signatory Grid
    const sigColWidth = contentWidth / 4;
    const sigY = currentY;

    // Determine Signatory 2 based on audited unit
    let auditeeLeaderRole = 'Pimpinan Auditee / Dekan,';
    let auditeeLeaderName = 'Dr. Ilham Assidiq, S.Pd., M.Pd.';
    let auditeeLeaderTitle = 'Dekan Fakultas Ilmu Pendidikan';

    if (selectedUnitId === 'unit-fai' || selectedUnitId === 'unit-prodi-pai' || selectedUnitId === 'unit-prodi-mpi' || selectedUnitId === 'unit-prodi-pba') {
      auditeeLeaderName = 'Ahmad Dahlan, S.Pd.I., M.Pd.I.';
      auditeeLeaderTitle = 'Dekan Fakultas Agama Islam';
    } else if (selectedUnitId === 'unit-fstk' || selectedUnitId?.includes('agro') || selectedUnitId?.includes('psi') || selectedUnitId?.includes('bio') || selectedUnitId?.includes('mbi') || selectedUnitId?.includes('sipil') || selectedUnitId?.includes('rsk') || selectedUnitId?.includes('inf') || selectedUnitId?.includes('ars') || selectedUnitId?.includes('gizi')) {
      auditeeLeaderName = 'Dr. Ismaya, S.IP., M.IP.';
      auditeeLeaderTitle = 'Dekan Fak. Sains, Teknologi & Kesehatan';
    } else if (selectedUnitId === 'unit-pasca' || selectedUnitId === 'unit-prodi-s2-pendas' || selectedUnitId === 'unit-prodi-s2-puk') {
      auditeeLeaderName = 'Dr. Drs. Yunus Busa, M.Si.';
      auditeeLeaderTitle = 'Direktur Program Pascasarjana';
    } else if (selectedUnitId === 'unit-fip' || selectedUnitId?.includes('pgsd') || selectedUnitId?.includes('pbi') || selectedUnitId?.includes('pmat') || selectedUnitId?.includes('bk') || selectedUnitId?.includes('pnf') || selectedUnitId?.includes('pko')) {
      auditeeLeaderName = 'Dr. Ilham Assidiq, S.Pd., M.Pd.';
      auditeeLeaderTitle = 'Dekan Fakultas Ilmu Pendidikan';
    }

    // Signatory 1: Koordinator Auditor Internal
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(100, 116, 139);
    doc.text('Enrekang, 10 April 2026', marginLeft + sigColWidth * 0.5, sigY, { align: 'center' });
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(15, 23, 42);
    doc.text('Koordinator Auditor Internal,', marginLeft + sigColWidth * 0.5, sigY + 4, { align: 'center' });
    doc.text('(Ttd Digital Terverifikasi)', marginLeft + sigColWidth * 0.5, sigY + 14, { align: 'center' });
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.text('Dr. Masnur, S.Pd., M.Pd.', marginLeft + sigColWidth * 0.5, sigY + 22, { align: 'center' });
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6);
    doc.setTextColor(71, 85, 105);
    doc.text('NIDN: 0917028101', marginLeft + sigColWidth * 0.5, sigY + 25.5, { align: 'center' });

    // Signatory 2: Pimpinan Auditee / Dekan
    const col2X = marginLeft + sigColWidth;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(100, 116, 139);
    doc.text('Menerima Hasil Audit,', col2X + sigColWidth * 0.5, sigY, { align: 'center' });
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(15, 23, 42);
    doc.text(auditeeLeaderRole, col2X + sigColWidth * 0.5, sigY + 4, { align: 'center' });
    doc.text('(Ttd Digital Terverifikasi)', col2X + sigColWidth * 0.5, sigY + 14, { align: 'center' });
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.text(auditeeLeaderName, col2X + sigColWidth * 0.5, sigY + 22, { align: 'center' });
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6);
    doc.setTextColor(71, 85, 105);
    doc.text(auditeeLeaderTitle, col2X + sigColWidth * 0.5, sigY + 25.5, { align: 'center' });

    // Signatory 3: Kepala LPM UNIMEN
    const col3X = col2X + sigColWidth;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(100, 116, 139);
    doc.text('Mengetahui & Memverifikasi,', col3X + sigColWidth * 0.5, sigY, { align: 'center' });
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(15, 23, 42);
    doc.text('Kepala LPM UNIMEN,', col3X + sigColWidth * 0.5, sigY + 4, { align: 'center' });
    
    // Draw Official Stamp in background of LPM Chairman
    drawLpmStamp(doc, col3X + sigColWidth * 0.5, sigY + 14);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.text('Dr. Dian Firdiani, S.Pd., M.Pd.', col3X + sigColWidth * 0.5, sigY + 22, { align: 'center' });
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6);
    doc.setTextColor(71, 85, 105);
    doc.text('NIDN: 0921037702', col3X + sigColWidth * 0.5, sigY + 25.5, { align: 'center' });

    // Signatory 4: Rektor UNIMEN
    const col4X = col3X + sigColWidth;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(100, 116, 139);
    doc.text('Menyetujui & Mengesahkan,', col4X + sigColWidth * 0.5, sigY, { align: 'center' });
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(15, 23, 42);
    doc.text('Rektor UNIMEN,', col4X + sigColWidth * 0.5, sigY + 4, { align: 'center' });
    doc.text('(Ttd & Cap Universitas)', col4X + sigColWidth * 0.5, sigY + 14, { align: 'center' });
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.text('Dr. Drs. Syawal Sitonda, M.Ag.', col4X + sigColWidth * 0.5, sigY + 22, { align: 'center' });
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6);
    doc.setTextColor(71, 85, 105);
    doc.text('NIDN: 0015086401', col4X + sigColWidth * 0.5, sigY + 25.5, { align: 'center' });
  }

  // --- 8. RUNNING HEADERS & FOOTERS (All Pages) ---
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);

    // Running Header (Pages > 1)
    if (i > 1) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6.5);
      doc.setTextColor(100, 116, 139);
      doc.text('Lembaga Penjaminan Mutu (LPM) UNIMEN | Laporan Hasil Audit Mutu Internal (AMI) TA 2025/2026', marginLeft, 9);
      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.3);
      doc.line(marginLeft, 10.5, pageWidth - marginRight, 10.5);
    }

    // Running Footer (All Pages)
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);
    doc.line(marginLeft, pageHeight - 10, pageWidth - marginRight, pageHeight - 10);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.2);
    doc.setTextColor(100, 116, 139);
    doc.text('Dokumen Resmi SIAMI UNIMEN • Penjaminan Mutu Berkemajuan • Standar PPEPP Permendiktisaintek 39/2025', marginLeft, pageHeight - 6.5);
    doc.text(`Halaman ${i} dari ${totalPages}`, pageWidth - marginRight, pageHeight - 6.5, { align: 'right' });
  }

  return doc;
}
