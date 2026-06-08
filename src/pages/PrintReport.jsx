import { useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/config/supabase'
import { Button } from '@/components/ui/button'
import { QRCodeSVG } from 'qrcode.react'
import { useReactToPrint } from 'react-to-print'
import { ArrowLeft, Printer } from 'lucide-react'

export default function PrintReport() {
  const { id } = useParams()
  const navigate = useNavigate()
  const componentRef = useRef()

  const { data: report, isLoading, error } = useQuery({
    queryKey: ['report', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reports')
        .select(`
          *,
          students(full_name, japanese_name, student_id, photo_url, classes(name))
        `)
        .eq('id', id)
        .single()
      if (error) throw error
      return data
    }
  })

  const handlePrint = useReactToPrint({
    contentRef: componentRef,
    documentTitle: report ? `Rapot_${report.students?.full_name}` : 'Rapot',
  })

  if (isLoading) return <div className="p-8 text-center">Loading report data...</div>
  if (error || !report) return <div className="p-8 text-center text-red-500">Failed to load report or report not found.</div>

  const s = report.students

  const safeDate = (dateString, locale, options) => {
    if (!dateString) return '-'
    const d = new Date(dateString)
    if (isNaN(d.getTime())) return dateString
    return d.toLocaleDateString(locale, options)
  }

  const formatJapaneseTime = (timeStr) => {
    if (!timeStr) return '-';
    let jpStr = String(timeStr).replace(/WIB/i, '').trim();
    const match = jpStr.match(/^(\d{1,2})/);
    let prefix = '午前';
    if (match && parseInt(match[1]) >= 12) {
      prefix = '午後';
    }
    return `${prefix} ${jpStr} 時`;
  }

  const formatJapaneseMaterial = (mat) => {
    if (!mat) return '-';
    let jpMat = String(mat).toUpperCase();
    jpMat = jpMat.replace(/IRODORI/g, 'いろどり');
    jpMat = jpMat.replace(/MINNA NO NIHONGO/g, 'みんなの日本語');
    jpMat = jpMat.replace(/MARUGOTO/g, 'まるごと');
    jpMat = jpMat.replace(/BAB\s*([\d-]+)/g, '第$1課');
    return jpMat;
  }

  return (
    <div className="max-w-4xl mx-auto pb-12 space-y-6">
      <div className="flex items-center justify-between no-print">
        <Button variant="outline" onClick={() => navigate('/reports')}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Reports
        </Button>
        <Button onClick={() => handlePrint()}>
          <Printer className="w-4 h-4 mr-2" /> Print Report
        </Button>
      </div>

      {/* Printable Area */}
      <div className="bg-white shadow-lg print:shadow-none print:m-0 mx-auto" style={{ width: '210mm', minHeight: '297mm' }}>
        <div ref={componentRef} className="px-10 py-8 w-full h-full relative text-slate-900 bg-white">
          
          {/* Logo Watermark (Optional) */}
          <div className="absolute inset-0 z-0 flex items-center justify-center opacity-[0.03] pointer-events-none">
            <img src="/logo.png" alt="Watermark" className="w-[500px] object-contain" />
          </div>

          <div className="relative z-10">
            {/* Header */}
            <div className="flex items-start justify-between pb-4 mb-4">
              <div className="flex-none">
                <img src="/logo-rapot.png" alt="Logo BMU" className="w-[100px] h-[100px] object-contain flex-shrink-0" onError={(e) => e.target.style.display = 'none'} />
              </div>
              <div className="flex-1 text-center pt-2">
                <h1 className="text-lg font-bold text-slate-900 tracking-tight leading-snug">LAPORAN EVALUASI BULANAN BELAJAR</h1>
                <h1 className="text-lg font-bold text-slate-900 tracking-tight leading-snug">SISWA LPK SO BAHTERA MITRA UNGGULAN</h1>
                <p className="text-base font-bold text-slate-900 mt-1">学習月次評価レポートバテーテラミトラウングランの生徒</p>
              </div>
              <div className="flex-none text-center flex flex-col items-center">
                <QRCodeSVG value={`${window.location.origin}/verify/${report.verification_token}`} size={70} />
                <p className="text-[8px] text-slate-500 mt-1">Scan for Verification</p>
              </div>
            </div>

            {/* Student Info & Photo */}
            <div className="flex justify-between items-start mb-4 text-[13px] leading-tight">
              <div className="flex-1 space-y-1">
                <div className="grid grid-cols-[150px_10px_1fr] items-center mb-1">
                  <span className="font-bold uppercase">Nama Siswa</span>
                  <span>:</span>
                  <span className="font-bold uppercase">{s?.full_name}</span>
                </div>
                <div className="grid grid-cols-[150px_10px_1fr] items-center mb-1">
                  <span className="font-bold pl-8">生徒名前</span>
                  <span>:</span>
                  <span className="font-bold">{s?.japanese_name}</span>
                </div>

                <div className="grid grid-cols-[150px_10px_1fr] items-center mt-3 mb-1">
                  <span className="font-bold uppercase">Kelas</span>
                  <span>:</span>
                  <span className="font-bold uppercase">{s?.classes?.name}</span>
                </div>
                <div className="grid grid-cols-[150px_10px_1fr] items-center mb-1">
                  <span className="font-bold pl-8">クラス</span>
                  <span>:</span>
                  <span className="font-bold">{s?.classes?.name} クラス</span>
                </div>

                <div className="grid grid-cols-[150px_10px_1fr] items-center mt-3 mb-1">
                  <span className="font-bold uppercase">Periode Belajar</span>
                  <span>:</span>
                  <span className="font-bold uppercase">{safeDate(report.period_start, 'id-ID', {day: '2-digit', month: 'short', year: 'numeric'})} - {safeDate(report.period_end, 'id-ID', {day: '2-digit', month: 'short', year: 'numeric'})}</span>
                </div>
                <div className="grid grid-cols-[150px_10px_1fr] items-center mb-1">
                  <span className="font-bold pl-8">学習期間</span>
                  <span>:</span>
                  <span className="font-bold">{safeDate(report.period_start, 'ja-JP')} - {safeDate(report.period_end, 'ja-JP')}</span>
                </div>

                <div className="grid grid-cols-[150px_10px_1fr] items-center mt-3 mb-1">
                  <span className="font-bold uppercase">Jam Belajar</span>
                  <span>:</span>
                  <span className="font-bold uppercase">{report.study_time} {String(report.study_time).toLowerCase().includes('wib') ? '' : 'WIB'}</span>
                </div>
                <div className="grid grid-cols-[150px_10px_1fr] items-center mb-1">
                  <span className="font-bold pl-8">学習時間</span>
                  <span>:</span>
                  <span className="font-bold">{formatJapaneseTime(report.study_time)}</span>
                </div>

                <div className="grid grid-cols-[150px_10px_1fr] items-center mt-2 mb-1">
                  <span className="font-bold uppercase">Materi Belajar</span>
                  <span>:</span>
                  <span className="font-bold uppercase">{report.learning_material}</span>
                </div>
                <div className="grid grid-cols-[150px_10px_1fr] items-center mb-1">
                  <span className="font-bold pl-8">学習教材</span>
                  <span>:</span>
                  <span className="font-bold">{formatJapaneseMaterial(report.learning_material)}</span>
                </div>
              </div>
              
              <div className="flex-none ml-4 mt-1">
                {s?.photo_url ? (
                  <img src={s.photo_url} alt="Foto Siswa" className="w-[3.6cm] h-[4.8cm] object-cover border-2 border-slate-800" />
                ) : (
                  <div className="w-[3.6cm] h-[4.8cm] border-2 border-slate-800 flex items-center justify-center bg-slate-50 text-sm text-center text-slate-400">
                    3x4 Foto
                  </div>
                )}
              </div>
            </div>

            {/* Content Table Layout */}
            <div className="border-2 border-black border-collapse text-sm">
              
              {/* Hasil Ujian Section */}
              <div className="border-b-2 border-black">
                <div className="text-center font-bold py-1 border-b-2 border-black bg-slate-50">NILAI  結果</div>
                <div className="grid grid-cols-4 divide-x-2 divide-black text-center">
                  <div className="flex flex-col">
                    <div className="font-bold py-1 border-b-2 border-black bg-slate-50">KOSAKATA<br/>語彙</div>
                    <div className="py-2 text-lg font-bold flex items-center justify-center">
                      <span className={Number(report.score_kosakata) < 85 ? 'text-red-600' : ''}>
                        {report.score_kosakata}/100
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <div className="font-bold py-1 border-b-2 border-black bg-slate-50">HIRAGANA<br/>ひらがな</div>
                    <div className="py-2 text-lg font-bold flex items-center justify-center">
                      <span className={Number(report.score_hiragana) < 85 ? 'text-red-600' : ''}>
                        {report.score_hiragana}/100
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <div className="font-bold py-1 border-b-2 border-black bg-slate-50">KATAKANA<br/>カタカナ</div>
                    <div className="py-2 text-lg font-bold flex items-center justify-center">
                      <span className={Number(report.score_katakana) < 85 ? 'text-red-600' : ''}>
                        {report.score_katakana}/100
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <div className="font-bold py-1 border-b-2 border-black bg-slate-50">HASIL UJIAN<br/>試験結果</div>
                    <div className="py-2 text-lg font-bold flex items-center justify-center">
                      <span className={Number(report.score_ujian) < 85 ? 'text-red-600' : ''}>
                        {report.score_ujian}/100
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Middle Grid */}
              <div className="grid grid-cols-[1fr_120px_1fr] divide-x-2 divide-black">
                {/* Kehadiran */}
                <div className="flex flex-col">
                  <div className="text-center font-bold py-1 border-b border-black bg-slate-50">
                    KEHADIRAN (DALAM 1 BULAN)<br/>一ヶ月間の出席
                  </div>
                  <div className="grid grid-cols-3 divide-x border-b border-black text-center font-bold bg-slate-50">
                    <div className="py-1">SAKIT<br/>病気</div>
                    <div className="py-1">IJIN<br/>許可</div>
                    <div className="py-1">ALFA<br/>アルファ</div>
                  </div>
                  <div className="grid grid-cols-3 divide-x text-center font-bold flex-1 items-center justify-center py-4">
                    <div>{report.attendance_sakit === '0' ? '-' : report.attendance_sakit}</div>
                    <div>{report.attendance_ijin === '0' ? '-' : report.attendance_ijin}</div>
                    <div>{report.attendance_alfa === '0' ? '-' : report.attendance_alfa}</div>
                  </div>
                </div>

                {/* Perilaku */}
                <div className="flex flex-col">
                  <div className="text-center font-bold py-1 border-b border-black bg-slate-50">
                    PERILAKU<br/>態度
                  </div>
                  <div className="flex-1 flex items-center justify-center font-bold text-xl py-4">
                    {report.behavior}
                  </div>
                </div>

                {/* Catatan Guru */}
                <div className="flex flex-col">
                  <div className="text-center font-bold py-1 border-b border-black bg-slate-50">
                    CATATAN GURU<br/>先生ノート
                  </div>
                  <div className="p-2 text-center font-bold flex-1 flex items-center justify-center uppercase whitespace-pre-wrap">
                    {report.teacher_notes || '-'}
                  </div>
                </div>
              </div>

              {/* Bottom Grid */}
              <div className="grid grid-cols-[1fr_120px_1fr] divide-x-2 divide-black border-t-2 border-black">
                {/* Catatan Info & Tes Fisik */}
                <div className="flex flex-col divide-y-2 divide-black">
                  <div className="p-2 min-h-[60px]">
                    <div className="font-bold mb-1">CATATAN (ノート) :</div>
                    <div className="uppercase">{report.additional_notes || '-'}</div>
                  </div>
                  
                  <div className="flex flex-col">
                    <div className="text-center font-bold py-1 border-b border-black bg-slate-50">TES FISIK</div>
                    <div className="grid grid-cols-3 divide-x border-b border-black text-center font-bold bg-slate-50">
                      <div className="py-1">PUSH UP</div>
                      <div className="py-1">SIT UP</div>
                      <div className="py-1">LARI</div>
                    </div>
                    <div className="grid grid-cols-3 divide-x text-center font-bold py-2">
                      <div>{report.physical_push_up}</div>
                      <div>{report.physical_sit_up}</div>
                      <div>{report.physical_lari}</div>
                    </div>
                    <div className="text-xs p-1 border-t border-black bg-slate-50">Note: Lari Sprint selama 1 menit</div>
                  </div>
                </div>

                {/* Ket */}
                <div className="p-2 border-r-2 border-black col-span-2">
                  <div className="font-bold mb-2">Ket :</div>
                  <div className="text-sm space-y-1 ml-2">
                    <div>A = Amat Baik</div>
                    <div>B = Baik</div>
                    <div>C = Cukup</div>
                    <div>D = Kurang</div>
                  </div>
                </div>
              </div>

            </div>

            {/* Footer / Signatures */}
            <div className="mt-6 flex items-start justify-between text-[13px]">
              <div className="text-center w-40 flex flex-col h-[150px] pt-[22px]">
                <div>
                  <p className="font-bold mb-1">WALI SISWA</p>
                  <p className="font-bold">学生保護者</p>
                </div>
                <p className="font-bold uppercase mt-auto border-b border-black w-full pb-1 inline-block mx-auto" style={{maxWidth: '120px'}}>{report.guardian_name}</p>
              </div>

              <div className="text-center w-40 flex flex-col h-[150px] pt-[22px]">
                <div>
                  <p className="font-bold mb-1">GURU PENGAJAR</p>
                  <p className="font-bold">先生</p>
                </div>
                <p className="font-bold uppercase mt-auto border-b border-black w-full pb-1 inline-block mx-auto" style={{maxWidth: '120px'}}>{report.teacher_name}</p>
              </div>
              
              <div className="text-center w-40 flex flex-col h-[150px]">
                <div>
                  <p className="font-bold mb-1">MENGETAHUI</p>
                  <p className="font-bold mb-1">KEPALA SEKOLAH</p>
                  <p className="font-bold">校長</p>
                </div>
                <p className="font-bold uppercase mt-auto border-b border-black w-full pb-1 inline-block mx-auto" style={{maxWidth: '120px'}}>{report.headmaster_name}</p>
              </div>
            </div>

          </div>
        </div>
      </div>
      
      {/* Global Print Styles */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body {
            background: white;
          }
          @page {
            size: A4;
            margin: 0;
          }
        }
      `}} />
    </div>
  )
}
