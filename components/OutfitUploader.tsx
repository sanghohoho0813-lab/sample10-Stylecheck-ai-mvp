"use client";

import { useState } from "react";
import { Camera, ImagePlus, Info, RefreshCw, Trash2 } from "lucide-react";
import { DEMO_SAMPLES } from "@/lib/demo-samples";
import { photoTip, type PhotoInfo, type PreparedImage } from "@/lib/utils";
import LookImage from "./LookImage";
import { usePhotoPicker } from "./usePhotoPicker";

interface Props {
  image: string | null;
  photo?: PhotoInfo | null;
  isSample: boolean;
  sampleName?: string;
  onImage: (photo: PreparedImage) => void;
  onSample: (sampleId: string) => void;
  onClear: () => void;
  error: string | null;
  /** Set when the user arrived with a situation already chosen (가이드 · 홈 상황 칩). */
  occasionLabel?: string;
}

export default function OutfitUploader({
  image,
  photo,
  isSample,
  sampleName,
  onImage,
  onSample,
  onClear,
  error,
  occasionLabel,
}: Props) {
  const picker = usePhotoPicker(onImage);
  const [dragging, setDragging] = useState(false);
  const message = picker.error ?? error;
  const tip = photoTip(photo);

  return (
    <div className="animate-fade-up">
      <h1
        id="step-title"
        tabIndex={-1}
        className="font-display text-section font-semibold text-ink outline-none md:text-page"
      >
        오늘 입을 코디를 보여주세요
      </h1>
      <p className="mt-2 text-body text-ink-soft">
        {occasionLabel ? (
          <>
            <b className="font-semibold text-rose-deep">{occasionLabel}</b> 기준으로 확인해요. 전신이 보이게 찍으면 가장
            좋아요.
          </>
        ) : (
          "전신이 보이게 찍으면 가장 좋아요."
        )}
      </p>

      {picker.inputs}

      {picker.preparing ? (
        // Reserve the photo's frame while it is being prepared — no jump when it lands
        <div className="mx-auto mt-7 w-full max-w-[17rem]" aria-busy="true">
          <div className="skeleton aspect-[3/4] w-full rounded-lg" />
          <p className="mt-3 text-center text-body-sm text-ink-soft">사진을 준비하고 있어요…</p>
        </div>
      ) : image ? (
        <div className="mt-7">
          <div className="relative mx-auto w-full max-w-[17rem]">
            <LookImage src={image} alt="선택한 코디 사진" sizes="272px" className="w-full rounded-lg" priority />
            {isSample && (
              <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-caption font-semibold text-ink-soft">
                샘플{sampleName ? ` · ${sampleName}` : ""}
              </span>
            )}
          </div>
          {tip && (
            <p className="mx-auto mt-3 flex max-w-[17rem] items-start gap-2 text-meta text-ink-soft">
              <Info className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
              {tip}
            </p>
          )}
          <div className="mt-4 flex justify-center gap-2">
            <button type="button" onClick={picker.openAlbum} className="btn btn-xs btn-secondary">
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
            onClick={picker.openAlbum}
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragging(false);
              picker.handleFile(e.dataTransfer.files?.[0]);
            }}
            className={`mt-7 hidden w-full flex-col items-center justify-center rounded-lg border-2 border-dashed py-14 transition-colors duration-200 md:flex ${
              dragging ? "border-rose bg-blush/70" : "border-linen bg-white hover:border-rose-soft"
            }`}
          >
            <ImagePlus className="h-8 w-8 text-rose-deep" strokeWidth={1.6} />
            <span className="mt-4 text-lead font-semibold text-ink">사진을 끌어다 놓거나 클릭해서 선택</span>
            <span className="mt-1 text-meta text-ink-faint">JPG · PNG · WEBP · 25MB 이하</span>
          </button>

          {/* Phones: camera first */}
          <div className="mt-7 grid gap-3 md:hidden">
            <button type="button" onClick={picker.openCamera} className="btn btn-lg btn-primary w-full">
              <Camera className="h-5 w-5" />
              사진 촬영
            </button>
            <button type="button" onClick={picker.openAlbum} className="btn btn-lg btn-secondary w-full">
              <ImagePlus className="h-5 w-5 text-rose-deep" />
              앨범에서 선택
            </button>
          </div>
        </>
      )}

      {message && (
        <p role="alert" className="mt-4 rounded-sm bg-blush px-4 py-3 text-center text-body-sm font-medium text-rose-deep">
          {message}
        </p>
      )}

      {!image && !picker.preparing && (
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
                  // Above the fold (all eight on desktop) and the largest paint on this screen
                  priority
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
