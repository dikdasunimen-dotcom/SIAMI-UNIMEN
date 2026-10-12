import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Sparkles,
  Send,
  X,
  Bot,
  User,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  BookOpen,
  ArrowRight,
  RefreshCw
} from 'lucide-react';

interface AIAssistantDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

export const AIAssistantDrawer: React.FC<AIAssistantDrawerProps> = ({ isOpen, onClose }) => {
  const { askAIAssistant, currentUser, audits, findings, standards } = useApp();

  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: `Assalamu'alaikum wr. wb. Saya Asisten AI Auditor Mutu Internal SIAMI Universitas Muhammadiyah Enrekang.

Saya siap membantu Anda dalam:
1. Membaca dan menganalisis kecukupan dokumen bukti audit digital.
2. Menganalisis akar masalah (Root Cause 5-Whys & Fishbone).
3. Merumuskan rekomendasi perbaikan SMART (Corrective Action Plan).
4. Menyusun ringkasan eksekutif laporan AMI untuk RTM & Rektor.
5. Memprediksi risiko akreditasi (LAM / BAN-PT) berdasarkan Permendiktisaintek No. 39 Tahun 2025.

Silakan pilih topik cepat di bawah atau ketikkan pertanyaan Anda.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const quickPrompts = [
    'Bagaimana ketentuan Standar Kompetensi Lulusan (CPL) dalam Permendiktisaintek 39/2025?',
    'Buatkan analisis 5-Whys untuk temuan belum adanya rubrik penilaian OBE di LMS.',
    'Apa saja bukti wajib untuk Standar AIK dan Agropreneurship UNIMEN?',
    'Prediksi risiko akreditasi jika rasio dosen bergelar S3 baru 25%.',
    'Bagaimana prosedur RTM tingkat Universitas dalam siklus PPEPP?',
  ];

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputMessage;
    if (!text.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMsg]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await askAIAssistant(text, {
        userRole: currentUser.role,
        userName: currentUser.name,
        unitName: currentUser.unitName,
        totalAudits: audits.length,
        totalFindings: findings.length,
        totalStandards: standards.length,
      });

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'assistant',
        text: response,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages(prev => [...prev, aiMsg]);
    } catch (err) {
      console.error(err);
      const errorMsg: ChatMessage = {
        id: `ai-err-${Date.now()}`,
        sender: 'assistant',
        text: 'Maaf, terjadi gangguan komunikasi dengan server AI. Silakan coba kembali sesaat lagi.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/40 backdrop-blur-xs flex justify-end">
      <div className="w-full max-w-lg bg-white h-full shadow-2xl flex flex-col border-l border-slate-200 animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-emerald-800 to-teal-800 text-white flex items-center justify-between shrink-0 shadow-sm">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center text-amber-300">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="font-bold text-sm tracking-tight">SIAMI AI Auditor Assistant</h3>
              <p className="text-[11px] text-emerald-200">
                Pakar SPMI, Permendiktisaintek 39/2025 & AIK UNIMEN
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-emerald-100 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Chat History */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
          {messages.map(msg => {
            const isAI = msg.sender === 'assistant';

            return (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${isAI ? 'justify-start' : 'justify-end'}`}
              >
                {isAI && (
                  <div className="w-7 h-7 rounded-lg bg-emerald-700 text-white flex items-center justify-center shrink-0 text-xs font-bold shadow-xs">
                    <Sparkles className="w-4 h-4 text-amber-300" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] rounded-2xl p-3.5 leading-relaxed whitespace-pre-line text-xs shadow-xs ${
                    isAI
                      ? 'bg-slate-50 border border-slate-200 text-slate-800'
                      : 'bg-emerald-700 text-white'
                  }`}
                >
                  {msg.text}
                  <div
                    className={`mt-1.5 text-[10px] text-right font-medium ${
                      isAI ? 'text-slate-400' : 'text-emerald-200'
                    }`}
                  >
                    {msg.timestamp}
                  </div>
                </div>

                {!isAI && (
                  <div className="w-7 h-7 rounded-lg bg-slate-800 text-white flex items-center justify-center shrink-0 text-xs font-bold shadow-xs">
                    {currentUser.name.charAt(0)}
                  </div>
                )}
              </div>
            );
          })}

          {isLoading && (
            <div className="flex gap-2.5 items-center text-slate-500 text-xs italic">
              <div className="w-7 h-7 rounded-lg bg-emerald-700 text-white flex items-center justify-center shrink-0">
                <Sparkles className="w-4 h-4 text-amber-300 animate-spin" />
              </div>
              <span className="p-3 bg-slate-50 rounded-2xl border border-slate-200 animate-pulse">
                Asisten AI sedang menganalisis dokumen dan regulasi...
              </span>
            </div>
          )}
        </div>

        {/* Quick Prompts */}
        <div className="p-3 border-t border-slate-100 bg-slate-50/70 space-y-1.5 shrink-0">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Pertanyaan Rekomendasi:
          </p>
          <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
            {quickPrompts.map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(prompt)}
                className="text-[11px] px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:border-emerald-400 hover:bg-emerald-50 text-slate-700 text-left transition truncate max-w-full"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>

        {/* Input Bar */}
        <div className="p-3 bg-white border-t border-slate-200 shrink-0">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              placeholder="Tanyakan analisis bukti, standar SPMI, atau rekomendasi temuan..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              className="flex-1 px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50 focus:bg-white transition"
            />
            <button
              type="submit"
              disabled={isLoading || !inputMessage.trim()}
              className="p-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold transition disabled:opacity-50 shadow-xs"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
