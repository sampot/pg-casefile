/**
 * 場景插畫：程式繪製的 noir 向量現場（純字串輸出，可單測）。
 * viewBox 一律 0 0 320 200，與熱點百分比座標對應。
 */

export const ART_WIDTH = 320;
export const ART_HEIGHT = 200;

const DEFS = `
<defs>
  <linearGradient id="wall" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#141a22"/>
    <stop offset="1" stop-color="#080a0e"/>
  </linearGradient>
  <linearGradient id="shaft" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#d6a85f" stop-opacity=".16"/>
    <stop offset="1" stop-color="#d6a85f" stop-opacity="0"/>
  </linearGradient>
  <radialGradient id="glow" cx=".5" cy=".5" r=".5">
    <stop offset="0" stop-color="#d6a85f" stop-opacity=".30"/>
    <stop offset="1" stop-color="#d6a85f" stop-opacity="0"/>
  </radialGradient>
  <radialGradient id="redglow" cx=".5" cy=".5" r=".5">
    <stop offset="0" stop-color="#c9463f" stop-opacity=".42"/>
    <stop offset="1" stop-color="#c9463f" stop-opacity="0"/>
  </radialGradient>
  <radialGradient id="vignette" cx=".5" cy=".45" r=".75">
    <stop offset=".55" stop-color="#000" stop-opacity="0"/>
    <stop offset="1" stop-color="#000" stop-opacity=".72"/>
  </radialGradient>
</defs>`;

const blinds = (x, skew) =>
  [0, 1, 2]
    .map((i) => {
      const left = x + i * 26;
      return `<path d="M${left} 0 L${left + 16} 0 L${left + 16 + skew} 200 L${left + skew} 200Z" fill="url(#shaft)"/>`;
    })
    .join("");

const floor = (y) =>
  `<rect x="0" y="${y}" width="320" height="${200 - y}" fill="#070a0d"/>` +
  `<line x1="0" y1="${y}" x2="320" y2="${y}" stroke="#33404c" stroke-width="1"/>`;

const frame = (body) =>
  `<svg viewBox="0 0 ${ART_WIDTH} ${ART_HEIGHT}" role="img" preserveAspectRatio="none">${DEFS}` +
  `<rect width="320" height="200" fill="url(#wall)"/>${body}` +
  `<rect width="320" height="200" fill="url(#vignette)"/></svg>`;

const ART = {
  archive: () =>
    frame(
      blinds(150, -28) +
        floor(150) +
        // 卷宗鐵架
        `<g stroke="#3c4a57" fill="none" stroke-width="1.5">
          <rect x="20" y="40" width="75" height="110"/>
          <line x1="20" y1="68" x2="95" y2="68"/><line x1="20" y1="96" x2="95" y2="96"/>
          <line x1="20" y1="124" x2="95" y2="124"/>
        </g>
        <g fill="#1d2630">
          <rect x="24" y="48" width="10" height="19"/><rect x="36" y="45" width="8" height="22"/>
          <rect x="46" y="50" width="12" height="17"/><rect x="62" y="46" width="9" height="21"/>
          <rect x="24" y="76" width="14" height="19"/><rect x="41" y="74" width="9" height="21"/>
          <rect x="70" y="102" width="12" height="21"/><rect x="26" y="104" width="16" height="19"/>
        </g>
        <rect x="50" y="99" width="18" height="24" fill="#2b3742" stroke="#6d7a86" stroke-width="1"/>` +
        // 鐵櫃
        `<g stroke="#42505d" fill="#131a22" stroke-width="1.5">
          <rect x="110" y="60" width="50" height="90"/>
        </g>
        <g stroke="#42505d" stroke-width="1">
          <line x1="110" y1="90" x2="160" y2="90"/><line x1="110" y1="120" x2="160" y2="120"/>
        </g>
        <g fill="#6d7a86"><rect x="128" y="73" width="14" height="3"/><rect x="128" y="103" width="14" height="3"/>
        <rect x="128" y="133" width="14" height="3"/></g>
        <circle cx="152" cy="76" r="2.4" fill="#d6a85f"/>` +
        // 桌燈與書桌
        `<ellipse cx="240" cy="150" rx="58" ry="14" fill="url(#glow)"/>
        <path d="M232 62 L214 116 L262 116Z" fill="#d6a85f" opacity=".13"/>
        <path d="M226 56 h20 l7 10 h-34Z" fill="#2b3742" stroke="#7c8894" stroke-width="1"/>
        <line x1="236" y1="30" x2="236" y2="56" stroke="#4a5764" stroke-width="1.5"/>
        <circle cx="236" cy="68" r="3" fill="#ffe6a8"/>
        <rect x="190" y="116" width="100" height="6" fill="#242f3a" stroke="#4a5764" stroke-width="1"/>
        <rect x="196" y="122" width="34" height="26" fill="#1a222b" stroke="#3c4a57" stroke-width="1"/>
        <line x1="196" y1="135" x2="230" y2="135" stroke="#3c4a57"/>
        <line x1="284" y1="122" x2="284" y2="150" stroke="#3c4a57" stroke-width="1.5"/>
        <rect x="244" y="106" width="26" height="10" fill="#0f151b" stroke="#4a5764"/>` +
        // 通風口
        `<rect x="250" y="30" width="45" height="30" fill="#0d1218" stroke="#4a5764" stroke-width="1.5"/>
        <g stroke="#33404c" stroke-width="2">
          <line x1="252" y1="37" x2="293" y2="37"/><line x1="252" y1="44" x2="293" y2="44"/>
          <line x1="252" y1="51" x2="293" y2="51"/>
        </g>
        <g fill="#6d7a86"><circle cx="254" cy="33" r="1.3"/><circle cx="291" cy="33" r="1.3"/>
        <circle cx="254" cy="57" r="1.3"/><circle cx="291" cy="57" r="1.3"/></g>`
    ),

  darkroom: () =>
    frame(
      `<circle cx="40" cy="35" r="46" fill="url(#redglow)"/>` +
        floor(158) +
        // 安全燈
        `<path d="M28 22 h24 l6 14 h-36Z" fill="#241318" stroke="#7d3b3b" stroke-width="1.2"/>
        <circle cx="40" cy="40" r="6" fill="#c9463f"/>
        <line x1="40" y1="8" x2="40" y2="22" stroke="#4a5764" stroke-width="1.5"/>` +
        // 曬圖線與底片
        `<path d="M78 40 Q170 66 268 44" fill="none" stroke="#4a5764" stroke-width="1.2"/>
        <g fill="#131b23" stroke="#5d6b78" stroke-width="1">
          <rect x="98" y="50" width="26" height="34"/><rect x="146" y="57" width="26" height="34"/>
          <rect x="196" y="56" width="26" height="34"/>
        </g>
        <g fill="#26323d">
          <rect x="102" y="56" width="18" height="10"/><rect x="150" y="63" width="18" height="10"/>
          <rect x="200" y="62" width="18" height="10"/>
        </g>
        <g stroke="#8b97a3" stroke-width="1.2">
          <line x1="104" y1="46" x2="110" y2="52"/><line x1="152" y1="53" x2="158" y2="59"/>
          <line x1="202" y1="52" x2="208" y2="58"/>
        </g>` +
        // 顯影槽與工作檯
        `<rect x="52" y="146" width="128" height="6" fill="#242f3a" stroke="#4a5764" stroke-width="1"/>
        <g fill="#101820" stroke="#5d6b78" stroke-width="1.2">
          <rect x="60" y="124" width="34" height="22" rx="2"/><rect x="98" y="124" width="34" height="22" rx="2"/>
          <rect x="136" y="124" width="34" height="22" rx="2"/>
        </g>
        <rect x="62" y="132" width="30" height="12" fill="#1d3038" opacity=".8"/>
        <path d="M150 106 h14 l3 18 h-20Z" fill="#2b3742" stroke="#8b97a3" stroke-width="1"/>
        <rect x="153" y="110" width="8" height="6" fill="#d6a85f" opacity=".7"/>` +
        // 廢紙簍
        `<path d="M252 126 h38 l-6 34 h-26Z" fill="#101820" stroke="#5d6b78" stroke-width="1.2"/>
        <g fill="#2f3b46"><rect x="258" y="120" width="12" height="8" transform="rotate(-16 264 124)"/>
        <rect x="272" y="122" width="11" height="7" transform="rotate(12 277 125)"/></g>`
    ),

  office: () =>
    frame(
      blinds(196, -34) +
        floor(154) +
        // 大衣架
        `<line x1="37" y1="58" x2="37" y2="158" stroke="#4a5764" stroke-width="2"/>
        <path d="M22 62 h30" stroke="#4a5764" stroke-width="2"/>
        <path d="M24 66 q13 8 13 34 l-4 40 h-20 l-3 -42 q0 -24 14 -32Z" fill="#1b232c" stroke="#6d7a86" stroke-width="1.2"/>
        <line x1="26" y1="86" x2="24" y2="132" stroke="#33404c"/>
        <circle cx="20" cy="104" r="2" fill="#d6a85f" opacity=".8"/>` +
        // 掛鐘（停在 23:14）
        `<circle cx="120" cy="42" r="22" fill="#0f151b" stroke="#6d7a86" stroke-width="1.6"/>
        <circle cx="120" cy="42" r="17" fill="none" stroke="#33404c"/>
        <line x1="120" y1="42" x2="113" y2="30" stroke="#d6a85f" stroke-width="1.8"/>
        <line x1="120" y1="42" x2="134" y2="35" stroke="#d6a85f" stroke-width="1.4"/>
        <g stroke="#5d6b78"><line x1="106" y1="30" x2="132" y2="56"/><line x1="132" y1="32" x2="112" y2="54"/></g>` +
        // 保險箱
        `<rect x="235" y="55" width="60" height="60" fill="#111820" stroke="#6d7a86" stroke-width="1.8"/>
        <rect x="243" y="63" width="44" height="44" fill="none" stroke="#33404c"/>
        <g fill="#2b3742">
          <rect x="250" y="70" width="8" height="7"/><rect x="261" y="70" width="8" height="7"/><rect x="272" y="70" width="8" height="7"/>
          <rect x="250" y="80" width="8" height="7"/><rect x="261" y="80" width="8" height="7"/><rect x="272" y="80" width="8" height="7"/>
          <rect x="250" y="90" width="8" height="7"/><rect x="261" y="90" width="8" height="7"/><rect x="272" y="90" width="8" height="7"/>
        </g>
        <circle cx="289" cy="85" r="2.4" fill="#c9463f"/>` +
        // 辦公桌與抽屜
        `<rect x="95" y="110" width="135" height="8" fill="#26313c" stroke="#5d6b78" stroke-width="1"/>
        <rect x="100" y="118" width="60" height="34" fill="#161e26" stroke="#3c4a57" stroke-width="1"/>
        <line x1="100" y1="132" x2="160" y2="132" stroke="#3c4a57"/>
        <rect x="120" y="124" width="18" height="3" fill="#8b97a3"/>
        <rect x="120" y="138" width="18" height="3" fill="#8b97a3"/>
        <line x1="222" y1="118" x2="222" y2="154" stroke="#3c4a57" stroke-width="1.6"/>
        <path d="M172 110 v-16 q22 -12 40 0 v16" fill="#111820" stroke="#4a5764" stroke-width="1.2"/>
        <rect x="178" y="100" width="34" height="10" fill="#0d1218"/>`
    ),

  storeroom: () =>
    frame(
      `<ellipse cx="230" cy="60" rx="90" ry="46" fill="url(#glow)" opacity=".5"/>` +
        floor(152) +
        // 蒸汽主管
        `<rect x="0" y="48" width="320" height="14" fill="#1a222b" stroke="#5d6b78" stroke-width="1.2"/>
        <g fill="#26313c" stroke="#5d6b78" stroke-width="1">
          <rect x="60" y="44" width="8" height="22"/><rect x="290" y="44" width="8" height="22"/>
        </g>
        <path d="M108 48 q10 -7 18 2 q8 8 16 -2" fill="none" stroke="#c9463f" stroke-width="1.6"/>
        <rect x="200" y="40" width="45" height="35" fill="#101820" stroke="#8b97a3" stroke-width="1.5"/>
        <g fill="#6d7a86"><circle cx="205" cy="45" r="1.8"/><circle cx="240" cy="45" r="1.8"/>
        <circle cx="205" cy="70" r="1.8"/><circle cx="240" cy="70" r="1.8"/></g>
        <line x1="205" y1="45" x2="240" y2="70" stroke="#33404c"/>
        <circle cx="278" cy="55" r="11" fill="none" stroke="#8b97a3" stroke-width="1.6"/>
        <g stroke="#8b97a3" stroke-width="1.4"><line x1="267" y1="55" x2="289" y2="55"/><line x1="278" y1="44" x2="278" y2="66"/></g>` +
        // 木箱堆
        `<g fill="#151d25" stroke="#5d6b78" stroke-width="1.2">
          <rect x="25" y="120" width="52" height="32"/><rect x="30" y="94" width="44" height="26"/>
          <rect x="76" y="112" width="40" height="40"/>
        </g>
        <g stroke="#33404c"><line x1="25" y1="120" x2="77" y2="152"/><line x1="77" y1="120" x2="25" y2="152"/>
        <line x1="76" y1="112" x2="116" y2="152"/><line x1="116" y1="112" x2="76" y2="152"/></g>
        <rect x="36" y="100" width="20" height="8" fill="#d6a85f" opacity=".22"/>` +
        // 工具架
        `<rect x="130" y="86" width="60" height="6" fill="#26313c" stroke="#5d6b78" stroke-width="1"/>
        <g stroke="#8b97a3" stroke-width="1.6" fill="none">
          <path d="M140 92 v18 l5 6"/><path d="M158 92 v14 m-4 0 h8"/>
        </g>
        <path d="M172 92 v10 q0 8 6 8 q6 0 6 -8" fill="none" stroke="#5d6b78" stroke-width="1.6" stroke-dasharray="3 3"/>` +
        // 地面油污
        `<ellipse cx="245" cy="165" rx="26" ry="9" fill="#05070a"/>
        <ellipse cx="245" cy="165" rx="26" ry="9" fill="none" stroke="#2b3742"/>
        <ellipse cx="256" cy="172" rx="8" ry="3" fill="#05070a"/>`
    ),

  dutyroom: () =>
    frame(
      blinds(8, 22) +
        floor(156) +
        // 打卡鐘
        `<rect x="30" y="35" width="55" height="50" rx="3" fill="#111820" stroke="#6d7a86" stroke-width="1.6"/>
        <circle cx="57" cy="52" r="11" fill="#0b1015" stroke="#8b97a3"/>
        <line x1="57" y1="52" x2="57" y2="45" stroke="#d6a85f" stroke-width="1.4"/>
        <line x1="57" y1="52" x2="63" y2="55" stroke="#d6a85f" stroke-width="1.2"/>
        <rect x="42" y="70" width="30" height="4" fill="#05070a" stroke="#4a5764"/>
        <rect x="48" y="74" width="18" height="10" fill="#e9e0c8" opacity=".55"/>` +
        // 布告欄
        `<rect x="105" y="30" width="100" height="65" fill="#1c1710" stroke="#7c6a45" stroke-width="2"/>
        <g fill="#d8cfb4" opacity=".82">
          <rect x="113" y="38" width="26" height="20"/><rect x="146" y="42" width="24" height="18"/>
          <rect x="176" y="37" width="22" height="22"/><rect x="116" y="66" width="52" height="9"/>
          <rect x="116" y="79" width="38" height="7"/>
        </g>
        <g fill="#3c4a57"><circle cx="126" cy="41" r="1.6"/><circle cx="158" cy="45" r="1.6"/><circle cx="187" cy="40" r="1.6"/></g>
        <g fill="#5b5344"><circle cx="126" cy="47" r="4"/><circle cx="158" cy="50" r="4"/><circle cx="187" cy="46" r="4"/></g>` +
        // 置物櫃
        `<g fill="#131b23" stroke="#5d6b78" stroke-width="1.4">
          <rect x="235" y="55" width="22" height="110"/><rect x="257" y="55" width="22" height="110"/>
          <rect x="279" y="55" width="22" height="110"/>
        </g>
        <g stroke="#33404c" stroke-width="1">
          <line x1="238" y1="70" x2="254" y2="70"/><line x1="260" y1="70" x2="276" y2="70"/><line x1="282" y1="70" x2="298" y2="70"/>
          <line x1="238" y1="74" x2="254" y2="74"/><line x1="260" y1="74" x2="276" y2="74"/><line x1="282" y1="74" x2="298" y2="74"/>
        </g>
        <g fill="#8b97a3"><rect x="252" y="106" width="3" height="9"/><rect x="274" y="106" width="3" height="9"/>
        <rect x="296" y="106" width="3" height="9"/></g>
        <path d="M257 90 l22 0" stroke="#c9463f" stroke-width="1.2" opacity=".6"/>` +
        // 桌上收音機
        `<rect x="112" y="142" width="76" height="6" fill="#26313c" stroke="#4a5764"/>
        <rect x="120" y="116" width="55" height="26" rx="3" fill="#171009" stroke="#8b7550" stroke-width="1.4"/>
        <rect x="125" y="121" width="26" height="14" fill="#d6a85f" opacity=".25"/>
        <g fill="#8b7550"><circle cx="160" cy="124" r="4"/><circle cx="160" cy="135" r="4"/></g>
        <line x1="170" y1="116" x2="182" y2="96" stroke="#8b97a3" stroke-width="1.2"/>`
    ),
};

export function sceneArt(sceneId) {
  const draw = ART[sceneId];
  return draw ? draw() : "";
}

export function hasArt(sceneId) {
  return typeof ART[sceneId] === "function";
}
