"use client";

import { useRef, useState } from "react";
import { Camera, ImagePlus, RefreshCw, Trash2, Sparkles } from "lucide-react";
import { DEMO_SAMPLES } from "@/lib/demo-samples";
import { compressImage, isAcceptedImage } from "@/lib/utils";

interface Props {
  image: string | null;
  isSample: boolean;
  onImage: (dataUrl: string) => void;
  onSample: (sampleId: string) => void;
  onClear: () => void;
  error: string | null;
}

export default function OutfitUploader({ image, isSample, onImage, onSample, onClear, error }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);

  async function handleFile(file: File | undefined | null) {
    if (!file) return;
    if (!isAcceptedImage(file)) {
      setFileError("JPG, PNG, WEBP 형식의 사진만 올릴 수 있어요.");
      return;
    }
    setFileError(null);
    setLoading(true);
    try {
      const dataUrl = await compressImage(file);
      onImage(dataUrl);
    } catch {
      setFileError("사진을 불러오지 못했어요. 다른 사진으로 시도해주세요.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="animate-fade-up">
      <h2 className="font-display text-[1.6rem] font-semibold leading-snug text-ink md:text-3xl">
        오늘 입을 코디 사진을
        <br className="md:hidden" /> 올려주세요
      </h2>
      <p className="mt-2 text-sm text-ink-soft">전신이 잘 보이는 사진일수록 확인하기 좋아요.</p>

      <input
        ref={fileRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        className="hidden"
        onChange={(e) => {
          handleFile(e.target.files?.[0]);
          e.target.value = "";
        }}
      />
      <input
        ref={cameraRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        capture="environment"
        className="hidden"
        onChange={(e) => {
          handleFile(e.target.files?.[0]);
          e.target.value = "";
        }}
      />

      {image ? (
        <div className="mt-6">
          <div className="relative mx-auto max-w-xs overflow-hidden rounded-photo border border-linen bg-white p-2.5 shadow-soft">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={image} alt="업로드한 코디 사진 미리보기" className="aspect-[3/4] w-full rounded-[1.3rem] object-cover" />
            {isSample && (
              <span className="absolute left-5 top-5 rounded-full bg-ink/75 px-2.5 py-1 text-[0.6875rem] font-semibold text-white backdrop-blur">
                샘플 코디
              </span>
            )}
          </div>
          <div className="mt-4 flex justify-center gap-2.5">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="inline-flex items-center gap-1.5 rounded-full border border-linen bg-white px-4 py-2.5 text-[0.8125rem] font-semibold text-ink transition-colors hover:bg-blush/60"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              다시 선택
            </button>
            <button
              type="button"
              onClick={onClear}
              className="inline-flex items-center gap-1.5 rounded-full border border-linen bg-white px-4 py-2.5 text-[0.8125rem] font-semibold text-ink-soft transition-colors hover:bg-blush/60 hover:text-rose-deep"
            >
              <Trash2 className="h-3.5 w-3.5" />
              삭제
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Desktop drop zone */}
          <div
            role="button"
            tabIndex={0}
            aria-label="코디 사진 업로드"
            onClick={() => fileRef.current?.click()}
            onKeyDown={(e) => e.key === "Enter" && fileRef.current?.click()}
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragging(false);
              handleFile(e.dataTransfer.files?.[0]);
            }}
            className={`mt-6 hidden cursor-pointer flex-col items-center justify-center rounded-photo border-2 border-dashed py-16 transition-all duration-200 md:flex ${
              dragging ? "border-rose bg-blush/70 scale-[1.01]" : "border-rose-soft bg-white hover:bg-blush/40"
            }`}
          >
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-blush">
              <ImagePlus className="h-7 w-7 text-rose" />
            </span>
            <p className="mt-4 text-[0.9375rem] font-semibold text-ink">사진을 끌어다 놓거나 클릭해서 선택</p>
            <p className="mt-1 text-[0.8125rem] text-ink-faint">JPG · PNG · WEBP</p>
          </div>

          {/* Mobile: camera-flow buttons */}
          <div className="mt-6 flex flex-col gap-3 md:hidden">
            <button
              type="button"
              onClick={() => cameraRef.current?.click()}
              className="flex items-center justify-center gap-2.5 rounded-card bg-rose py-4 text-[0.9375rem] font-semibold text-white shadow-rose transition-transform active:scale-[0.98]"
            >
              <Camera className="h-5 w-5" />
              사진 촬영
            </button>
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="flex items-center justify-center gap-2.5 rounded-card border border-linen bg-white py-4 text-[0.9375rem] font-semibold text-ink transition-transform active:scale-[0.98]"
            >
              <ImagePlus className="h-5 w-5 text-rose" />
              앨범에서 선택
            </button>
          </div>
        </>
      )}

      {loading && <p className="mt-3 text-center text-[0.8125rem] text-ink-soft animate-pulse-soft">사진을 준비하고 있어요…</p>}
      {(fileError || error) && (
        <p className="mt-3 rounded-2xl bg-rose-soft/60 px-4 py-2.5 text-center text-[0.8125rem] font-medium text-rose-deep">
          {fileError ?? error}
        </p>
      )}

      {/* Sample strip */}
      {!image && (
        <div className="mt-8">
          <p className="flex items-center gap-1.5 text-[0.8125rem] font-semibold text-ink-soft">
            <Sparkles className="h-3.5 w-3.5 text-rose" />
            사진이 없다면 샘플 코디로 체험해보세요
          </p>
          <div className="no-scrollbar -mx-5 mt-3 flex gap-3 overflow-x-auto px-5 pb-1 md:mx-0 md:px-0">
            {DEMO_SAMPLES.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => onSample(s.id)}
                className="w-24 shrink-0 overflow-hidden rounded-2xl border border-linen bg-white text-left shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:border-rose-soft"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={s.image} alt={`${s.name} 샘플`} loading="lazy" className="aspect-[3/4] w-full object-cover" />
                <p className="truncate px-2 py-1.5 text-[0.6875rem] font-medium text-ink-soft">{s.name}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      <p className="mt-6 text-center text-[0.6875rem] leading-relaxed text-ink-faint">
        업로드한 사진은 코디 분석을 위해 사용되며, 기록 저장은 이 기기 안에서만 이루어져요.
      </p>
    </div>
  );
}
