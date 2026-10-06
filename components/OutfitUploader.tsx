"use client";

import { useRef, useState } from "react";
import { Camera, ImagePlus, RefreshCw, Trash2 } from "lucide-react";
import { DEMO_SAMPLES } from "@/lib/demo-samples";
import { compressImage, isAcceptedImage, MAX_UPLOAD_BYTES } from "@/lib/utils";
import LookImage from "./LookImage";

interface Props {
  image: string | null;
  isSample: boolean;
  sampleName?: string;
  onImage: (dataUrl: string) => void;
  onSample: (sampleId: string) => void;
  onClear: () => void;
  error: string | null;
  /** Set when the user arrived with a situation already chosen (가이드 · 홈 상황 칩). */
  occasionLabel?: string;
}

export default function OutfitUploader({
  image,
  isSample,
  sampleName,
  onImage,
  onSample,
  onClear,
  error,
  occasionLabel,
}: Props) {
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
    if (file.size > MAX_UPLOAD_BYTES) {
      setFileError("25MB 이하의 사진을 올려주세요.");
      return;
    }
    setFileError(null);
    setLoading(true);
    try {
      onImage(await compressImage(file));
    } catch {
      setFileError("사진을 불러오지 못했어요. 다른 사진으로 시도해주세요.");
    } finally {
      setLoading(false);
    }
  }

  const message = fileError ?? error;

  return (
    <div className="animate-fade-up">
      <h1 id="step-title" tabIndex={-1} className="outline-none font-display text-section font-semibold text-ink md:text-page">오늘 입을 코디를 보여주세요</h1>
      <p className="mt-2 text-body text-ink-soft">
        {occasionLabel ? (
          <>
            <b className="font-semibold text-rose-deep">{occasionLabel}</b> 기준으로 확인해요. 전신이 보이는 사진일수록
            정확해요.
          </>
        ) : (
          "전신이 보이는 사진일수록 정확하게 확인할 수 있어요."
        )}
      </p>

      {(["file", "camera"] as const).map((kind) => (
        <input
          key={kind}
          ref={kind === "file" ? fileRef : cameraRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp"
          capture={kind === "camera" ? "environment" : undefined}
          className="hidden"
          aria-hidden
          tabIndex={-1}
          onChange={(e) => {
            handleFile(e.target.files?.[0]);
            e.target.value = "";
          }}
        />
      ))}

      {image ? (
        <div className="mt-7">
          <div className="relative mx-auto w-full max-w-[17rem]">
            <LookImage
              src={image}
              alt="선택한 코디 사진"
              sizes="272px"
              className="w-full rounded-lg shadow-raised"
              priority
            />
            {isSample && (
              <span className="absolute left-3 top-3 rounded-full bg-ink/75 px-2.5 py-1 text-caption font-semibold text-white backdrop-blur">
                샘플{sampleName ? ` · ${sampleName}` : ""}
              </span>
            )}
          </div>
          <div className="mt-4 flex justify-center gap-2">
            <button type="button" onClick={() => fileRef.current?.click()} className="btn btn-xs btn-secondary">
              <RefreshCw className="h-4 w-4" />
              다른 사진
            </button>
            <button type="button" onClick={onClear} className="btn btn-xs btn-quiet">
              <Trash2 className="h-4 w-4" />
              삭제
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Desktop drop zone */}
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
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
            className={`mt-7 hidden w-full flex-col items-center justify-center rounded-lg border-2 border-dashed py-14 transition-colors duration-200 md:flex ${
              dragging ? "border-rose bg-blush/70" : "border-rose-soft bg-white hover:bg-blush/40"
            }`}
          >
            <ImagePlus className="h-8 w-8 text-rose" strokeWidth={1.6} />
            <span className="mt-4 text-lead font-semibold text-ink">사진을 끌어다 놓거나 클릭해서 선택</span>
            <span className="mt-1 text-meta text-ink-faint">JPG · PNG · WEBP · 25MB 이하</span>
          </button>

          {/* Phones: camera first */}
          <div className="mt-7 grid gap-3 md:hidden">
            <button type="button" onClick={() => cameraRef.current?.click()} className="btn btn-lg btn-primary w-full">
              <Camera className="h-5 w-5" />
              사진 촬영
            </button>
            <button type="button" onClick={() => fileRef.current?.click()} className="btn btn-lg btn-secondary w-full">
              <ImagePlus className="h-5 w-5 text-rose-deep" />
              앨범에서 선택
            </button>
          </div>
        </>
      )}

      {loading && <p className="mt-3 text-center text-body-sm text-ink-soft">사진을 준비하고 있어요…</p>}
      {message && (
        <p role="alert" className="mt-4 rounded-sm bg-blush px-4 py-3 text-center text-body-sm font-medium text-rose-deep">
          {message}
        </p>
      )}

      {!image && (
        <section className="mt-10" aria-labelledby="sample-strip">
          <h2 id="sample-strip" className="text-body-sm font-semibold text-ink">
            사진이 없다면 샘플 코디로 체험해보세요
          </h2>
          <div className="no-scrollbar -mx-5 mt-3 flex gap-3 overflow-x-auto px-5 pb-1 md:mx-0 md:grid md:grid-cols-8 md:gap-2.5 md:px-0">
            {DEMO_SAMPLES.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => onSample(s.id)}
                className="group w-24 shrink-0 text-left md:w-auto"
              >
                <LookImage
                  src={s.image}
                  alt=""
                  sizes="96px"
                  className="w-full rounded-sm ring-rose transition group-hover:ring-2"
                />
                <span className="mt-1.5 block truncate text-caption text-ink-soft">{s.name}</span>
              </button>
            ))}
          </div>
        </section>
      )}

      <p className="mt-8 text-meta text-ink-faint">데모 버전은 사진을 실제로 인식하지 않아요. 사진은 이 기기에만 보관돼요.</p>
    </div>
  );
}
