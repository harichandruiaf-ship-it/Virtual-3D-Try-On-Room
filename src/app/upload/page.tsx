'use client';

import { useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Upload, Loader2, ArrowLeft } from 'lucide-react';
import { useRoomStore } from '@/store/roomStore';
import { createSession, uploadAndAnalyze } from '@/lib/api';
import { validateUpload } from '@/lib/upload-validation';

export default function UploadPage() {
  const router = useRouter();
  const {
    setHumanModel,
    setSessionId,
    isAnalyzing,
    setAnalyzing,
    setAnalysisError,
    analysisError,
  } = useRoomStore();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [heightCm, setHeightCm] = useState<string>('170');
  const [gender, setGender] = useState<string>('');
  const [dragActive, setDragActive] = useState(false);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const f = e.dataTransfer.files?.[0];
    if (!f) return;
    if (f.type.startsWith('image/')) {
      const v = validateUpload({ type: f.type, size: f.size });
      if (!v.ok) {
        useRoomStore.getState().setAnalysisError(v.error);
        return;
      }
      setFile(f);
      setPreview(URL.createObjectURL(f));
      useRoomStore.getState().setAnalysisError(null);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
  }, []);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.type.startsWith('image/')) {
      const v = validateUpload({ type: f.type, size: f.size });
      if (!v.ok) {
        useRoomStore.getState().setAnalysisError(v.error);
        return;
      }
      setFile(f);
      setPreview(URL.createObjectURL(f));
      useRoomStore.getState().setAnalysisError(null);
    }
  }, []);

  const handleAnalyze = useCallback(async () => {
    if (!file) return;
    const h = Number(heightCm);
    if (Number.isNaN(h) || h < 100 || h > 250) {
      setAnalysisError('Please enter a valid height (100–250 cm).');
      return;
    }
    setAnalyzing(true);
    setAnalysisError(null);
    try {
      const { sessionId } = await createSession();
      setSessionId(sessionId);
      const { model, falHint } = await uploadAndAnalyze(sessionId, file, h, gender || undefined);
      setHumanModel(model);
      useRoomStore.getState().setFalNotice(falHint ?? null);
      router.push('/room');
    } catch (err) {
      setAnalysisError(
        err instanceof Error ? err.message : 'Analysis failed. Please try again.'
      );
    } finally {
      setAnalyzing(false);
    }
  }, [file, heightCm, gender, setAnalyzing, setAnalysisError, setHumanModel, setSessionId, router]);

  const clearSelection = useCallback(() => {
    if (preview) URL.revokeObjectURL(preview);
    setFile(null);
    setPreview(null);
    setAnalysisError(null);
  }, [preview, setAnalysisError]);

  return (
    <main className="min-h-screen p-6 md:p-10 bg-room-bg">
      <div className="max-w-2xl mx-auto">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-room-muted hover:text-white mb-8"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </Link>
        <h1 className="text-3xl font-bold text-white mb-2">Create your 3D model</h1>
        <p className="text-room-muted mb-8">
          Upload a full-body photo. We use your height to estimate measurements and
          build a virtual you. For video, capture a frame in our app and upload as
          image.
        </p>

        {!preview ? (
          <div
            className={`upload-zone rounded-2xl p-12 text-center cursor-pointer ${dragActive ? 'dragging' : ''}`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => document.getElementById('file-input')?.click()}
          >
            <input
              id="file-input"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={handleFileInput}
            />
            <Upload className="w-12 h-12 mx-auto text-room-muted mb-4" />
            <p className="text-white font-medium mb-1">
              Drop an image here or click to browse
            </p>
            <p className="text-room-muted text-sm">
              JPEG, PNG, WebP under 20 MB. Full-body works best.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="rounded-2xl overflow-hidden bg-room-surface border border-room-border aspect-[3/4] max-h-[420px] flex items-center justify-center">
              <img
                src={preview}
                alt="Reference"
                className="w-full h-full object-contain"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-room-muted mb-1">
                  Your height (cm) *
                </label>
                <input
                  type="number"
                  min={100}
                  max={250}
                  value={heightCm}
                  onChange={(e) => setHeightCm(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl bg-room-surface border border-room-border text-white"
                />
              </div>
              <div>
                <label className="block text-sm text-room-muted mb-1">
                  Gender (optional)
                </label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl bg-room-surface border border-room-border text-white"
                >
                  <option value="">—</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={clearSelection}
                className="px-4 py-2 rounded-xl border border-room-border text-room-muted hover:text-white"
              >
                Choose another
              </button>
              <button
                type="button"
                onClick={handleAnalyze}
                disabled={isAnalyzing}
                className="px-6 py-2 rounded-xl bg-room-accent text-white font-medium disabled:opacity-60 flex items-center gap-2"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Analyzing…
                  </>
                ) : (
                  'Generate my 3D model'
                )}
              </button>
            </div>
            {analysisError && (
              <p className="text-red-400 text-sm">{analysisError}</p>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
