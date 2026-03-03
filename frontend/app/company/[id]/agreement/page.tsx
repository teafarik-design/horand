'use client';
import { useEffect, useRef, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { agreementsApi, companiesApi } from '@/lib/api';
import { Agreement, Company } from '@/lib/types';
import AuthGuard from '@/components/layout/AuthGuard';
import Navbar from '@/components/layout/Navbar';
import Modal from '@/components/ui/Modal';
import { getApiUrl, formatDate } from '@/lib/utils';
import { ArrowLeft, FileText, Download, PenTool, RefreshCw, Trash2 } from 'lucide-react';
import SignatureCanvas from 'react-signature-canvas';

export default function AgreementPage() {
  const params = useParams();
  const companyId = params.id as string;
  const [company, setCompany] = useState<Company | null>(null);
  const [agreements, setAgreements] = useState<Agreement[]>([]);
  const [currentHtml, setCurrentHtml] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [signModalOpen, setSignModalOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [agreementToSign, setAgreementToSign] = useState<Agreement | null>(null);
  const sigRef = useRef<SignatureCanvas>(null);

  const load = async () => {
    try {
      const [compRes, agreeRes] = await Promise.all([companiesApi.get(companyId), agreementsApi.list(companyId)]);
      setCompany(compRes.data);
      setAgreements(agreeRes.data);
    } catch { toast.error('Помилка завантаження'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [companyId]);

  const generate = async () => {
    setGenerating(true);
    try {
      const res = await agreementsApi.generate(companyId);
      setCurrentHtml(res.data.html);
      setAgreements(prev => [res.data.agreement, ...prev]);
      setPreviewOpen(true);
      toast.success('Договір сформовано!');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Помилка генерації');
    } finally { setGenerating(false); }
  };

  const exportPdf = async (agreementId: string, signature?: string) => {
    setExporting(true);
    try {
      const res = await agreementsApi.exportPdf(companyId, agreementId, signature);
      const url = getApiUrl(res.data.pdfUrl);
      window.open(url, '_blank');
      toast.success('Договір експортовано!');
      load();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Помилка експорту');
    } finally { setExporting(false); setSignModalOpen(false); setAgreementToSign(null); }
  };

  const handleSignAndExport = async () => {
    if (!agreementToSign) return;
    if (!sigRef.current || sigRef.current.isEmpty()) {
      // Export without signature
      await exportPdf(agreementToSign.id);
      return;
    }
    const signatureData = sigRef.current.toDataURL('image/png');
    await exportPdf(agreementToSign.id, signatureData);
  };

  const latestAgreement = agreements[0];

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="max-w-3xl mx-auto px-4 sm:px-6 pt-24 pb-12">
          <Link href={`/company/${companyId}`} className="btn-ghost mb-6 -ml-2">
            <ArrowLeft className="w-4 h-4" /> {company?.name}
          </Link>

          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="font-display font-bold text-2xl text-gray-900">Договір про співпрацю</h1>
              <p className="text-gray-500 text-sm mt-0.5">{agreements.length} версій</p>
            </div>
            <button onClick={generate} disabled={generating} className="btn-primary">
              {generating ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <><RefreshCw className="w-4 h-4" /> Сформувати</>}
            </button>
          </div>

          {loading ? (
            <div className="flex justify-center py-12"><div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" /></div>
          ) : agreements.length === 0 ? (
            <div className="card p-10 text-center">
              <div className="w-16 h-16 bg-purple-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-purple-400" />
              </div>
              <h3 className="font-display font-bold text-gray-900 mb-2">Договір ще не сформовано</h3>
              <p className="text-gray-500 text-sm mb-6">Натисніть «Сформувати» щоб автоматично створити договір на основі даних компанії</p>
              <button onClick={generate} disabled={generating} className="btn-primary mx-auto">
                {generating ? '...' : 'Сформувати договір'}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {agreements.map((agreement, i) => (
                <div key={agreement.id} className={`card p-5 ${i === 0 ? 'ring-2 ring-purple-200' : ''}`}>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-display font-bold text-gray-900">Версія {agreement.version}</h3>
                        {i === 0 && <span className="badge bg-purple-100 text-purple-700">Поточна</span>}
                        <span className={`badge ${agreement.status === 'SIGNED' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                          {agreement.status === 'DRAFT' ? 'Чернетка' : agreement.status === 'SIGNED' ? 'Підписано' : 'Архів'}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500">{formatDate(agreement.createdAt)}</p>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      {i === 0 && (
                        <button onClick={async () => {
                          if (!currentHtml) {
                            // Regenerate preview HTML for existing agreement
                            setGenerating(true);
                            try {
                              const res = await agreementsApi.generate(companyId);
                              setCurrentHtml(res.data.html);
                              setAgreements(prev => [res.data.agreement, ...prev.slice(1)]);
                              setPreviewOpen(true);
                            } catch {
                              toast.error('Помилка завантаження перегляду');
                            } finally { setGenerating(false); }
                          } else {
                            setPreviewOpen(true);
                          }
                        }} className="btn-secondary text-xs px-3 py-1.5">
                          <FileText className="w-3.5 h-3.5" /> Переглянути
                        </button>
                      )}
                      <button onClick={() => { setAgreementToSign(agreement); setSignModalOpen(true); }} className="btn-primary text-xs px-3 py-1.5" disabled={exporting}>
                        <Download className="w-3.5 h-3.5" /> PDF
                      </button>
                    </div>
                  </div>
                  {agreement.pdfUrl && (
                    <div className="mt-3 flex items-center gap-2">
                      <a href={getApiUrl(agreement.pdfUrl)} target="_blank" rel="noopener noreferrer" className="text-xs text-purple-600 hover:underline flex items-center gap-1">
                        <Download className="w-3 h-3" /> Завантажити PDF
                      </a>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Preview Modal */}
      {previewOpen && currentHtml && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setPreviewOpen(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl h-[85vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="font-display font-bold text-gray-900">Перегляд договору</h2>
              <div className="flex gap-2">
                <button onClick={() => { 
                  const target = agreements[0];
                  if (target) setAgreementToSign(target);
                  setPreviewOpen(false); 
                  setSignModalOpen(true); 
                }} className="btn-primary text-sm">
                  <PenTool className="w-4 h-4" /> Підписати та експортувати PDF
                </button>
                <button onClick={() => setPreviewOpen(false)} className="btn-ghost text-sm">Закрити</button>
              </div>
            </div>
            <iframe srcDoc={currentHtml} className="flex-1 rounded-b-2xl" />
          </div>
        </div>
      )}

      {/* Sign Modal */}
      <Modal isOpen={signModalOpen} onClose={() => { setSignModalOpen(false); setAgreementToSign(null); }} title="Підписати договір та експортувати PDF">
        <div className="space-y-4">
          <p className="text-sm text-gray-600">Намалюйте підпис мишкою або доторком (опційно)</p>
          <div className="border-2 border-gray-200 rounded-xl overflow-hidden">
            <SignatureCanvas
              ref={sigRef}
              canvasProps={{ width: 400, height: 160, className: 'w-full' }}
              backgroundColor="white"
            />
          </div>
          <div className="flex gap-3">
            <button onClick={() => sigRef.current?.clear()} className="btn-ghost text-sm">
              <Trash2 className="w-3.5 h-3.5" /> Очистити
            </button>
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={() => { setSignModalOpen(false); setAgreementToSign(null); }} className="btn-secondary flex-1 justify-center">Скасувати</button>
            <button onClick={() => handleSignAndExport()} disabled={exporting || !agreementToSign} className="btn-primary flex-1 justify-center">
              {exporting ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <><Download className="w-4 h-4" /> Експортувати PDF</>}
            </button>
          </div>
        </div>
      </Modal>
    </AuthGuard>
  );
}
