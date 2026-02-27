import LabkesdaLayout from '@/Layouts/LabkesdaLayout';
import { Head } from '@inertiajs/react';
import axios from 'axios';
import {
  Button,
  Label,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  TextInput,
} from 'flowbite-react';
import QRCode from 'qrcode';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString();

const STAMP_WIDTH_MM = 56;
const STAMP_HEIGHT_MM = 22;

const generateTteVisualization = async ({ qrPayload, nik }) => {
  const qrDataUrl = await QRCode.toDataURL(qrPayload, {
    width: 220,
    margin: 0,
  });

  const qrImage = await new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = qrDataUrl;
  });

  const canvas = document.createElement('canvas');
  canvas.width = 850;
  canvas.height = 250;
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('Canvas context tidak tersedia.');
  }

  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = '#D1D5DB';
  ctx.lineWidth = 4;
  ctx.strokeRect(2, 2, canvas.width - 4, canvas.height - 4);

  ctx.drawImage(qrImage, 24, 24, 200, 200);

  ctx.fillStyle = '#1F2937';
  ctx.font = '30px Arial';
  ctx.fillText('Dokumen ini telah ditandatangani', 350, 60);
  ctx.fillText('secara elektronik menggunakan', 350, 95);
  ctx.fillText('sertifikat elektronik yang diterbitkan', 350, 130);
  ctx.fillText('oleh BSrE', 350, 165);

  ctx.fillStyle = '#6B7280';
  ctx.font = '18px Arial';
  ctx.fillText(`NIK: ${nik || '-'}`, 350, 230);

  ctx.fillStyle = '#0EA5E9';
  ctx.beginPath();
  ctx.arc(690, 290, 38, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 11px Arial';
  ctx.fillText('Balai', 670, 282);
  ctx.fillText('Sertifikasi', 658, 296);
  ctx.fillText('Elektronik', 663, 310);

  return canvas.toDataURL('image/png');
};

export default function PreviewTtd({ pemeriksaan }) {
  const [openModalCredential, setOpenModalCredential] = useState(false);
  const [qrPosition, setQrPosition] = useState(null);
  const [isPickMode, setIsPickMode] = useState(false);
  const [isDraggingStamp, setIsDraggingStamp] = useState(false);
  const [credential, setCredential] = useState({
    nik: '',
    passphrase: '',
  });
  const [savedCredential, setSavedCredential] = useState(null);
  const [qrImage, setQrImage] = useState('');
  const [ttePreviewImage, setTtePreviewImage] = useState('');
  const [isGeneratingQr, setIsGeneratingQr] = useState(false);
  const [generatedPdfUrl, setGeneratedPdfUrl] = useState('');
  const [numPages, setNumPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageMetrics, setPageMetrics] = useState({});
  const pageContainerRef = useRef(null);

  const defaultPdfUrl = useMemo(
    () => route('print.hasil-pemeriksaan', pemeriksaan.id),
    [pemeriksaan.id],
  );

  const pdfUrl = generatedPdfUrl || defaultPdfUrl;

  useEffect(() => {
    return () => {
      if (generatedPdfUrl) {
        URL.revokeObjectURL(generatedPdfUrl);
      }
    };
  }, [generatedPdfUrl]);

  useEffect(() => {
    setCurrentPage(1);
    setQrPosition(null);
    setQrImage('');
    setSavedCredential(null);
    setIsDraggingStamp(false);
  }, [pdfUrl]);

  useEffect(() => {
    let active = true;

    (async () => {
      const preview = await generateTteVisualization({
        qrPayload: `preview-${pemeriksaan.id}-${new Date().toISOString()}`,
        nik: 'PREVIEW',
      });

      if (active) {
        setTtePreviewImage(preview);
      }
    })();

    return () => {
      active = false;
    };
  }, [pemeriksaan.id]);

  const getPdfSizeMmFromPage = (pageNumber) => {
    const metric = pageMetrics[pageNumber];
    if (!metric) {
      return { widthMm: 210, heightMm: 297 };
    }

    const widthMm = (metric.widthPt * 25.4) / 72;
    const heightMm = (metric.heightPt * 25.4) / 72;

    return { widthMm, heightMm };
  };

  const handlePlaceQr = (event) => {
    if (!pageContainerRef.current) {
      return;
    }

    const rect = pageContainerRef.current.getBoundingClientRect();
    const xRatio = (event.clientX - rect.left) / rect.width;
    const yRatio = (event.clientY - rect.top) / rect.height;

    const safeXRatio = Math.max(0, Math.min(1, xRatio));
    const safeYRatio = Math.max(0, Math.min(1, yRatio));
    const { widthMm, heightMm } = getPdfSizeMmFromPage(currentPage);
    const xMm = safeXRatio * widthMm;
    const yMm = safeYRatio * heightMm;

    setQrPosition({
      page: currentPage,
      xRatio: safeXRatio,
      yRatio: safeYRatio,
      xMm,
      yMm,
    });
  };

  const handleStampMouseDown = (event) => {
    if (!isPickMode) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    setIsDraggingStamp(true);
  };

  const handleStampMouseMove = (event) => {
    if (!isPickMode || !isDraggingStamp) {
      return;
    }

    handlePlaceQr(event);
  };

  const handleStampMouseUp = () => {
    if (!isDraggingStamp) {
      return;
    }

    setIsDraggingStamp(false);
  };

  const handleSaveCredential = async (event) => {
    event.preventDefault();

    if (!qrPosition) {
      return;
    }

    setIsGeneratingQr(true);

    try {
      const qrPayload = JSON.stringify({
        pemeriksaan_id: pemeriksaan.id,
        no_registrasi: pemeriksaan.no_registrasi,
        nik: credential.nik,
        page: qrPosition.page,
        x_mm: Number(qrPosition.xMm.toFixed(2)),
        y_mm: Number(qrPosition.yMm.toFixed(2)),
        generated_at: new Date().toISOString(),
      });

      const generatedStamp = await generateTteVisualization({
        qrPayload,
        nik: credential.nik,
      });
      const metric = pageMetrics[qrPosition.page];
      const pageWidthPt = metric?.widthPt ?? 595.28;
      const pageHeightPt = metric?.heightPt ?? 841.89;

      const response = await axios.post(
        route('pemeriksaan.sign', pemeriksaan.id),
        {
          nik: credential.nik,
          passphrase: credential.passphrase,
          qr_page: qrPosition.page,
          qr_x_ratio: Number(qrPosition.xRatio.toFixed(6)),
          qr_y_ratio: Number(qrPosition.yRatio.toFixed(6)),
          qr_page_width_pt: Number(pageWidthPt.toFixed(2)),
          qr_page_height_pt: Number(pageHeightPt.toFixed(2)),
          qr_image: generatedStamp,
        },
        {
          responseType: 'blob',
        },
      );

      const pdfBlob = response.data;
      const previewObjectUrl = URL.createObjectURL(pdfBlob);

      if (generatedPdfUrl) {
        URL.revokeObjectURL(generatedPdfUrl);
      }

      setGeneratedPdfUrl(previewObjectUrl);
      setQrImage(generatedStamp);
      setSavedCredential({
        nik: credential.nik,
        hasPassphrase: credential.passphrase.length > 0,
        payload: qrPayload,
      });
      setIsPickMode(false);
      setOpenModalCredential(false);
    } catch (error) {
      alert(error.message || 'Gagal generate QR code. Silakan coba lagi.');
    } finally {
      setIsGeneratingQr(false);
    }
  };

  return (
    <LabkesdaLayout>
      <Head title="Preview TTD" />

      <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 pb-10 pt-6 sm:px-6 lg:px-8">
        <div className="rounded border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-lg font-semibold text-slate-900">
                Preview Hasil Pemeriksaan
              </h1>
              <p className="mt-1 text-sm text-slate-600">
                {isPickMode
                  ? 'Mode pilih posisi aktif. Klik area dokumen untuk menentukan posisi QR Code.'
                  : 'Pilih halaman dulu, lalu klik tombol Pilih Posisi QR untuk meletakkan QR.'}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="xs"
                color="gray"
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage <= 1}
              >
                Prev
              </Button>
              <span className="text-sm text-slate-600">
                Halaman {currentPage} / {numPages || 1}
              </span>
              <Button
                size="xs"
                color="gray"
                onClick={() =>
                  setCurrentPage((prev) => Math.min(numPages || 1, prev + 1))
                }
                disabled={currentPage >= (numPages || 1)}
              >
                Next
              </Button>
              <Button
                size="sm"
                color={isPickMode ? 'failure' : 'blue'}
                onClick={() => {
                  setIsPickMode((prev) => {
                    const next = !prev;
                    if (next && !qrPosition) {
                      const { widthMm, heightMm } =
                        getPdfSizeMmFromPage(currentPage);
                      setQrPosition({
                        page: currentPage,
                        xRatio: 0.5,
                        yRatio: 0.5,
                        xMm: widthMm / 2,
                        yMm: heightMm / 2,
                      });
                    }

                    return next;
                  });
                }}
              >
                {isPickMode ? 'Selesai Atur Posisi' : 'Pilih Posisi TTE'}
              </Button>
              {qrPosition && (
                <Button
                  size="sm"
                  color="success"
                  onClick={() => setOpenModalCredential(true)}
                  disabled={isGeneratingQr}
                >
                  Simpan Tanda Tangan
                </Button>
              )}
            </div>
          </div>
        </div>

        <div
          className="relative min-h-[650px] overflow-auto rounded border border-slate-300 bg-slate-100 p-4 shadow-sm"
          style={{ height: 'calc(100vh - 260px)' }}
        >
          <div className="mx-auto w-fit">
            <div
              ref={pageContainerRef}
              className={`relative ${isPickMode ? 'cursor-crosshair' : 'cursor-default'}`}
              onClick={isPickMode ? handlePlaceQr : undefined}
              onMouseMove={isPickMode ? handleStampMouseMove : undefined}
              onMouseUp={handleStampMouseUp}
              onMouseLeave={handleStampMouseUp}
            >
              <Document
                file={pdfUrl}
                onLoadSuccess={({ numPages: loadedNumPages }) => {
                  setNumPages(loadedNumPages);
                  if (currentPage > loadedNumPages) {
                    setCurrentPage(loadedNumPages);
                  }
                }}
              >
                <Page
                  pageNumber={currentPage}
                  width={900}
                  renderTextLayer={false}
                  renderAnnotationLayer={false}
                  onLoadSuccess={(page) => {
                    const view = page.view || [0, 0, 595.28, 841.89];
                    const widthPt = view[2] - view[0];
                    const heightPt = view[3] - view[1];
                    setPageMetrics((prev) => ({
                      ...prev,
                      [currentPage]: { widthPt, heightPt },
                    }));
                  }}
                />
              </Document>

              {qrPosition && qrPosition.page === currentPage && (
                <img
                  src={qrImage || ttePreviewImage}
                  alt="Visualisasi TTE"
                  className={`absolute -translate-x-1/2 -translate-y-1/2 border border-slate-300 bg-white shadow-sm ${isPickMode ? 'cursor-move' : 'pointer-events-none'}`}
                  style={{
                    left: `${qrPosition.xRatio * 100}%`,
                    top: `${qrPosition.yRatio * 100}%`,
                    width: `${(STAMP_WIDTH_MM / getPdfSizeMmFromPage(currentPage).widthMm) * 100}%`,
                    height: `${(STAMP_HEIGHT_MM / getPdfSizeMmFromPage(currentPage).heightMm) * 100}%`,
                  }}
                  onMouseDown={handleStampMouseDown}
                  draggable={false}
                />
              )}
            </div>
          </div>
        </div>

        {savedCredential && qrPosition && (
          <div className="rounded border border-green-200 bg-green-50 p-3 text-sm text-green-800">
            Posisi QR tersimpan di halaman {qrPosition.page}, koordinat PDF ({' '}
            {qrPosition.xMm.toFixed(2)} mm, {qrPosition.yMm.toFixed(2)} mm )
            dengan NIK {savedCredential.nik}.
          </div>
        )}
      </div>

      <Modal
        show={openModalCredential}
        onClose={() => setOpenModalCredential(false)}
        size="md"
      >
        <ModalHeader>Input Kredensial Tanda Tangan</ModalHeader>
        <form onSubmit={handleSaveCredential}>
          <ModalBody>
            <div className="space-y-4">
              <div>
                <Label htmlFor="nik" value="NIK" />
                <TextInput
                  id="nik"
                  value={credential.nik}
                  onChange={(event) =>
                    setCredential((prev) => ({
                      ...prev,
                      nik: event.target.value,
                    }))
                  }
                  required
                />
              </div>
              <div>
                <Label htmlFor="passphrase" value="Passphrase" />
                <TextInput
                  id="passphrase"
                  type="password"
                  value={credential.passphrase}
                  onChange={(event) =>
                    setCredential((prev) => ({
                      ...prev,
                      passphrase: event.target.value,
                    }))
                  }
                  required
                />
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button color="gray" onClick={() => setOpenModalCredential(false)}>
              Batal
            </Button>
            <Button type="submit" disabled={isGeneratingQr}>
              Simpan
            </Button>
          </ModalFooter>
        </form>
      </Modal>
    </LabkesdaLayout>
  );
}
