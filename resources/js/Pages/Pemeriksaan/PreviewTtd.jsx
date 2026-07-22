import LabkesdaLayout from '@/Layouts/LabkesdaLayout';
import { Head, Link, usePage } from '@inertiajs/react';
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
const BSRE_LOGO_PATH = '/images/logo-bsre.png';

const generateTteVisualization = async ({
  qrPayload,
  signerName,
  signerPosition,
}) => {
  const loadImage = (source) =>
    new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = reject;
      image.src = source;
    });

  const qrDataUrl = await QRCode.toDataURL(qrPayload, {
    width: 560,
    margin: 2,
    errorCorrectionLevel: 'M',
  });

  const qrImage = await loadImage(qrDataUrl);

  let bsreLogo = null;

  try {
    bsreLogo = await loadImage(BSRE_LOGO_PATH);
  } catch {
    bsreLogo = null;
  }

  const canvas = document.createElement('canvas');
  canvas.width = 1180;
  canvas.height = 452;
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('Canvas context tidak tersedia.');
  }

  const drawRoundedRect = (x, y, width, height, radius) => {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
  };

  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 4;
  ctx.fillStyle = '#FFFFFF';
  drawRoundedRect(2, 2, canvas.width - 4, canvas.height - 4, 16);
  ctx.fill();
  ctx.stroke();

  const qrFrameX = 14;
  const qrFrameY = 14;
  const qrFrameSize = 412;
  const qrPadding = 8;
  const qrTop = qrFrameY;
  const qrBottom = qrFrameY + qrFrameSize;
  const contentX = 438;
  const contentWidth = canvas.width - contentX - 20;
  let certificateTextY = qrBottom - 30;

  drawRoundedRect(qrFrameX, qrFrameY, qrFrameSize, qrFrameSize, 10);
  ctx.strokeStyle = '#E2E8F0';
  ctx.lineWidth = 2;
  ctx.fillStyle = '#FFFFFF';
  ctx.fill();
  ctx.stroke();

  ctx.drawImage(
    qrImage,
    qrFrameX + qrPadding,
    qrFrameY + qrPadding,
    qrFrameSize - qrPadding * 2,
    qrFrameSize - qrPadding * 2,
  );

  ctx.textBaseline = 'top';

  ctx.fillStyle = '#111827';
  ctx.font = 'bold 38px Arial';
  ctx.fillText('Ditandatangani Secara Elektronik Oleh:', contentX, qrTop);

  ctx.fillStyle = '#1F2937';
  ctx.font = 'bold 36px Arial';
  ctx.fillText(signerPosition || 'Jabatan Penandatangan', contentX, qrTop + 58);

  if (bsreLogo) {
    const logoWidth = 220;
    const logoHeight = 76;
    const logoX = contentX + (contentWidth - logoWidth) / 2;
    const logoY = qrTop + 142;

    drawRoundedRect(
      logoX - 12,
      logoY - 12,
      logoWidth + 24,
      logoHeight + 24,
      10,
    );
    ctx.fillStyle = '#F8FAFC';
    ctx.fill();
    ctx.strokeStyle = '#CBD5E1';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.drawImage(bsreLogo, logoX, logoY, logoWidth, logoHeight);

    certificateTextY = logoY + logoHeight + 22;
  }

  ctx.fillStyle = '#334155';
  ctx.font = 'bold 24px Arial';
  ctx.fillText('Nama Penandatangan:', contentX, qrBottom - 108);

  ctx.fillStyle = '#0F172A';
  ctx.font = 'bold 38px Arial';
  const signerNameText = signerName || '-';
  const signerNameY = qrBottom - 78;
  ctx.fillText(signerNameText, contentX, signerNameY);

  const signerNameWidth = ctx.measureText(signerNameText).width;
  const underlineMaxWidth = contentWidth;
  const underlineWidth = Math.min(signerNameWidth, underlineMaxWidth);
  const underlineY = signerNameY + 46;

  ctx.strokeStyle = '#0F172A';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(contentX, underlineY);
  ctx.lineTo(contentX + underlineWidth, underlineY);
  ctx.stroke();

  ctx.fillStyle = '#64748B';
  ctx.font = '24px Arial';
  ctx.fillText(
    'Sertifikat elektronik diterbitkan oleh BSrE',
    contentX,
    certificateTextY,
  );

  return canvas.toDataURL('image/png');
};

export default function PreviewTtd({ pemeriksaan }) {
  const user = usePage().props.auth?.user;
  const [openModalCredential, setOpenModalCredential] = useState(false);
  const [qrPositions, setQrPositions] = useState([]);
  const [activeStampId, setActiveStampId] = useState(null);
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
  const signerName = user?.name || 'Nama Penandatangan';
  const signerPosition = user?.jabatan || 'Jabatan Penandatangan';

  const defaultPdfUrl = useMemo(
    () => route('print.hasil-pemeriksaan', pemeriksaan.id),
    [pemeriksaan.id],
  );

  const signedPdfFileName = useMemo(() => {
    const registrationNumber = pemeriksaan.no_registrasi
      ? String(pemeriksaan.no_registrasi).replace(/[^A-Za-z0-9._-]+/g, '-')
      : `pemeriksaan-${pemeriksaan.id}`;

    return `hasil-pemeriksaan-${registrationNumber}.pdf`;
  }, [pemeriksaan.id, pemeriksaan.no_registrasi]);

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
    setQrPositions([]);
    setActiveStampId(null);
    setQrImage('');
    setSavedCredential(null);
    setGeneratedPdfUrl('');
    setIsDraggingStamp(false);
  }, [pemeriksaan.id]);

  useEffect(() => {
    let active = true;

    (async () => {
      const preview = await generateTteVisualization({
        qrPayload: `https://lab.balikpapan.go.id/verifikasi-ttd/${pemeriksaan.id}`,
        signerName,
        signerPosition,
      });

      if (active) {
        setTtePreviewImage(preview);
      }
    })();

    return () => {
      active = false;
    };
  }, [pemeriksaan.id, signerName, signerPosition]);

  const getPdfSizeMmFromPage = (pageNumber) => {
    const metric = pageMetrics[pageNumber];
    if (!metric) {
      return { widthMm: 210, heightMm: 297 };
    }

    const widthMm = (metric.widthPt * 25.4) / 72;
    const heightMm = (metric.heightPt * 25.4) / 72;

    return { widthMm, heightMm };
  };

  const createPositionFromEvent = (event, page, currentId = null) => {
    if (!pageContainerRef.current) {
      return null;
    }

    const rect = pageContainerRef.current.getBoundingClientRect();
    const xRatio = (event.clientX - rect.left) / rect.width;
    const yRatio = (event.clientY - rect.top) / rect.height;

    const safeXRatio = Math.max(0, Math.min(1, xRatio));
    const safeYRatio = Math.max(0, Math.min(1, yRatio));
    const { widthMm, heightMm } = getPdfSizeMmFromPage(currentPage);
    const xMm = safeXRatio * widthMm;
    const yMm = safeYRatio * heightMm;

    return {
      id: currentId || `${Date.now()}-${Math.random()}`,
      page,
      xRatio: safeXRatio,
      yRatio: safeYRatio,
      xMm,
      yMm,
    };
  };

  const handlePlaceQr = (event) => {
    if (!isPickMode) {
      return;
    }

    const newPosition = createPositionFromEvent(event, currentPage);

    if (!newPosition) {
      return;
    }

    setQrPositions((prev) => [...prev, newPosition]);
    setActiveStampId(newPosition.id);
  };

  const handleStampMouseDown = (event, stampId) => {
    if (!isPickMode) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    setActiveStampId(stampId);
    setIsDraggingStamp(true);
  };

  const handleStampMouseMove = (event) => {
    if (!isPickMode || !isDraggingStamp || !activeStampId) {
      return;
    }

    const movedPosition = createPositionFromEvent(
      event,
      currentPage,
      activeStampId,
    );

    if (!movedPosition) {
      return;
    }

    setQrPositions((prev) =>
      prev.map((position) =>
        position.id === activeStampId ? movedPosition : position,
      ),
    );
  };

  const handleStampMouseUp = () => {
    if (!isDraggingStamp) {
      return;
    }

    setIsDraggingStamp(false);
  };

  const handleRemoveActiveStamp = () => {
    if (!activeStampId) {
      return;
    }

    setQrPositions((prev) => {
      const nextPositions = prev.filter(
        (position) => position.id !== activeStampId,
      );
      setActiveStampId(
        nextPositions.length > 0
          ? nextPositions[nextPositions.length - 1].id
          : null,
      );
      return nextPositions;
    });

    setSavedCredential(null);
  };

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key !== 'Delete' || !activeStampId) {
        return;
      }

      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement ||
        event.target instanceof HTMLSelectElement
      ) {
        return;
      }

      event.preventDefault();
      handleRemoveActiveStamp();
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [activeStampId]);

  const handleSaveCredential = async (event) => {
    event.preventDefault();

    if (qrPositions.length === 0) {
      return;
    }

    setIsGeneratingQr(true);

    try {
      const qrPayload = `https://lab.balikpapan.go.id/verifikasi-ttd/${pemeriksaan.id}`;

      const generatedStamp = await generateTteVisualization({
        qrPayload,
        signerName,
        signerPosition,
      });
      const placements = qrPositions.map((position) => {
        const metric = pageMetrics[position.page];
        const pageWidthPt = metric?.widthPt ?? 595.28;
        const pageHeightPt = metric?.heightPt ?? 841.89;

        return {
          page: position.page,
          x_ratio: Number(position.xRatio.toFixed(6)),
          y_ratio: Number(position.yRatio.toFixed(6)),
          page_width_pt: Number(pageWidthPt.toFixed(2)),
          page_height_pt: Number(pageHeightPt.toFixed(2)),
        };
      });

      const firstPlacement = placements[0];

      const response = await axios.post(
        route('pemeriksaan.sign', pemeriksaan.id),
        {
          nik: credential.nik,
          passphrase: credential.passphrase,
          qr_page: firstPlacement?.page,
          qr_x_ratio: firstPlacement?.x_ratio,
          qr_y_ratio: firstPlacement?.y_ratio,
          qr_page_width_pt: firstPlacement?.page_width_pt,
          qr_page_height_pt: firstPlacement?.page_height_pt,
          placements,
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
        placementsCount: placements.length,
        payload: qrPayload,
      });
      setQrPositions([]);
      setActiveStampId(null);
      setIsDraggingStamp(false);
      setIsPickMode(false);
      setOpenModalCredential(false);
    } catch (error) {
      alert(
        'Terjadi kesalahan saat menandatangani PDF. Silakan periksa kredensial Anda dan coba lagi atau Gagal generate QR code. Silakan coba lagi.',
      );
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
                Pilih halaman, aktifkan mode atur, lalu tambahkan beberapa
                posisi TTE di halaman mana pun.
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
                className={`bg-blue-600 font-semibold text-white shadow-sm ring-1 ring-offset-1 hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-1`}
                onClick={() => setIsPickMode((prev) => !prev)}
              >
                {isPickMode ? 'Selesai Atur Posisi' : 'Pilih Posisi TTE'}
              </Button>
              {qrPositions.length > 0 && (
                <Button
                  size="sm"
                  className="font-semibold shadow-md ring-1"
                  onClick={() => setOpenModalCredential(true)}
                  disabled={isGeneratingQr}
                >
                  Tanda Tangan
                </Button>
              )}
            </div>
          </div>
          {qrPositions.length > 0 && (
            <p className="mt-2 text-xs text-slate-600">
              Total posisi TTE: {qrPositions.length}
              {activeStampId ? ' • 1 posisi sedang dipilih' : ''}
            </p>
          )}
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

              {qrPositions
                .filter((position) => position.page === currentPage)
                .map((position) => (
                  <img
                    key={position.id}
                    src={qrImage || ttePreviewImage}
                    alt="Visualisasi TTE"
                    className={`absolute -translate-x-1/2 -translate-y-1/2 border bg-white shadow-sm ${isPickMode ? 'cursor-move' : 'pointer-events-none'} ${
                      activeStampId === position.id
                        ? 'border-blue-500 ring-2 ring-blue-200'
                        : 'border-slate-300'
                    }`}
                    style={{
                      left: `${position.xRatio * 100}%`,
                      top: `${position.yRatio * 100}%`,
                      width: `${(STAMP_WIDTH_MM / getPdfSizeMmFromPage(currentPage).widthMm) * 100}%`,
                      height: `${(STAMP_HEIGHT_MM / getPdfSizeMmFromPage(currentPage).heightMm) * 100}%`,
                    }}
                    onMouseDown={(event) =>
                      handleStampMouseDown(event, position.id)
                    }
                    onClick={(event) => {
                      event.stopPropagation();
                      setActiveStampId(position.id);
                    }}
                    draggable={false}
                  />
                ))}
            </div>
          </div>
        </div>

        {savedCredential && (
          <div className="rounded border border-green-200 bg-green-50 p-3 text-sm text-green-800">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p>
                Berhasil simpan tanda tangan pada{' '}
                {savedCredential.placementsCount} posisi dengan NIK{' '}
                {savedCredential.nik}.
              </p>
              <div className="flex flex-wrap gap-2">
                {generatedPdfUrl && (
                  <a href={generatedPdfUrl} download={signedPdfFileName}>
                    <Button
                      size="sm"
                      className="bg-green-700 font-semibold text-white hover:bg-green-800 focus:ring-green-500"
                    >
                      Download PDF
                    </Button>
                  </a>
                )}
                <Link href={route('pemeriksaan.show', pemeriksaan.id)}>
                  <Button size="sm" color="light">
                    Kembali ke Hasil Pemeriksaan
                  </Button>
                </Link>
              </div>
            </div>
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
