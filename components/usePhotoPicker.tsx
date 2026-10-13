"use client";

import { useRef, useState } from "react";
import { isAcceptedImage, MAX_UPLOAD_BYTES, prepareImage, type PreparedImage } from "@/lib/utils";

/**
 * Camera / album pickers with one validation and preparation path, shared by
 * the home hero and the 사진 step. Render `inputs` once; call openCamera /
 * openAlbum from any button; drop handlers can pass files to `handleFile`.
 */
export function usePhotoPicker(onPicked: (photo: PreparedImage) => void) {
  const albumRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);
  const [preparing, setPreparing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file: File | undefined | null) {
    if (!file) return;
    if (!isAcceptedImage(file)) return setError("JPG, PNG, WEBP 형식의 사진만 올릴 수 있어요.");
    if (file.size > MAX_UPLOAD_BYTES) return setError("25MB 이하의 사진을 올려주세요.");
    setError(null);
    setPreparing(true);
    try {
      onPicked(await prepareImage(file));
    } catch {
      setError("사진을 불러오지 못했어요. 다른 사진으로 시도해주세요.");
    } finally {
      setPreparing(false);
    }
  }

  const inputs = (["album", "camera"] as const).map((kind) => (
    <input
      key={kind}
      ref={kind === "album" ? albumRef : cameraRef}
      type="file"
      accept="image/jpeg,image/jpg,image/png,image/webp"
      capture={kind === "camera" ? "environment" : undefined}
      className="hidden"
      aria-hidden
      tabIndex={-1}
      data-picker={kind}
      onChange={(e) => {
        handleFile(e.target.files?.[0]);
        e.target.value = ""; // picking the same file again still fires
      }}
    />
  ));

  return {
    inputs,
    openAlbum: () => albumRef.current?.click(),
    openCamera: () => cameraRef.current?.click(),
    handleFile,
    preparing,
    error,
    clearError: () => setError(null),
  };
}
