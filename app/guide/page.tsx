import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Check, Info } from "lucide-react";
import { OCCASION_MAP } from "@/lib/occasions";
import type { OccasionId } from "@/lib/types";

export const metadata: Metadata = {
  title: "상황별 스타일 가이드 — StyleCheck AI",
};

const GUIDES: { id: OccasionId; points: string[]; avoid: string[] }[] = [
  {
    id: "wedding",
    points: ["적당한 격식의 세미포멀 룩", "차분한 톤의 재킷·원피스", "정돈된 구두나 로퍼"],
    avoid: ["신부·신랑보다 돋보이는 과도한 화이트", "지나치게 캐주얼한 운동복·슬리퍼", "과한 반짝이 소재"],
  },
  {
    id: "interview",
    points: ["단정함이 최우선", "네이비·차콜·블랙 등 절제된 컬러", "직무 분위기에 맞는 격식 수준"],
    avoid: ["과한 포인트 컬러", "구겨진 셔츠·때 탄 신발", "지나치게 트렌디한 실루엣"],
  },
  {
    id: "family-meeting",
    points: ["과하지 않은 격식", "차분한 컬러 톤", "편안하면서 정돈된 느낌"],
    avoid: ["지나치게 화려한 액세서리", "너무 캐주얼한 데님·후드", "노출이 많은 디자인"],
  },
  {
    id: "blind-date",
    points: ["나다움이 느껴지는 자연스러운 스타일", "부드러운 컬러의 니트·셔츠", "깔끔한 신발"],
    avoid: ["과하게 꾸민 인상", "관리 안 된 신발", "지나친 로고 플레이"],
  },
  {
    id: "first-day",
    points: ["회사 분위기보다 반 단계 더 단정하게", "베이식한 셔츠·슬랙스 조합", "심플한 가방과 신발"],
    avoid: ["첫날부터 과한 개성 표현", "지나치게 편한 차림", "요란한 액세서리"],
  },
  {
    id: "restaurant",
    points: ["스마트 캐주얼 이상", "어두운 톤의 재킷이나 블라우스", "정돈된 구두"],
    avoid: ["운동복·트레이닝 팬츠", "슬리퍼·샌들", "큰 백팩"],
  },
  {
    id: "funeral",
    points: ["블랙·다크 톤으로 통일", "무늬 없는 단정한 정장", "어두운 색 신발과 가방"],
    avoid: ["밝은 컬러·화려한 패턴", "반짝이는 액세서리", "캐주얼한 운동화"],
  },
  {
    id: "travel",
    points: ["활동성이 좋은 편안한 착장", "사진에 잘 담기는 컬러 조합", "날씨 변화 대비 레이어"],
    avoid: ["불편한 새 신발", "과한 격식", "짐이 되는 무거운 아이템"],
  },
];

export default function GuidePage() {
  return (
    <div className="mx-auto max-w-4xl px-5 pb-16 pt-10 md:px-8 md:pt-14">
      <h1 className="font-display text-3xl font-semibold text-ink md:text-4xl">상황별 스타일 가이드</h1>
      <p className="mt-3 max-w-xl text-sm leading-relaxed text-ink-soft">
        자리마다 어울리는 격식과 무드의 기준을 정리했어요. 문화와 모임 분위기에 따라 기준은 달라질 수 있으니,
        참고용 가이드로 활용해주세요.
      </p>

      <div className="mt-9 grid gap-5 xl:grid-cols-2">
        {GUIDES.map((g, i) => {
          const occ = OCCASION_MAP[g.id];
          return (
            <section
              key={g.id}
              id={g.id}
              className="animate-fade-up scroll-mt-24 rounded-card border border-linen bg-white p-6 shadow-soft"
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <h2 className="flex items-center gap-2.5 font-display text-xl font-semibold text-ink">
                <span className="text-2xl">{occ.emoji}</span>
                {occ.label}
              </h2>
              <p className="mt-1 text-[0.75rem] text-ink-faint">{occ.description}</p>

              <p className="mt-4 text-[0.8125rem] font-bold text-sage">이렇게 입으면 좋아요</p>
              <ul className="mt-2 space-y-1.5">
                {g.points.map((p) => (
                  <li key={p} className="flex items-start gap-2 text-[0.8125rem] leading-relaxed text-ink-soft">
                    <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-sage" strokeWidth={3} />
                    {p}
                  </li>
                ))}
              </ul>

              <p className="mt-4 text-[0.8125rem] font-bold text-rose-deep">피하면 좋은 것</p>
              <ul className="mt-2 space-y-1.5">
                {g.avoid.map((p) => (
                  <li key={p} className="flex items-start gap-2 text-[0.8125rem] leading-relaxed text-ink-soft">
                    <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-rose" />
                    {p}
                  </li>
                ))}
              </ul>

              <Link
                href={`/check?occasion=${g.id}`}
                className="mt-5 inline-flex items-center gap-1.5 text-[0.8125rem] font-semibold text-rose transition-colors hover:text-rose-deep"
              >
                이 상황으로 코디 확인하기
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </section>
          );
        })}
      </div>

      <p className="mt-8 flex items-start gap-2 rounded-card border border-linen bg-ivory px-5 py-4 text-[0.75rem] leading-relaxed text-ink-faint">
        <Info className="mt-0.5 h-4 w-4 shrink-0" />
        이 가이드는 일반적인 기준을 안내할 뿐, 정답은 아니에요. 지역·문화·모임의 성격에 따라 어울리는 스타일은
        얼마든지 달라질 수 있어요.
      </p>
    </div>
  );
}
