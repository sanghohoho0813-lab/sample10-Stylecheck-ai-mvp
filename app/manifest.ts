import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "StyleCheck AI — 상황별 코디 적합도",
    short_name: "StyleCheck",
    description: "사진과 가는 곳을 알려주면 지금 코디가 그 자리에 얼마나 잘 맞는지 알려드려요.",
    lang: "ko",
    start_url: "/",
    display: "standalone",
    background_color: "#fbf7f4",
    theme_color: "#fbf7f4",
    icons: [
      { src: "/icon.svg", type: "image/svg+xml", sizes: "any" },
      { src: "/apple-icon", type: "image/png", sizes: "180x180" },
    ],
  };
}
