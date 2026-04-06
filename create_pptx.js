const pptxgen = require("pptxgenjs");

const pres = new pptxgen();
pres.layout = 'LAYOUT_16x9';
pres.title = 'Ironclad - UE5 Blueprint Action Game Prototype';

// Colors
const BG = "1a1a2e";
const CARD_BG = "16213e";
const GOLD = "c9a84c";
const WHITE = "ffffff";
const DARK_TEXT = "1a1a2e";
const RED = "ff5555";
const YELLOW = "ffcc44";
const GREEN = "55cc55";
const GRAY = "aaaaaa";

// Slide dimensions: 10" x 5.625"
const W = 10;
const H = 5.625;

// ─── Helper: add slide with dark bg ─────────────────────────────────────────
function addDarkSlide() {
  const slide = pres.addSlide();
  slide.background = { color: BG };
  return slide;
}

// ─── Helper: slide title ────────────────────────────────────────────────────
function addSlideTitle(slide, text) {
  // Horizontal separator line under title
  slide.addText(text, {
    x: 0.4, y: 0.22, w: 9.2, h: 0.55,
    fontSize: 28, fontFace: "Georgia", color: GOLD, bold: true,
    valign: "middle"
  });
  slide.addShape(pres.shapes.LINE, {
    x: 0.4, y: 0.85, w: 9.2, h: 0,
    line: { color: GOLD, width: 0.75 }
  });
}

// ─── Helper: card with gold left border ─────────────────────────────────────
function addCard(slide, x, y, w, h, titleText, bodyText, titleSize = 13, bodySize = 11) {
  slide.addShape(pres.shapes.RECTANGLE, {
    x, y, w, h,
    fill: { color: CARD_BG }, line: { color: "222244", width: 0.5 }
  });
  slide.addShape(pres.shapes.RECTANGLE, {
    x, y, w: 0.05, h,
    fill: { color: GOLD }, line: { color: GOLD }
  });
  const items = [];
  if (titleText) items.push({ text: titleText, options: { bold: true, color: GOLD, fontSize: titleSize, breakLine: true } });
  if (bodyText) items.push({ text: bodyText, options: { color: WHITE, fontSize: bodySize } });
  slide.addText(items, {
    x: x + 0.13, y: y + 0.12, w: w - 0.2, h: h - 0.24,
    valign: "top", fontFace: "Calibri"
  });
}

// ─── Helper: flow box ───────────────────────────────────────────────────────
function addFlowBox(slide, x, y, w, h, text) {
  slide.addShape(pres.shapes.RECTANGLE, {
    x, y, w, h,
    fill: { color: CARD_BG }, line: { color: GOLD, width: 1.5 }
  });
  slide.addText(text, {
    x, y, w, h,
    fontSize: 14, fontFace: "Georgia", color: GOLD,
    bold: true, align: "center", valign: "middle"
  });
}

// ─── Helper: flow arrow ─────────────────────────────────────────────────────
function addArrow(slide, x, y, h) {
  slide.addText("\u2192", {
    x, y, w: 0.4, h,
    fontSize: 20, color: GOLD, align: "center", valign: "middle"
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// SLIDE 1 — Title
// ═══════════════════════════════════════════════════════════════════════════
{
  const slide = addDarkSlide();

  slide.addText("IRONCLAD", {
    x: 0, y: 1.2, w: W, h: 1.4,
    fontSize: 64, fontFace: "Georgia", color: GOLD,
    bold: true, align: "center", valign: "middle"
  });

  slide.addText("UE5 Blueprint Action Game Prototype", {
    x: 0, y: 2.8, w: W, h: 0.6,
    fontSize: 22, fontFace: "Calibri", color: WHITE,
    align: "center", valign: "middle"
  });

  // Bottom info bar
  slide.addShape(pres.shapes.RECTANGLE, {
    x: 0, y: 4.88, w: W, h: 0.745,
    fill: { color: GOLD }, line: { color: GOLD }
  });
  slide.addText("개발기간: 2주 (2026.03.24 ~ 04.07)  |  1인 솔로  |  Unreal Engine 5  |  Blueprint Only", {
    x: 0, y: 4.88, w: W, h: 0.745,
    fontSize: 13, fontFace: "Calibri", color: DARK_TEXT,
    align: "center", valign: "middle", bold: true
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// SLIDE 2 — 프로젝트 개요
// ═══════════════════════════════════════════════════════════════════════════
{
  const slide = addDarkSlide();
  addSlideTitle(slide, "프로젝트 개요");

  const cards = [
    { title: "게임", body: "중갑 기사가 다크판타지 석조 폐허를 혼자 돌파하는 1인 솔로 액션 게임" },
    { title: "목표", body: "히트스톱 · 히트 판정 · 콤보 시스템을 블루프린트로 직접 구현해 전투감 있는 프로토타입 완성" },
    { title: "장르", body: "액션 (DMC / 스텔라 블레이드 스타일)" },
    { title: "에셋", body: "Fab 무료 에셋 적극 활용 / 14일 개발 기간" },
  ];

  const cW = 4.4;
  const cH = 2.1;
  const gap = 0.18;
  const sx = 0.4;
  const sy = 1.0;

  // Use valign middle inside addCard by passing body as bullet list
  cards.forEach((c, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const cx = sx + col * (cW + gap);
    const cy = sy + row * (cH + gap);
    slide.addShape(pres.shapes.RECTANGLE, {
      x: cx, y: cy, w: cW, h: cH,
      fill: { color: CARD_BG }, line: { color: "222244", width: 0.5 }
    });
    slide.addShape(pres.shapes.RECTANGLE, {
      x: cx, y: cy, w: 0.05, h: cH,
      fill: { color: GOLD }, line: { color: GOLD }
    });
    slide.addText([
      { text: c.title, options: { bold: true, color: GOLD, fontSize: 14, breakLine: true } },
      { text: c.body, options: { color: WHITE, fontSize: 12 } },
    ], {
      x: cx + 0.13, y: cy + 0.18, w: cW - 0.2, h: cH - 0.36,
      valign: "middle", fontFace: "Calibri"
    });
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// SLIDE 3 — 핵심 기능 1: 히트스톱
// ═══════════════════════════════════════════════════════════════════════════
{
  const slide = addDarkSlide();
  addSlideTitle(slide, "핵심 기능 1 \u2014 히트스톱 시스템");

  const ly = 1.05;
  const lx = 0.4;
  const lw = 4.3;
  const rx = 5.2;
  const rw = 4.4;

  // Left column header
  slide.addText("왜 핵심인가?", {
    x: lx, y: ly, w: lw, h: 0.38,
    fontSize: 16, fontFace: "Georgia", color: GOLD, bold: true
  });

  // Quote box
  slide.addShape(pres.shapes.RECTANGLE, {
    x: lx, y: ly + 0.44, w: lw, h: 1.0,
    fill: { color: CARD_BG }, line: { color: GOLD, width: 1.5 }
  });
  slide.addText('"타격감은 애니메이션이 아니라\n0.05~0.1초 슬로우에서 온다"', {
    x: lx + 0.14, y: ly + 0.5, w: lw - 0.28, h: 0.88,
    fontSize: 12, fontFace: "Calibri", color: GOLD,
    italic: true, valign: "middle", align: "center"
  });

  slide.addText("공격이 적중하는 순간 시간이 잠깐 멈추는 느낌\n→ 임팩트 극대화", {
    x: lx, y: ly + 1.55, w: lw, h: 0.8,
    fontSize: 13, fontFace: "Calibri", color: WHITE, valign: "top"
  });

  // Vertical separator
  slide.addShape(pres.shapes.LINE, {
    x: 4.95, y: ly, w: 0, h: 3.5,
    line: { color: GOLD, width: 0.5, dashType: "dash" }
  });

  // Right column
  slide.addText("구현 방법", {
    x: rx, y: ly, w: rw, h: 0.38,
    fontSize: 16, fontFace: "Georgia", color: GOLD, bold: true
  });

  slide.addText([
    { text: "Global Time Dilation으로 0.05~0.1초간 속도 감소", options: { bullet: true, breakLine: true, color: WHITE, fontSize: 13 } },
    { text: "히트스톱 + 카메라 쉐이크 + 히트 파티클 동시 발동", options: { bullet: true, breakLine: true, color: WHITE, fontSize: 13 } },
    { text: "세 가지가 동시에 적용되어야 타격감이 완성됨", options: { bullet: true, color: WHITE, fontSize: 13 } },
  ], {
    x: rx, y: ly + 0.48, w: rw, h: 2.8,
    fontFace: "Calibri", valign: "top", paraSpaceAfter: 6
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// SLIDE 4 — 핵심 기능 2: 히트 판정
// ═══════════════════════════════════════════════════════════════════════════
{
  const slide = addDarkSlide();
  addSlideTitle(slide, "핵심 기능 2 \u2014 히트 판정");

  // Left decorative box — full height for visual balance
  slide.addShape(pres.shapes.RECTANGLE, {
    x: 0.4, y: 1.05, w: 4.0, h: 3.8,
    fill: { color: CARD_BG }, line: { color: GOLD, width: 2 }
  });
  // Gold top accent bar
  slide.addShape(pres.shapes.RECTANGLE, {
    x: 0.4, y: 1.05, w: 4.0, h: 0.07,
    fill: { color: GOLD }, line: { color: GOLD }
  });
  slide.addText("Sphere Trace\n/ Box Trace", {
    x: 0.4, y: 1.05, w: 4.0, h: 3.8,
    fontSize: 26, fontFace: "Georgia", color: GOLD, bold: true,
    align: "center", valign: "middle"
  });

  // Right bullets — vertically centered in the available space
  slide.addText([
    { text: "프레임 단위 공격 판정 제어", options: { bullet: true, breakLine: true, color: WHITE, fontSize: 14 } },
    { text: "오탐 없는 정확한 히트 검출", options: { bullet: true, breakLine: true, color: WHITE, fontSize: 14 } },
    { text: "공격 유형별 Trace 형태·크기 차별화 (일반/강공격)", options: { bullet: true, breakLine: true, color: WHITE, fontSize: 14 } },
    { text: "히트 액터에 데미지 전달 → 피격 리액션 연동", options: { bullet: true, color: WHITE, fontSize: 14 } },
  ], {
    x: 5.0, y: 1.05, w: 4.6, h: 3.8,
    fontFace: "Calibri", valign: "middle", paraSpaceAfter: 10
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// SLIDE 5 — 핵심 기능 3: 콤보 시스템
// ═══════════════════════════════════════════════════════════════════════════
{
  const slide = addDarkSlide();
  addSlideTitle(slide, "핵심 기능 3 \u2014 콤보 시스템");

  // Flow diagram
  const flowY = 1.1;
  const bW = 1.75;
  const bH = 0.7;
  const aW = 0.42;
  const unit = bW + aW + 0.05;
  const totalW = 4 * bW + 3 * (aW + 0.05);
  const startX = (W - totalW) / 2;

  const labels = ["Light 1", "Light 2", "Light 3", "Heavy"];
  labels.forEach((lbl, i) => {
    const bx = startX + i * unit;
    addFlowBox(slide, bx, flowY, bW, bH, lbl);
    if (i < 3) addArrow(slide, bx + bW + 0.02, flowY, bH);
  });

  // Dashed separator
  slide.addShape(pres.shapes.LINE, {
    x: 0.4, y: 2.1, w: 9.2, h: 0,
    line: { color: GOLD, width: 0.5, dashType: "dash" }
  });

  // Two-column details
  const dY = 2.28;
  const dH = 2.8;

  // Left
  slide.addText("상태 관리", {
    x: 0.4, y: dY, w: 4.3, h: 0.38,
    fontSize: 14, fontFace: "Georgia", color: GOLD, bold: true
  });
  slide.addText([
    { text: "EPlayerState + DT_ComboTable로 상태 관리", options: { bullet: true, breakLine: true, color: WHITE, fontSize: 13 } },
    { text: "몽타주 노티파이로 입력 구간 제어", options: { bullet: true, color: WHITE, fontSize: 13 } },
  ], {
    x: 0.4, y: dY + 0.42, w: 4.3, h: dH,
    fontFace: "Calibri", valign: "top", paraSpaceAfter: 6
  });

  // Vertical sep
  slide.addShape(pres.shapes.LINE, {
    x: 5.0, y: dY, w: 0, h: 2.6,
    line: { color: GOLD, width: 0.5, dashType: "dash" }
  });

  // Right
  slide.addText("특수 공격", {
    x: 5.2, y: dY, w: 4.4, h: 0.38,
    fontSize: 14, fontFace: "Georgia", color: GOLD, bold: true
  });
  slide.addText([
    { text: "런치 공격: 적을 공중으로 띄우기", options: { bullet: true, breakLine: true, color: WHITE, fontSize: 13 } },
    { text: "노티파이 구간 내 입력 → 다음 콤보 연결", options: { bullet: true, color: WHITE, fontSize: 13 } },
  ], {
    x: 5.2, y: dY + 0.42, w: 4.4, h: dH,
    fontFace: "Calibri", valign: "top", paraSpaceAfter: 6
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// SLIDE 6 — 핵심 기능 4: 적 AI
// ═══════════════════════════════════════════════════════════════════════════
{
  const slide = addDarkSlide();
  addSlideTitle(slide, "핵심 기능 4 \u2014 적 AI 시스템");

  // State flow
  const sY = 1.05;
  const sW = 1.7;
  const sH = 0.65;
  const sAW = 0.42;
  const sUnit = sW + sAW + 0.05;
  const sTotalW = 4 * sW + 3 * (sAW + 0.05);
  const sStartX = (W - sTotalW) / 2;

  ["Idle", "Patrol", "Chase", "Attack"].forEach((s, i) => {
    addFlowBox(slide, sStartX + i * sUnit, sY, sW, sH, s);
    if (i < 3) addArrow(slide, sStartX + i * sUnit + sW + 0.02, sY, sH);
  });

  // Dashed separator
  slide.addShape(pres.shapes.LINE, {
    x: 0.4, y: 2.0, w: 9.2, h: 0,
    line: { color: GOLD, width: 0.5, dashType: "dash" }
  });

  // Two columns
  const bY = 2.18;

  // Left: BT Tasks
  slide.addText("BT Tasks", {
    x: 0.4, y: bY, w: 4.4, h: 0.38,
    fontSize: 14, fontFace: "Georgia", color: GOLD, bold: true
  });
  slide.addText([
    { text: "BTTask_SelectPatrolLocation: 랜덤 NavMesh 순찰", options: { bullet: true, breakLine: true, color: WHITE, fontSize: 12 } },
    { text: "BTTask_ChaseTarget: 플레이어 감지 시 추격", options: { bullet: true, breakLine: true, color: WHITE, fontSize: 12 } },
    { text: "BTTask_SetState: EEnemyState 전환", options: { bullet: true, color: WHITE, fontSize: 12 } },
  ], {
    x: 0.4, y: bY + 0.42, w: 4.4, h: 2.8,
    fontFace: "Calibri", valign: "top", paraSpaceAfter: 6
  });

  // Vertical sep
  slide.addShape(pres.shapes.LINE, {
    x: 5.0, y: bY, w: 0, h: 2.8,
    line: { color: GOLD, width: 0.5, dashType: "dash" }
  });

  // Right: Plugins
  slide.addText("Plugins & Framework", {
    x: 5.2, y: bY, w: 4.4, h: 0.38,
    fontSize: 14, fontFace: "Georgia", color: GOLD, bold: true
  });
  slide.addText([
    { text: "Behavior Tree + Blackboard 기반", options: { bullet: true, breakLine: true, color: WHITE, fontSize: 12 } },
    { text: "PoseSearch: 모션 매칭", options: { bullet: true, breakLine: true, color: WHITE, fontSize: 12 } },
    { text: "MotionTrajectory: 애니메이션 궤적 예측", options: { bullet: true, color: WHITE, fontSize: 12 } },
  ], {
    x: 5.2, y: bY + 0.42, w: 4.4, h: 2.8,
    fontFace: "Calibri", valign: "top", paraSpaceAfter: 6
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// SLIDE 7 — 핵심 기능 5: 보스 시스템
// ═══════════════════════════════════════════════════════════════════════════
{
  const slide = addDarkSlide();
  addSlideTitle(slide, "핵심 기능 5 \u2014 보스 시스템");

  // Left card block
  addCard(slide, 0.4, 1.05, 4.3, 3.8,
    "구조 & 설계",
    "보스 1명, 페이즈 1~2 구조\n\nEnemy BP를 상속 구조로 확장\n\n페이즈별 공격 패턴 및 데미지 처리 분기",
    14, 13);

  // Right card block
  addCard(slide, 5.3, 1.05, 4.3, 3.8,
    "UI & 연출",
    "보스 전용 HP UI (화면 하단 대형 HP바)\n\n보스 전용 애니메이션 세트\n\nPhase 1 → Phase 2 전환 트리거",
    14, 13);
}

// ═══════════════════════════════════════════════════════════════════════════
// SLIDE 8 — 트러블슈팅 1
// ═══════════════════════════════════════════════════════════════════════════
{
  const slide = addDarkSlide();
  addSlideTitle(slide, "트러블슈팅 1 \u2014 콤보 타이밍 & 입력 버퍼링");

  const cases = [
    {
      problem: "재생속도를 높이니 커맨드 입력 전에 애니메이션이 끝나버림",
      cause: "노티파이 입력 수신 구간이 너무 짧아짐",
      solution: "재생속도 조정 + 몽타주 노티파이 영역 확대",
    },
    {
      problem: "DataTable 콤보 데이터 매칭 실패",
      cause: "일반 Loop 노드 → 루프 완료 전 결과 읽기",
      solution: "While Break 노드로 교체 → 조건 충족 즉시 탈출",
    },
  ];

  cases.forEach((c, i) => {
    const bx = 0.4 + i * 4.8;
    const by = 1.05;
    const bw = 4.4;
    const bh = 4.2;

    slide.addShape(pres.shapes.RECTANGLE, {
      x: bx, y: by, w: bw, h: bh,
      fill: { color: CARD_BG }, line: { color: "222244", width: 0.5 }
    });
    slide.addShape(pres.shapes.RECTANGLE, {
      x: bx, y: by, w: 0.05, h: bh,
      fill: { color: GOLD }, line: { color: GOLD }
    });

    slide.addText([
      { text: "문제", options: { bold: true, color: RED, fontSize: 13, breakLine: true } },
      { text: c.problem, options: { color: WHITE, fontSize: 12, breakLine: true } },
      { text: " ", options: { fontSize: 7, breakLine: true } },
      { text: "원인", options: { bold: true, color: YELLOW, fontSize: 13, breakLine: true } },
      { text: c.cause, options: { color: WHITE, fontSize: 12, breakLine: true } },
      { text: " ", options: { fontSize: 7, breakLine: true } },
      { text: "해결", options: { bold: true, color: GREEN, fontSize: 13, breakLine: true } },
      { text: c.solution, options: { color: WHITE, fontSize: 12 } },
    ], {
      x: bx + 0.14, y: by + 0.18, w: bw - 0.24, h: bh - 0.3,
      fontFace: "Calibri", valign: "top"
    });
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// SLIDE 9 — 트러블슈팅 2
// ═══════════════════════════════════════════════════════════════════════════
{
  const slide = addDarkSlide();
  addSlideTitle(slide, "트러블슈팅 2 \u2014 AI State 관리 분산 문제");

  // Three component boxes
  const labels = ["BP_Enemy", "ABP_Enemy", "BT_Enemy"];
  const bW = 2.5;
  const bH = 1.05;
  const bY = 1.05;
  const totalBW = 3 * bW + 2 * 0.5;
  const bStartX = (W - totalBW) / 2;

  labels.forEach((lbl, i) => {
    const bx = bStartX + i * (bW + 0.5);
    slide.addShape(pres.shapes.RECTANGLE, {
      x: bx, y: bY, w: bW, h: bH,
      fill: { color: CARD_BG }, line: { color: GOLD, width: 1.5 }
    });
    slide.addText([
      { text: lbl, options: { bold: true, color: GOLD, fontSize: 14, breakLine: true } },
      { text: "EEnemyState", options: { color: WHITE, fontSize: 12 } },
    ], {
      x: bx, y: bY, w: bW, h: bH,
      align: "center", valign: "middle", fontFace: "Calibri"
    });
  });

  // Problem / Solution
  const infoY = 2.3;

  slide.addText([
    { text: "문제  ", options: { bold: true, color: RED, fontSize: 13 } },
    { text: "세 곳에서 각각 State를 관리 → 하나 변경 시 나머지 누락 → 버그 다수 발생", options: { color: WHITE, fontSize: 13 } },
  ], {
    x: 0.4, y: infoY, w: 9.2, h: 0.5,
    fontFace: "Calibri"
  });

  slide.addText([
    { text: "해결(당시)  ", options: { bold: true, color: GREEN, fontSize: 13 } },
    { text: "상태 변경 시 세 곳 모두 수동 동기화", options: { color: WHITE, fontSize: 13 } },
  ], {
    x: 0.4, y: infoY + 0.6, w: 9.2, h: 0.5,
    fontFace: "Calibri"
  });

  // Lesson learned box
  slide.addShape(pres.shapes.RECTANGLE, {
    x: 0.4, y: infoY + 1.28, w: 9.2, h: 1.6,
    fill: { color: CARD_BG }, line: { color: GOLD, width: 1.5 }
  });
  slide.addShape(pres.shapes.RECTANGLE, {
    x: 0.4, y: infoY + 1.28, w: 0.05, h: 1.6,
    fill: { color: GOLD }, line: { color: GOLD }
  });
  slide.addText([
    { text: "회고  ", options: { bold: true, color: GOLD, fontSize: 13 } },
    { text: "Blackboard에 State 통합 → 나머지는 참조만 하는 Single Source of Truth 구조가 올바른 설계", options: { color: WHITE, fontSize: 13 } },
  ], {
    x: 0.58, y: infoY + 1.38, w: 9.0, h: 1.4,
    fontFace: "Calibri", valign: "middle"
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// SLIDE 10 — 구현 결과
// ═══════════════════════════════════════════════════════════════════════════
{
  const slide = addDarkSlide();
  addSlideTitle(slide, "구현 결과");

  // Left column header
  slide.addText("Task 1: 핵심 프로토타입 (완료)", {
    x: 0.4, y: 1.0, w: 4.4, h: 0.42,
    fontSize: 14, fontFace: "Georgia", color: GOLD, bold: true
  });
  slide.addText([
    { text: "기본 이동 + 달리기", options: { bullet: true, breakLine: true, color: WHITE, fontSize: 12 } },
    { text: "구르기·대시", options: { bullet: true, breakLine: true, color: WHITE, fontSize: 12 } },
    { text: "3연속 콤보 + 강공격", options: { bullet: true, breakLine: true, color: WHITE, fontSize: 12 } },
    { text: "히트 판정", options: { bullet: true, breakLine: true, color: WHITE, fontSize: 12 } },
    { text: "적 AI", options: { bullet: true, breakLine: true, color: WHITE, fontSize: 12 } },
    { text: "히트스톱", options: { bullet: true, breakLine: true, color: WHITE, fontSize: 12 } },
    { text: "카메라 쉐이크", options: { bullet: true, breakLine: true, color: WHITE, fontSize: 12 } },
    { text: "히트 파티클", options: { bullet: true, breakLine: true, color: WHITE, fontSize: 12 } },
    { text: "플레이어·적 HP바", options: { bullet: true, breakLine: true, color: WHITE, fontSize: 12 } },
    { text: "선형 스테이지", options: { bullet: true, color: WHITE, fontSize: 12 } },
  ], {
    x: 0.4, y: 1.46, w: 4.4, h: 3.9,
    fontFace: "Calibri", valign: "top", paraSpaceAfter: 2
  });

  // Vertical divider
  slide.addShape(pres.shapes.LINE, {
    x: 5.05, y: 1.0, w: 0, h: 4.3,
    line: { color: GOLD, width: 0.5, dashType: "dash" }
  });

  // Right column
  slide.addText("Task 2: 도전 목표", {
    x: 5.25, y: 1.0, w: 4.35, h: 0.42,
    fontSize: 14, fontFace: "Georgia", color: GOLD, bold: true
  });

  // Completed items
  slide.addText("완료", {
    x: 5.25, y: 1.5, w: 4.35, h: 0.32,
    fontSize: 11, fontFace: "Calibri", color: GOLD, bold: true
  });
  slide.addText([
    { text: "런치 공격", options: { bullet: true, breakLine: true, color: WHITE, fontSize: 12 } },
    { text: "보스 페이즈 1~2", options: { bullet: true, color: WHITE, fontSize: 12 } },
  ], {
    x: 5.25, y: 1.84, w: 4.35, h: 0.7,
    fontFace: "Calibri", valign: "top", paraSpaceAfter: 2
  });

  // Pending items
  slide.addText("미완료", {
    x: 5.25, y: 2.65, w: 4.35, h: 0.32,
    fontSize: 11, fontFace: "Calibri", color: GRAY, bold: true
  });
  slide.addText([
    { text: "회피 무적 판정", options: { bullet: true, breakLine: true, color: GRAY, fontSize: 12 } },
    { text: "콤보 카운터 UI", options: { bullet: true, breakLine: true, color: GRAY, fontSize: 12 } },
    { text: "보스 등장 연출", options: { bullet: true, color: GRAY, fontSize: 12 } },
  ], {
    x: 5.25, y: 2.99, w: 4.35, h: 1.2,
    fontFace: "Calibri", valign: "top", paraSpaceAfter: 2
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// SLIDE 11 — 마무리
// ═══════════════════════════════════════════════════════════════════════════
{
  const slide = addDarkSlide();

  slide.addText("마무리", {
    x: 0, y: 0.3, w: W, h: 0.7,
    fontSize: 36, fontFace: "Georgia", color: GOLD,
    bold: true, align: "center", valign: "middle"
  });

  // Gold border quote box
  slide.addShape(pres.shapes.RECTANGLE, {
    x: 0.7, y: 1.18, w: 8.6, h: 1.0,
    fill: { color: CARD_BG }, line: { color: GOLD, width: 2 }
  });
  slide.addText('"블루프린트만으로도 충분히 전투감 있는 액션을 만들 수 있다"', {
    x: 0.7, y: 1.18, w: 8.6, h: 1.0,
    fontSize: 16, fontFace: "Georgia", color: GOLD,
    italic: true, align: "center", valign: "middle"
  });

  // Three takeaway cards — use full slide width with small margins
  const tcGap = 0.15;
  const tcMargin = 0.4;
  const tcW = (W - 2 * tcMargin - 2 * tcGap) / 3;  // ~3.03"
  const tcH = 1.7;
  const tcY = 2.35;
  const tcStartX = tcMargin;

  const takeaways = [
    { title: "타격감", body: "애니메이션보다 히트스톱 타이밍이 핵심" },
    { title: "입력 설계", body: "노티파이 구간 설정이 콤보의 핵심" },
    { title: "설계", body: "State 단일 출처 관리로 유지보수 용이" },
  ];

  takeaways.forEach((t, i) => {
    const tx = tcStartX + i * (tcW + tcGap);
    const ty = tcY;
    slide.addShape(pres.shapes.RECTANGLE, {
      x: tx, y: ty, w: tcW, h: tcH,
      fill: { color: CARD_BG }, line: { color: "222244", width: 0.5 }
    });
    slide.addShape(pres.shapes.RECTANGLE, {
      x: tx, y: ty, w: 0.05, h: tcH,
      fill: { color: GOLD }, line: { color: GOLD }
    });
    slide.addText([
      { text: t.title, options: { bold: true, color: GOLD, fontSize: 13, breakLine: true } },
      { text: t.body, options: { color: WHITE, fontSize: 11 } },
    ], {
      x: tx + 0.13, y: ty + 0.15, w: tcW - 0.2, h: tcH - 0.3,
      valign: "middle", fontFace: "Calibri"
    });
  });

  // Bottom text
  slide.addText("2주 내 전투감 있는 액션 프로토타입 완성", {
    x: 0, y: 5.1, w: W, h: 0.4,
    fontSize: 13, fontFace: "Calibri", color: GRAY,
    align: "center", valign: "middle"
  });
}

// ─── Write file ──────────────────────────────────────────────────────────────
pres.writeFile({ fileName: "C:/workspace/Ironclad/Ironclad_발표.pptx" })
  .then(() => console.log("Saved: C:/workspace/Ironclad/Ironclad_발표.pptx"))
  .catch(err => { console.error("Error:", err); process.exit(1); });
