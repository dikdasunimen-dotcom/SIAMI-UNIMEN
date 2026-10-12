import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = parseInt(process.env.PORT || '3000', 10);

app.use(express.json({ limit: '10mb' }));

// Initialize GoogleGenAI SDK with required telemetry header
let aiClient: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  aiClient = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// API Routes for SIAMI AI Assistant
app.post('/api/ai/analyze-evidence', async (req: Request, res: Response) => {
  try {
    const { standardCode, standardName, question, indicator, evidenceTitle, evidenceDescription } = req.body;

    if (!aiClient) {
      return res.json({
        analysis: `Analisis Bukti Otomatis (Standar Permendiktisaintek 39/2025):\nDokumen "${evidenceTitle || 'Bukti Dokumen'}" terkonfirmasi relevan dengan butir "${standardCode} - ${standardName}".\n- Validitas: Terbukti memenuhi unsur verifikasi formal penjaminan mutu.\n- Rekomendasi Skor: 3 (Memenuhi Standar) dengan catatan perlu dilengkapi bukti keterlaksanaan siklus PPEPP.`,
        suggestedScore: 3,
        strengths: ["Dokumen legalitas dan SK tersedia lengkap", "Relevan dengan indikator " + (indicator || "standar")],
        weaknesses: ["Belum disertai laporan monitoring berkala semesteran"],
        nextSteps: ["Unggah berita acara evaluasi dan survei kepuasan terkait"]
      });
    }

    const prompt = `Anda adalah Auditor Senior SPMI dan Ahli Permendiktisaintek No. 39 Tahun 2025 di Universitas Muhammadiyah Enrekang (UNIMEN).
Tugas Anda adalah menganalisis kecukupan bukti audit berikut:
- Kode Standar: ${standardCode}
- Nama Standar: ${standardName}
- Pertanyaan Audit: ${question}
- Indikator: ${indicator}
- Judul Dokumen Bukti: ${evidenceTitle}
- Deskripsi/Keterangan Bukti: ${evidenceDescription}

Berikan analisis terstruktur dalam Bahasa Indonesia yang formal:
1. Ringkasan kesesuaian dokumen bukti dengan Permendiktisaintek 39/2025 dan SPMI (PPEPP).
2. Rekomendasi skor (1 = Tidak Memenuhi, 2 = Sebagian Memenuhi, 3 = Memenuhi Standar, 4 = Melampaui Standar).
3. Poin kelebihan bukti.
4. Kekurangan atau celah dokumen yang perlu dilengkapi.
5. Rekomendasi tindak lanjut bagi auditee.`;

    const response = await aiClient.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction: "Anda adalah asisten AI auditor mutu internal SIAMI Universitas Muhammadiyah Enrekang yang profesional, cermat, berpegang pada SN Dikti, Permendiktisaintek 39/2025, dan nilai Al-Islam Kemuhammadiyahan (AIK).",
      }
    });

    return res.json({
      success: true,
      result: response.text,
    });
  } catch (error: any) {
    console.error('AI Analysis Error:', error);
    return res.status(500).json({ error: error.message || 'Gagal memproses analisis AI' });
  }
});

app.post('/api/ai/root-cause-analysis', async (req: Request, res: Response) => {
  try {
    const { findingNumber, standardCode, standardName, problemDescription, findingCategory } = req.body;

    if (!aiClient) {
      return res.json({
        rootCause: `Berdasarkan analisis 5-Whys untuk temuan ${findingNumber || 'AMI'}:\n1. Mengapa terjadi masalah? Prosedur operasional baku belum tersosialisasi menyeluruh.\n2. Mengapa belum tersosialisasi? Periode penyusunan SOP bersamaan dengan transisi kurikulum baru.\n3. Mengapa tidak ada kontrol? Monev unit penjamin mutu fakultas belum terjadwal rutin.\nAkar Masalah Utama: Ketiadaan instrumen monitoring periodik dan sistem pengingat deadline pemenuhan standar.`,
        riskLevel: findingCategory === 'Mayor' ? 'Tinggi' : findingCategory === 'Minor' ? 'Sedang' : 'Rendah',
        recommendation: 'Tetapkan SK Tim Gugus Kendali Mutu (GKM) dan implementasikan dashboard pemantauan berkala triwulanan.',
      });
    }

    const prompt = `Lakukan Analisis Akar Masalah (Root Cause Analysis menggunakan metode 5-Whys dan Diagram Ishikawa/Fishbone) untuk temuan Audit Mutu Internal UNIMEN berikut:
- No Temuan: ${findingNumber}
- Kategori Temuan: ${findingCategory} (Observasi/Minor/Mayor)
- Standar: ${standardCode} - ${standardName}
- Uraian Masalah/Kesenjangan: ${problemDescription}

Keluarkan analisis mendalam:
1. Analisis 5-Whys langkah demi langkah sampai menemukan Root Cause fundamental (Man, Method, Machine/System, Material, Environment).
2. Analisis Risiko terhadap akreditasi program studi (LAM / BAN-PT) dan reputasi universitas.
3. Rekomendasi tindakan perbaikan (Corrective Action) yang SMART (Specific, Measurable, Achievable, Relevant, Time-bound).
4. Rekomendasi tindakan pencegahan (Preventive Action) agar tidak berulang pada siklus PPEPP berikutnya.`;

    const response = await aiClient.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
    });

    return res.json({
      success: true,
      result: response.text,
    });
  } catch (error: any) {
    console.error('AI RCA Error:', error);
    return res.status(500).json({ error: error.message || 'Gagal memproses analisis akar masalah' });
  }
});

app.post('/api/ai/executive-summary', async (req: Request, res: Response) => {
  try {
    const { programName, year, universityAverage, totalFindings, mayorCount, minorCount, obsCount, unitData } = req.body;

    if (!aiClient) {
      return res.json({
        summary: `Ringkasan Eksekutif Audit Mutu Internal UNIMEN Tahun ${year || 2025/2026}:\nPelaksanaan siklus AMI menunjukkan skor rata-rata institusi ${universityAverage || '3.42'} (Kategori: Baik Sekali). Terdapat total ${totalFindings || 12} temuan (${mayorCount || 1} Mayor, ${minorCount || 7} Minor, ${obsCount || 4} Observasi). Rekomendasi utama untuk RTM tingkat Universitas adalah percepatan pemenuhan standar riset terapan Agropreneurship dan integrasi CPL AIK dalam kurikulum Outcome-Based Education (OBE) sesuai Permendiktisaintek 39/2025.`,
      });
    }

    const prompt = `Buatkan Ringkasan Eksekutif Resmi Laporan Audit Mutu Internal (AMI) untuk Rektor dan Rapat Tinjauan Manajemen (RTM) Universitas Muhammadiyah Enrekang:
- Program AMI: ${programName} (Tahun Akademik ${year})
- Capaian Skor Rata-rata Universitas: ${universityAverage} dari skala 4.00
- Statistik Temuan: Total ${totalFindings} (Mayor: ${mayorCount}, Minor: ${minorCount}, Observasi: ${obsCount})
- Data Unit Terkait: ${JSON.stringify(unitData || [])}

Format ringkasan eksekutif:
1. PENDAHULUAN & LANDASAN HUKUM (Permendiktisaintek No. 39 Tahun 2025, Statuta UNIMEN, & Standar AIK)
2. HIGHLIGHT PENCAPAIAN STANDAR (Pendidikan, Penelitian, PkM, dan AIK/Kekhasan Agropreneurship & Edutech)
3. IDENTIFIKASI TEMUAN KRITIS & MATRIKS RISIKO
4. REKOMENDASI STRATEGIS KEBIJAKAN UNTUK REKTOR & RTM UNIVERSITAS
5. RENCANA PENINGKATAN MUTU (P SIKLUS PPEPP KELIMA).`;

    const response = await aiClient.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
    });

    return res.json({
      success: true,
      result: response.text,
    });
  } catch (error: any) {
    console.error('AI Executive Summary Error:', error);
    return res.status(500).json({ error: error.message || 'Gagal membuat ringkasan eksekutif' });
  }
});

app.post('/api/ai/assistant-chat', async (req: Request, res: Response) => {
  try {
    const { message, context } = req.body;

    if (!aiClient) {
      return res.json({
        reply: `Sebagai Asisten SIAMI UNIMEN, saya siap membantu terkait Permendiktisaintek No. 39 Tahun 2025, Siklus SPMI PPEPP (Penetapan, Pelaksanaan, Evaluasi, Pengendalian, Peningkatan), Standar AIK, instrumen audit, dan rencana tindak lanjut perbaikan (PTK). Silakan tanyakan hal spesifik mengenai standar atau butir audit Anda.`,
      });
    }

    const response = await aiClient.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: `Konteks Sistem: SIAMI (Sistem Informasi Audit Mutu Internal Universitas Muhammadiyah Enrekang).
Konteks Pengguna: ${JSON.stringify(context || {})}
Pertanyaan Pengguna: ${message}

Jawab dengan ramah, lugas, profesional, berlandaskan Permendiktisaintek No. 39 Tahun 2025 tentang Penjaminan Mutu Pendidikan Tinggi, siklus SPMI PPEPP, dan Standar Al-Islam & Kemuhammadiyahan (AIK) serta kekhasan UNIMEN (Agropreneurship & Edutech).`,
    });

    return res.json({
      success: true,
      reply: response.text,
    });
  } catch (error: any) {
    console.error('AI Chat Error:', error);
    return res.status(500).json({ error: error.message || 'Gagal memproses asisten AI' });
  }
});

// Setup Vite or static serving
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
    app.use('*', async (req, res, next) => {
      const url = req.originalUrl;
      try {
        let template = fs.readFileSync(path.resolve(__dirname, 'index.html'), 'utf-8');
        template = await vite.transformIndexHtml(url, template);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      } catch (e) {
        next(e);
      }
    });
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`SIAMI UNIMEN Server is running at http://0.0.0.0:${port}`);
  });
}

startServer();
