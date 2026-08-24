import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
    X, 
    Camera, 
    RefreshCw, 
    Check, 
    Sparkles, 
    Crop, 
    AlertCircle,
    Loader2,
    RotateCw,
    Sliders,
    Move,
    ZoomIn,
    FileCheck
} from 'lucide-react';

export default function DocumentScannerModal({ isOpen, onClose, onScanComplete }) {
    const cameraInputRef = useRef(null);
    const svgContainerRef = useRef(null);
    const magnifierCanvasRef = useRef(null);
    const videoRef = useRef(null);
    const streamRef = useRef(null);

    // State Gambar
    const [originalImg, setOriginalImg] = useState(null);
    const [imgDimensions, setImgDimensions] = useState({ width: 800, height: 1000 });
    const [scannedResult, setScannedResult] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [mode, setMode] = useState('camera'); // 'camera', 'crop_adjust', 'preview'
    const [isLiveCameraActive, setIsLiveCameraActive] = useState(false);
    
    // 4 Sudut Utama (dalam koordinat pixel asli gambar)
    // 0: Top-Left, 1: Top-Right, 2: Bottom-Right, 3: Bottom-Left
    const [corners, setCorners] = useState([
        { x: 50, y: 50 },
        { x: 750, y: 50 },
        { x: 750, y: 950 },
        { x: 50, y: 950 }
    ]);

    // Handle yang sedang aktif disentuh (0-3: Corner, 4-7: Midpoint Edge, 'body': Geser semua)
    const [activeHandle, setActiveHandle] = useState(null);
    const [dragStartPoint, setDragStartPoint] = useState({ x: 0, y: 0 });
    const [initialCornersOnDrag, setInitialCornersOnDrag] = useState([]);
    
    // Magnifier / Kaca Pembesar (untuk HP agar jari tidak menutupi sudut gambar)
    const [magnifier, setMagnifier] = useState({ visible: false, x: 0, y: 0, touchX: 0, touchY: 0 });

    // Filter dokumen
    const [filterType, setFilterType] = useState('enhanced'); // 'original', 'enhanced', 'bw'

    // Reset saat modal dibuka/tutup
    useEffect(() => {
        if (!isOpen) {
            stopLiveCamera();
            setOriginalImg(null);
            setScannedResult(null);
            setMode('camera');
            setErrorMsg('');
            setActiveHandle(null);
            return;
        }

        // Coba nyalakan live camera jika browser mengizinkan (seperti di PC localhost/laptop)
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            startLiveCamera();
        }
    }, [isOpen]);

    // Nyalakan Live Webcam (untuk Laptop / PC)
    const startLiveCamera = async () => {
        setErrorMsg('');
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { width: { ideal: 1920 }, height: { ideal: 1080 } },
                audio: false
            });
            streamRef.current = stream;
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                videoRef.current.play();
                setIsLiveCameraActive(true);
            }
        } catch (err) {
            console.warn("Live camera not available on this device:", err);
            setIsLiveCameraActive(false);
        }
    };

    const stopLiveCamera = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(t => t.stop());
            streamRef.current = null;
        }
        setIsLiveCameraActive(false);
    };

    // Ambil Snapshot dari Live Webcam PC
    const captureFromWebcam = () => {
        if (!videoRef.current) return;
        const video = videoRef.current;
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth || 1280;
        canvas.height = video.videoHeight || 720;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
        stopLiveCamera();

        const img = new Image();
        img.onload = () => {
            setOriginalImg(img);
            setImgDimensions({ width: img.width, height: img.height });
            const autoCorners = detectDocumentCorners(img) || [
                { x: Math.round(img.width * 0.08), y: Math.round(img.height * 0.08) },
                { x: Math.round(img.width * 0.92), y: Math.round(img.height * 0.08) },
                { x: Math.round(img.width * 0.92), y: Math.round(img.height * 0.92) },
                { x: Math.round(img.width * 0.08), y: Math.round(img.height * 0.92) }
            ];
            setCorners(autoCorners);
            setMode('crop_adjust');
        };
        img.src = dataUrl;
    };

    // Hitung 4 Titik Tengah Sisi (Midpoints) untuk 8-Handler ala Dynamsoft
    const midpoints = [
        { x: (corners[0].x + corners[1].x) / 2, y: (corners[0].y + corners[1].y) / 2 }, // 4: Top Edge
        { x: (corners[1].x + corners[2].x) / 2, y: (corners[1].y + corners[2].y) / 2 }, // 5: Right Edge
        { x: (corners[2].x + corners[3].x) / 2, y: (corners[2].y + corners[3].y) / 2 }, // 6: Bottom Edge
        { x: (corners[3].x + corners[0].x) / 2, y: (corners[3].y + corners[0].y) / 2 }  // 7: Left Edge
    ];

    // Handle foto diambil dari Kamera HP / File Upload
    const handleImageSelected = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsProcessing(true);
        setErrorMsg('');

        const reader = new FileReader();
        reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
                const w = img.width;
                const h = img.height;
                setOriginalImg(img);
                setImgDimensions({ width: w, height: h });

                // Deteksi sudut awal dengan margin cerdas
                const autoCorners = detectDocumentCorners(img) || [
                    { x: Math.round(w * 0.08), y: Math.round(h * 0.08) },
                    { x: Math.round(w * 0.92), y: Math.round(h * 0.08) },
                    { x: Math.round(w * 0.92), y: Math.round(h * 0.92) },
                    { x: Math.round(w * 0.08), y: Math.round(h * 0.92) }
                ];

                setCorners(autoCorners);
                setMode('crop_adjust');
                setIsProcessing(false);
            };
            img.src = event.target.result;
        };
        reader.readAsDataURL(file);
    };

    // Deteksi Kontur Otomatis Tingkat Lanjut (Multi-Pass Canny + Adaptive Threshold)
    const detectDocumentCorners = (img) => {
        if (!window.cv) return null;
        try {
            const cv = window.cv;
            
            // Buat canvas skala optimasi (max lebar 800px) agar deteksi OpenCV cepat & akurat
            const scale = Math.min(1, 800 / Math.max(img.width, img.height));
            const processW = Math.round(img.width * scale);
            const processH = Math.round(img.height * scale);

            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = processW;
            tempCanvas.height = processH;
            const ctx = tempCanvas.getContext('2d');
            ctx.drawImage(img, 0, 0, processW, processH);

            const src = cv.imread(tempCanvas);
            const gray = new cv.Mat();
            const blurred = new cv.Mat();
            const edged = new cv.Mat();

            cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY);
            // Bilateral filter / GaussianBlur untuk menghaluskan tekstur kertas tanpa merusak garis tepi
            cv.GaussianBlur(gray, blurred, new cv.Size(5, 5), 0);

            // Coba multi-pass thresholding untuk menangkap kertas putih di latar belakang apapun
            const tryThresholds = [
                { cannyLow: 30, cannyHigh: 120 },
                { cannyLow: 50, cannyHigh: 200 },
                { cannyLow: 20, cannyHigh: 80 }
            ];

            let bestQuad = null;
            let maxArea = 0;

            for (const t of tryThresholds) {
                cv.Canny(blurred, edged, t.cannyLow, t.cannyHigh);

                // Dilate sedikit untuk menyambungkan garis putus-putus
                const kernel = cv.Mat.ones(3, 3, cv.CV_8U);
                cv.dilate(edged, edged, kernel);

                const contours = new cv.MatVector();
                const hierarchy = new cv.Mat();
                cv.findContours(edged, contours, hierarchy, cv.RETR_LIST, cv.CHAIN_APPROX_SIMPLE);

                for (let i = 0; i < contours.size(); ++i) {
                    const cnt = contours.get(i);
                    const area = cv.contourArea(cnt);
                    
                    // Kertas rekam medis minimal 12% dari luas layar foto
                    if (area > (processW * processH * 0.12) && area > maxArea) {
                        const peri = cv.arcLength(cnt, true);
                        const approx = new cv.Mat();
                        // Toleransi poligon 1.8% - 3.5% keliling
                        cv.approxPolyDP(cnt, approx, 0.025 * peri, true);

                        if (approx.rows === 4 && cv.isContourConvex(approx)) {
                            maxArea = area;
                            const pts = [];
                            for (let j = 0; j < 4; j++) {
                                pts.push({
                                    x: approx.data32S[j * 2] / scale,
                                    y: approx.data32S[j * 2 + 1] / scale
                                });
                            }
                            bestQuad = pts;
                        }
                        approx.delete();
                    }
                    cnt.delete();
                }

                kernel.delete();
                contours.delete();
                hierarchy.delete();

                if (bestQuad && maxArea > (processW * processH * 0.35)) {
                    break; // Ditemukan kontur kertas yang sangat dominan
                }
            }

            // Cleanup Mat
            src.delete();
            gray.delete();
            blurred.delete();
            edged.delete();

            if (bestQuad) {
                // Urutkan 4 titik: Top-Left, Top-Right, Bottom-Right, Bottom-Left
                bestQuad.sort((a, b) => a.y - b.y);
                const top = [bestQuad[0], bestQuad[1]].sort((a, b) => a.x - b.x);
                const bot = [bestQuad[2], bestQuad[3]].sort((a, b) => a.x - b.x);
                return [top[0], top[1], bot[1], bot[0]];
            }

            return null;
        } catch (err) {
            console.warn("Auto-detect fallback to default margin:", err);
            return null;
        }
    };

    // Konversi Client Touch/Mouse Coordinate ke SVG / Image Pixel Coordinate
    const getSvgCoordinates = (clientX, clientY) => {
        if (!svgContainerRef.current) return { x: 0, y: 0 };
        const rect = svgContainerRef.current.getBoundingClientRect();
        const scaleX = imgDimensions.width / rect.width;
        const scaleY = imgDimensions.height / rect.height;

        const x = Math.max(0, Math.min(imgDimensions.width, (clientX - rect.left) * scaleX));
        const y = Math.max(0, Math.min(imgDimensions.height, (clientY - rect.top) * scaleY));
        return { x, y };
    };

    // Render Kaca Pembesar (Magnifier / Loupe) saat jari menyentuh layar
    const updateMagnifierCanvas = (targetX, targetY) => {
        if (!originalImg || !magnifierCanvasRef.current) return;
        const canvas = magnifierCanvasRef.current;
        const ctx = canvas.getContext('2d');
        const zoom = 2.2;
        const size = canvas.width;

        ctx.clearRect(0, 0, size, size);
        ctx.save();
        ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
        ctx.clip();

        const sWidth = size / zoom;
        const sHeight = size / zoom;
        const sx = targetX - sWidth / 2;
        const sy = targetY - sHeight / 2;

        ctx.drawImage(originalImg, sx, sy, sWidth, sHeight, 0, 0, size, size);

        // Crosshair bidik tengah
        ctx.strokeStyle = '#BA1B1D';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(size / 2 - 12, size / 2);
        ctx.lineTo(size / 2 + 12, size / 2);
        ctx.moveTo(size / 2, size / 2 - 12);
        ctx.lineTo(size / 2, size / 2 + 12);
        ctx.stroke();

        ctx.restore();
    };

    // Start Drag Handle
    const handlePointerDown = (handleIndex, clientX, clientY) => {
        setActiveHandle(handleIndex);
        const svgPt = getSvgCoordinates(clientX, clientY);
        setDragStartPoint(svgPt);
        setInitialCornersOnDrag([...corners]);

        if (typeof handleIndex === 'number' && handleIndex < 4) {
            setMagnifier({
                visible: true,
                x: corners[handleIndex].x,
                y: corners[handleIndex].y,
                touchX: clientX,
                touchY: clientY
            });
            updateMagnifierCanvas(corners[handleIndex].x, corners[handleIndex].y);
        }
    };

    // Move Handle (Touch / Mouse move)
    const handlePointerMove = useCallback((clientX, clientY) => {
        if (activeHandle === null) return;
        const currentPt = getSvgCoordinates(clientX, clientY);
        const dx = currentPt.x - dragStartPoint.x;
        const dy = currentPt.y - dragStartPoint.y;

        setCorners(() => {
            const next = [...initialCornersOnDrag];

            if (activeHandle === 'body') {
                // Geser seluruh area poligon dokumen
                return next.map(c => ({
                    x: Math.max(0, Math.min(imgDimensions.width, c.x + dx)),
                    y: Math.max(0, Math.min(imgDimensions.height, c.y + dy))
                }));
            } else if (activeHandle >= 0 && activeHandle < 4) {
                // Geser 1 Sudut (Corner Handle)
                next[activeHandle] = {
                    x: Math.max(0, Math.min(imgDimensions.width, currentPt.x)),
                    y: Math.max(0, Math.min(imgDimensions.height, currentPt.y))
                };
                // Update magnifier
                setMagnifier(prev => ({
                    ...prev,
                    x: next[activeHandle].x,
                    y: next[activeHandle].y,
                    touchX: clientX,
                    touchY: clientY
                }));
                updateMagnifierCanvas(next[activeHandle].x, next[activeHandle].y);
            } else if (activeHandle === 4) {
                // Geser Sisi Atas (Top Edge: corners 0 & 1)
                next[0] = { ...next[0], y: Math.max(0, Math.min(imgDimensions.height, initialCornersOnDrag[0].y + dy)) };
                next[1] = { ...next[1], y: Math.max(0, Math.min(imgDimensions.height, initialCornersOnDrag[1].y + dy)) };
            } else if (activeHandle === 5) {
                // Geser Sisi Kanan (Right Edge: corners 1 & 2)
                next[1] = { ...next[1], x: Math.max(0, Math.min(imgDimensions.width, initialCornersOnDrag[1].x + dx)) };
                next[2] = { ...next[2], x: Math.max(0, Math.min(imgDimensions.width, initialCornersOnDrag[2].x + dx)) };
            } else if (activeHandle === 6) {
                // Geser Sisi Bawah (Bottom Edge: corners 2 & 3)
                next[2] = { ...next[2], y: Math.max(0, Math.min(imgDimensions.height, initialCornersOnDrag[2].y + dy)) };
                next[3] = { ...next[3], y: Math.max(0, Math.min(imgDimensions.height, initialCornersOnDrag[3].y + dy)) };
            } else if (activeHandle === 7) {
                // Geser Sisi Kiri (Left Edge: corners 3 & 0)
                next[3] = { ...next[3], x: Math.max(0, Math.min(imgDimensions.width, initialCornersOnDrag[3].x + dx)) };
                next[0] = { ...next[0], x: Math.max(0, Math.min(imgDimensions.width, initialCornersOnDrag[0].x + dx)) };
            }

            return next;
        });
    }, [activeHandle, dragStartPoint, initialCornersOnDrag, imgDimensions]);

    const handlePointerUp = () => {
        setActiveHandle(null);
        setMagnifier(prev => ({ ...prev, visible: false }));
    };

    // Eksekusi Perspective Transform (Crop & Flatten)
    const applyCropAndTransform = () => {
        if (!originalImg) return;
        setIsProcessing(true);

        setTimeout(() => {
            try {
                const img = originalImg;
                const cv = window.cv;

                const p0 = corners[0];
                const p1 = corners[1];
                const p2 = corners[2];
                const p3 = corners[3];

                // Hitung dimensi target persegi panjang
                const widthA = Math.hypot(p2.x - p3.x, p2.y - p3.y);
                const widthB = Math.hypot(p1.x - p0.x, p1.y - p0.y);
                const maxWidth = Math.max(widthA, widthB);

                const heightA = Math.hypot(p1.x - p2.x, p1.y - p2.y);
                const heightB = Math.hypot(p0.x - p3.x, p0.y - p3.y);
                const maxHeight = Math.max(heightA, heightB);

                if (cv) {
                    const src = cv.imread(img);
                    const srcCoords = cv.matFromArray(4, 1, cv.CV_32FC2, [
                        p0.x, p0.y,
                        p1.x, p1.y,
                        p2.x, p2.y,
                        p3.x, p3.y
                    ]);

                    const dstCoords = cv.matFromArray(4, 1, cv.CV_32FC2, [
                        0, 0,
                        maxWidth, 0,
                        maxWidth, maxHeight,
                        0, maxHeight
                    ]);

                    const M = cv.getPerspectiveTransform(srcCoords, dstCoords);
                    const dst = new cv.Mat();
                    cv.warpPerspective(src, dst, M, new cv.Size(maxWidth, maxHeight), cv.INTER_LINEAR, cv.BORDER_CONSTANT, new cv.Scalar());

                    const outCanvas = document.createElement('canvas');
                    cv.imshow(outCanvas, dst);

                    // Terapkan filter ketajaman teks
                    applyEnhanceFilter(outCanvas, filterType);

                    setScannedResult(outCanvas.toDataURL('image/jpeg', 0.94));

                    src.delete(); srcCoords.delete(); dstCoords.delete(); M.delete(); dst.delete();
                } else {
                    // Fallback
                    const canvas = document.createElement('canvas');
                    canvas.width = maxWidth;
                    canvas.height = maxHeight;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0);
                    setScannedResult(canvas.toDataURL('image/jpeg', 0.94));
                }

                setMode('preview');
            } catch (err) {
                console.error("Crop error:", err);
                setErrorMsg("Gagal melakukan crop perspektif. Menggunakan gambar penuh.");
                setScannedResult(originalImg.src);
                setMode('preview');
            } finally {
                setIsProcessing(false);
            }
        }, 80);
    };

    // Filter Adobe Scan / Clean Document
    const applyEnhanceFilter = (canvas, type) => {
        if (type === 'original') return;
        const ctx = canvas.getContext('2d');
        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const d = imgData.data;

        if (type === 'enhanced') {
            const contrast = 1.25;
            const brightness = 14;
            for (let i = 0; i < d.length; i += 4) {
                d[i] = Math.min(255, Math.max(0, (d[i] - 128) * contrast + 128 + brightness));
                d[i + 1] = Math.min(255, Math.max(0, (d[i + 1] - 128) * contrast + 128 + brightness));
                d[i + 2] = Math.min(255, Math.max(0, (d[i + 2] - 128) * contrast + 128 + brightness));
            }
        } else if (type === 'bw') {
            for (let i = 0; i < d.length; i += 4) {
                const avg = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
                const val = avg > 135 ? 255 : (avg < 85 ? 0 : avg * 1.2);
                d[i] = val;
                d[i + 1] = val;
                d[i + 2] = val;
            }
        }
        ctx.putImageData(imgData, 0, 0);
    };

    // Putar Dokumen (Rotate 90)
    const handleRotate = () => {
        if (!scannedResult) return;
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.height;
            canvas.height = img.width;
            const ctx = canvas.getContext('2d');
            ctx.translate(canvas.width / 2, canvas.height / 2);
            ctx.rotate((90 * Math.PI) / 180);
            ctx.drawImage(img, -img.width / 2, -img.height / 2);
            setScannedResult(canvas.toDataURL('image/jpeg', 0.94));
        };
        img.src = scannedResult;
    };

    // Konfirmasi dan Kirim File
    const handleConfirm = () => {
        if (!scannedResult) return;
        fetch(scannedResult)
            .then(res => res.blob())
            .then(blob => {
                const timestamp = new Date().getTime();
                const file = new File([blob], `Scan_Dokumen_RM_${timestamp}.jpg`, { type: 'image/jpeg' });
                onScanComplete(file);
                onClose();
            });
    };

    if (!isOpen) return null;

    const polygonPoints = `${corners[0].x},${corners[0].y} ${corners[1].x},${corners[1].y} ${corners[2].x},${corners[2].y} ${corners[3].x},${corners[3].y}`;
    const handleRadius = Math.max(14, Math.round(imgDimensions.width * 0.022));

    return (
        <div 
            className="fixed inset-0 z-[60] flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-md select-none animate-in fade-in duration-200"
            onMouseMove={activeHandle !== null ? (e) => handlePointerMove(e.clientX, e.clientY) : undefined}
            onMouseUp={handlePointerUp}
            onTouchMove={activeHandle !== null ? (e) => handlePointerMove(e.touches[0].clientX, e.touches[0].clientY) : undefined}
            onTouchEnd={handlePointerUp}
        >
            <div className="bg-slate-900 border border-slate-700/80 rounded-2xl max-w-xl w-full overflow-hidden shadow-2xl flex flex-col max-h-[96vh] text-white">
                
                {/* Header Modal */}
                <div className="px-4 py-3 bg-slate-800 border-b border-slate-700/80 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-red-600/20 border border-red-500/40 flex items-center justify-center text-red-400">
                            <Sparkles className="w-3.5 h-3.5" />
                        </div>
                        <div>
                            <h3 className="text-xs sm:text-sm font-bold text-slate-100 flex items-center gap-2">
                                Smart Scanner & Cropper
                                <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 bg-red-950 text-red-300 rounded border border-red-800">
                                    8-Handle Quad
                                </span>
                            </h3>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition cursor-pointer"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Input Kamera Tersembunyi */}
                <input
                    ref={cameraInputRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    className="hidden"
                    onChange={handleImageSelected}
                />

                {/* Body Content Area */}
                <div className="p-3 sm:p-4 flex-1 overflow-y-auto flex flex-col items-center justify-center bg-slate-950 relative">
                    
                    {errorMsg && (
                        <div className="w-full mb-3 p-2.5 bg-rose-950/70 border border-rose-800 rounded-xl text-xs text-rose-200 flex items-center gap-2">
                            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                            <span>{errorMsg}</span>
                        </div>
                    )}

                    {/* Step 1: Layar Awal (Live Webcam di PC / Native Capture di HP) */}
                    {mode === 'camera' && (
                        <div className="w-full flex flex-col items-center justify-center">
                            {isLiveCameraActive ? (
                                <div className="relative w-full max-w-sm aspect-[3/4] bg-black rounded-2xl overflow-hidden border border-slate-700 shadow-2xl flex flex-col items-center justify-center">
                                    <video
                                        ref={videoRef}
                                        playsInline
                                        autoPlay
                                        muted
                                        className="w-full h-full object-cover"
                                    />

                                    {/* Overlay Frame Pembidik Dokumen */}
                                    <div className="absolute inset-5 border-2 border-dashed border-red-400/70 rounded-xl pointer-events-none flex flex-col justify-between p-3">
                                        <div className="flex justify-between">
                                            <div className="w-4 h-4 border-t-3 border-l-3 border-red-500"></div>
                                            <div className="w-4 h-4 border-t-3 border-r-3 border-red-500"></div>
                                        </div>
                                        <div className="text-center">
                                            <span className="bg-slate-900/80 text-red-300 text-[10px] font-medium px-2.5 py-1 rounded-full border border-red-500/30">
                                                Arahkan dokumen ke bingkai
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <div className="w-4 h-4 border-b-3 border-l-3 border-red-500"></div>
                                            <div className="w-4 h-4 border-b-3 border-r-3 border-red-500"></div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="p-6 text-center flex flex-col items-center justify-center gap-4">
                                    <div className="w-20 h-20 rounded-3xl bg-red-950/50 border border-red-800/60 text-red-400 flex items-center justify-center shadow-2xl">
                                        <Camera className="w-10 h-10" />
                                    </div>

                                    <div>
                                        <h4 className="text-base font-bold text-slate-100">Scan Berkas Rekam Medis</h4>
                                        <p className="text-xs text-slate-400 mt-1 max-w-sm">
                                            Ambil foto dokumen. AI akan otomatis mengunci 4 sudut kertas dengan 8 titik handle dan kaca pembesar presisi.
                                        </p>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => cameraInputRef.current?.click()}
                                        className="mt-2 px-6 py-3 bg-[#BA1B1D] hover:bg-[#9E1618] active:scale-95 text-white text-xs font-bold rounded-2xl shadow-xl shadow-red-950/50 transition cursor-pointer flex items-center gap-2"
                                    >
                                        <Camera className="w-4 h-4" />
                                        <span>BUKA KAMERA / AMBIL FOTO</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Step 2: Layar 8-Handler Cropper Interaktif (Dynamsoft Model) */}
                    {mode === 'crop_adjust' && originalImg && (
                        <div className="flex flex-col items-center w-full relative">
                            
                            <div className="w-full flex items-center justify-between mb-2 px-1">
                                <p className="text-[11px] font-semibold text-slate-300 flex items-center gap-1">
                                    <Move className="w-3 h-3 text-red-400" />
                                    <span>Tarik bulatan merah / tepi untuk menyesuaikan kertas</span>
                                </p>
                                <span className="text-[10px] text-slate-500 font-mono">
                                    {imgDimensions.width}x{imgDimensions.height}px
                                </span>
                            </div>

                            {/* Container SVG Skala Penuh */}
                            <div className="relative w-full max-w-sm aspect-[3/4] bg-black rounded-xl overflow-hidden border border-slate-700 shadow-2xl touch-none flex items-center justify-center">
                                <svg
                                    ref={svgContainerRef}
                                    viewBox={`0 0 ${imgDimensions.width} ${imgDimensions.height}`}
                                    className="w-full h-full object-contain"
                                >
                                    {/* 1. Gambar Asli */}
                                    <image
                                        href={originalImg.src}
                                        width={imgDimensions.width}
                                        height={imgDimensions.height}
                                    />

                                    {/* 2. Area Luar Gelap (Masking Overlay) */}
                                    <path
                                        d={`M 0 0 L ${imgDimensions.width} 0 L ${imgDimensions.width} ${imgDimensions.height} L 0 ${imgDimensions.height} Z M ${corners[0].x} ${corners[0].y} L ${corners[3].x} ${corners[3].y} L ${corners[2].x} ${corners[2].y} L ${corners[1].x} ${corners[1].y} Z`}
                                        fill="rgba(0, 0, 0, 0.45)"
                                        fillRule="evenodd"
                                    />

                                    {/* 3. Area Poligon Dokumen (Dapat digeser seluruhnya) */}
                                    <polygon
                                        points={polygonPoints}
                                        fill="rgba(186, 27, 29, 0.12)"
                                        stroke="#EF4444"
                                        strokeWidth={Math.max(3, Math.round(imgDimensions.width * 0.004))}
                                        className="cursor-move"
                                        onMouseDown={(e) => handlePointerDown('body', e.clientX, e.clientY)}
                                        onTouchStart={(e) => handlePointerDown('body', e.touches[0].clientX, e.touches[0].clientY)}
                                    />

                                    {/* 4. Garis Bantu Diagonal Tipis */}
                                    <line
                                        x1={corners[0].x} y1={corners[0].y}
                                        x2={corners[2].x} y2={corners[2].y}
                                        stroke="rgba(255, 255, 255, 0.2)"
                                        strokeDasharray="4,4"
                                    />
                                    <line
                                        x1={corners[1].x} y1={corners[1].y}
                                        x2={corners[3].x} y2={corners[3].y}
                                        stroke="rgba(255, 255, 255, 0.2)"
                                        strokeDasharray="4,4"
                                    />

                                    {/* 5. Empat Titik Tengah Sisi (Midpoint Handles 4-7) */}
                                    {midpoints.map((pt, idx) => (
                                        <rect
                                            key={`mid-${idx}`}
                                            x={pt.x - handleRadius * 0.7}
                                            y={pt.y - handleRadius * 0.7}
                                            width={handleRadius * 1.4}
                                            height={handleRadius * 1.4}
                                            rx={handleRadius * 0.3}
                                            fill="#FFFFFF"
                                            stroke="#DC2626"
                                            strokeWidth={Math.max(2, Math.round(imgDimensions.width * 0.003))}
                                            className="cursor-pointer"
                                            onMouseDown={(e) => handlePointerDown(idx + 4, e.clientX, e.clientY)}
                                            onTouchStart={(e) => handlePointerDown(idx + 4, e.touches[0].clientX, e.touches[0].clientY)}
                                        />
                                    ))}

                                    {/* 6. Empat Titik Sudut Utama (Corner Handles 0-3) */}
                                    {corners.map((pt, idx) => (
                                        <g 
                                            key={`corner-${idx}`}
                                            className="cursor-pointer"
                                            onMouseDown={(e) => handlePointerDown(idx, e.clientX, e.clientY)}
                                            onTouchStart={(e) => handlePointerDown(idx, e.touches[0].clientX, e.touches[0].clientY)}
                                        >
                                            {/* Outer Ring */}
                                            <circle
                                                cx={pt.x}
                                                cy={pt.y}
                                                r={handleRadius * 1.4}
                                                fill="rgba(239, 68, 68, 0.3)"
                                            />
                                            {/* Main Solid Circle */}
                                            <circle
                                                cx={pt.x}
                                                cy={pt.y}
                                                r={handleRadius}
                                                fill="#BA1B1D"
                                                stroke="#FFFFFF"
                                                strokeWidth={Math.max(3, Math.round(imgDimensions.width * 0.004))}
                                            />
                                            {/* Center Dot */}
                                            <circle
                                                cx={pt.x}
                                                cy={pt.y}
                                                r={handleRadius * 0.3}
                                                fill="#FFFFFF"
                                            />
                                        </g>
                                    ))}
                                </svg>

                                {/* Kaca Pembesar Mengambang (Magnifier Loupe) */}
                                {magnifier.visible && (
                                    <div 
                                        className="absolute top-2 left-2 pointer-events-none z-50 rounded-full border-3 border-white shadow-2xl overflow-hidden bg-black animate-in zoom-in duration-100"
                                        style={{ width: 100, height: 100 }}
                                    >
                                        <canvas
                                            ref={magnifierCanvasRef}
                                            width={100}
                                            height={100}
                                            className="w-full h-full block"
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Step 3: Hasil Scan (Preview & Filter) */}
                    {mode === 'preview' && scannedResult && (
                        <div className="flex flex-col items-center w-full">
                            <div className="relative w-full max-w-sm aspect-[3/4] bg-black rounded-xl overflow-hidden border border-slate-700 flex items-center justify-center p-2 shadow-2xl">
                                {isProcessing ? (
                                    <div className="flex flex-col items-center gap-2 text-slate-300">
                                        <Loader2 className="w-7 h-7 animate-spin text-red-500" />
                                        <p className="text-xs">Memproses dokumen...</p>
                                    </div>
                                ) : (
                                    <img
                                        src={scannedResult}
                                        alt="Hasil Scan Dokumen"
                                        className="max-w-full max-h-full object-contain rounded shadow"
                                    />
                                )}
                            </div>
                        </div>
                    )}

                </div>

                {/* Footer Toolbar */}
                <div className="px-4 py-3 bg-slate-900 border-t border-slate-800 flex items-center justify-between gap-2">
                    {mode === 'camera' && isLiveCameraActive && (
                        <div className="w-full flex items-center justify-between gap-2">
                            <button
                                type="button"
                                onClick={() => cameraInputRef.current?.click()}
                                className="px-3 py-2 rounded-xl border border-slate-700 text-xs font-semibold text-slate-300 hover:bg-slate-800 transition"
                            >
                                Pilih dari File
                            </button>

                            <button
                                type="button"
                                onClick={captureFromWebcam}
                                className="px-6 py-2.5 bg-[#BA1B1D] hover:bg-[#9E1618] active:scale-95 text-white text-xs font-bold rounded-xl shadow-lg shadow-red-950/40 transition cursor-pointer flex items-center gap-2"
                            >
                                <Camera className="w-4 h-4" />
                                <span>FOTO DOKUMEN</span>
                            </button>
                        </div>
                    )}

                    {mode === 'crop_adjust' && (
                        <>
                            <button
                                type="button"
                                onClick={() => {
                                    if (isLiveCameraActive) {
                                        setMode('camera');
                                        startLiveCamera();
                                    } else {
                                        cameraInputRef.current?.click();
                                    }
                                }}
                                className="px-3 py-2 rounded-xl border border-slate-700 text-xs font-semibold text-slate-300 hover:bg-slate-800 transition cursor-pointer flex items-center gap-1"
                            >
                                <RefreshCw className="w-3.5 h-3.5" />
                                <span>Foto Ulang</span>
                            </button>

                            <button
                                type="button"
                                onClick={applyCropAndTransform}
                                disabled={isProcessing}
                                className="px-5 py-2.5 bg-[#BA1B1D] hover:bg-[#9E1618] active:scale-95 text-white text-xs font-bold rounded-xl shadow-lg shadow-red-950/40 transition cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                            >
                                <Crop className="w-4 h-4" />
                                <span>POTONG & LURUSKAN</span>
                            </button>
                        </>
                    )}

                    {mode === 'preview' && (
                        <>
                            <div className="flex items-center gap-1.5">
                                <button
                                    type="button"
                                    onClick={() => setMode('crop_adjust')}
                                    className="px-2.5 py-2 rounded-xl border border-slate-700 text-xs text-slate-300 hover:bg-slate-800 transition flex items-center gap-1"
                                    title="Sesuaikan Sudut Kembali"
                                >
                                    <Crop className="w-3.5 h-3.5" />
                                    <span>Sudut</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={handleRotate}
                                    className="p-2 rounded-xl border border-slate-700 text-xs text-slate-300 hover:bg-slate-800 transition"
                                    title="Putar Dokumen 90°"
                                >
                                    <RotateCw className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => cameraInputRef.current?.click()}
                                    className="px-3 py-2 rounded-xl border border-slate-700 text-xs font-semibold text-slate-300 hover:bg-slate-800 transition"
                                >
                                    Ulang
                                </button>
                                <button
                                    type="button"
                                    onClick={handleConfirm}
                                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-950/40 transition cursor-pointer flex items-center gap-1.5"
                                >
                                    <FileCheck className="w-4 h-4" />
                                    <span>GUNAKAN DOKUMEN</span>
                                </button>
                            </div>
                        </>
                    )}
                </div>

            </div>
        </div>
    );
}
