/**
 * 陳年卷宗 — 案件資料（純資料，無 DOM）。
 *
 * 座標系：熱點以場景畫布的百分比表示（cx／cy＝中心，w／h＝寬高）。
 */

export const CASE_TITLE = "陳年卷宗";
export const CASE_SUBTITLE = "海線舊站・1987 蒸汽管事故";

export const CASE_BRIEF =
  "一九八七年三月十二日夜，海線舊站的蒸汽主管在二十三時十四分爆裂，夜班工人林火土當場死亡。" +
  "官方以「意外・值班失職」結案，電務員郭阿信背了三十年。今夜舊站要拆，你有一夜的時間把卷宗翻過來。";

export const ITEMS = {
  dossier: {
    name: "結案卷宗",
    icon: "▤",
    desc: "1987 年舊站事故結案報告。結論欄：意外。責任欄：電務員郭阿信。",
  },
  magnifier: {
    name: "放大鏡",
    icon: "◎",
    desc: "黃銅柄放大鏡，鏡片有一道刮痕。可用來細看細節與焦黑的字跡。",
  },
  brassKey: {
    name: "銅鑰匙",
    icon: "⚷",
    desc: "刻著「檔 3」的小銅鑰匙，齒紋磨得發亮。",
  },
  screwdriver: {
    name: "十字起子",
    icon: "†",
    desc: "握柄纏著電火布的舊起子，能卸下面板螺絲。",
  },
  rosterBurnt: {
    name: "燒焦班表",
    icon: "▧",
    desc: "三月份的值班表，右半邊燒成焦炭，值班欄看不清楚。",
  },
  negative: {
    name: "未沖洗底片",
    icon: "▥",
    desc: "一截 35mm 底片，還沒顯影，對光只看得到模糊的月台。",
  },
  developer: {
    name: "顯影劑",
    icon: "⚗",
    desc: "半瓶顯影藥水，標籤寫著 1987.03，蓋子沒鎖緊。",
  },
  photo: {
    name: "顯影照片",
    icon: "▣",
    desc: "沖出來了：23:14 的月台，有人背對鏡頭站在蒸汽管旁，披著站長的呢大衣。",
  },
  rosterRead: {
    name: "復原班表",
    icon: "▩",
    desc: "焦痕下的原始筆跡：3/12 夜班原本排的是記帳員沈品瑤，後來被改成郭阿信。",
  },
  letterA: {
    name: "撕碎信件（上半）",
    icon: "✉",
    desc: "撕開的信紙上半段：「這三年的短少我算過了，這禮拜不對帳，我就……」",
  },
  letterB: {
    name: "撕碎信件（下半）",
    icon: "✉",
    desc: "撕開的信紙下半段：「……交給鐵路警察。林火土。」",
  },
  letter: {
    name: "完整信件",
    icon: "✱",
    desc: "拼好的信：死者林火土在事故前一週，要求某人對帳，否則報警。收件人欄被撕掉了。",
  },
  timecard: {
    name: "打卡卡片",
    icon: "▭",
    desc: "3/12 的打卡紀錄：呂維中 22:38 下卡、郭阿信 23:02 上卡、沈品瑤 無紀錄。",
  },
  logbook: {
    name: "行車日誌",
    icon: "▬",
    desc: "站長筆跡的行車日誌，22:40 註記「站長離站赴鎮公所會議」，後面是別人的字。",
  },
  timeline: {
    name: "時序對照表",
    icon: "◫",
    desc: "打卡與日誌對得起來：呂維中 22:38 離站，事故時人在鎮公所。他不在場。",
  },
  ledger: {
    name: "私帳本",
    icon: "▦",
    desc: "保險箱裡的第二本帳：三年間站務零用金短少十二萬，經手欄一律是沈品瑤。",
  },
  hairpin: {
    name: "珍珠髮夾",
    icon: "❀",
    desc: "從蒸汽管檢修蓋內側夾出來的珍珠髮夾，鍍層被高溫燻黑，齒間卡著閥門的鐵屑。",
  },
};

/** 推理卡：指認畫面上可以擺進動機／機會／物證三格的東西。 */
export const EVIDENCE = {
  evOfficial: {
    name: "官方結案報告",
    tag: "背景",
    note: "結論寫意外、責任推給值班的郭阿信——但值班欄本身可能是假的。",
  },
  evCast: {
    name: "關係人名冊",
    tag: "背景",
    note: "當年站上三個人碰得到蒸汽閥：站長呂維中、電務員郭阿信、記帳員沈品瑤。",
  },
  evLetter: {
    name: "死者的信",
    tag: "動機",
    note: "林火土要求對帳否則報警。信上沒有收件人，單獨拿去只是一張匿名紙。",
  },
  evLedger: {
    name: "私帳本",
    tag: "動機",
    note: "三年短少十二萬，每一筆經手人都是沈品瑤。這是有名有姓的動機。",
  },
  evRoster: {
    name: "復原班表",
    tag: "機會",
    note: "3/12 夜班原本排沈品瑤，事後才被改成郭阿信。她那晚該在站上。",
  },
  evTimeline: {
    name: "站長時序",
    tag: "機會",
    note: "呂維中 22:38 下卡赴會，事故時不在站上——這是排除，不是指認。",
  },
  evOil: {
    name: "機油足跡",
    tag: "機會",
    note: "郭阿信的機油腳印全在月台北端配電室，離蒸汽管六十公尺。",
  },
  evPhoto: {
    name: "23:14 照片",
    tag: "物證",
    note: "照片拍到的是那件站長大衣，不是穿它的人。臉沒入蒸汽裡。",
  },
  evCoat: {
    name: "大衣袖口",
    tag: "物證",
    note: "站長大衣掛在辦公室、袖口沾著粉餅與燙痕——那晚有人借走過它。",
  },
  evHairpin: {
    name: "檢修蓋髮夾",
    tag: "物證",
    note: "髮夾卡在只有徒手開閥才會碰到的檢修蓋內側，齒間有閥門鐵屑。",
  },
};

/** 道具組合（順序無關）。 */
export const COMBOS = [
  {
    a: "negative",
    b: "developer",
    result: "photo",
    consumes: ["negative", "developer"],
    evidence: "evPhoto",
    text: "藥水漫過底片，月台從灰霧裡浮出來——23:14，有人站在蒸汽管旁。",
  },
  {
    a: "rosterBurnt",
    b: "magnifier",
    result: "rosterRead",
    consumes: ["rosterBurnt"],
    evidence: "evRoster",
    text: "焦炭底下壓著更深的筆痕：3/12 夜班原本不是郭阿信。",
  },
  {
    a: "letterA",
    b: "letterB",
    result: "letter",
    consumes: ["letterA", "letterB"],
    evidence: "evLetter",
    text: "兩截信紙的撕口咬合了，署名是死者林火土。",
  },
  {
    a: "timecard",
    b: "logbook",
    result: "timeline",
    consumes: [],
    evidence: "evTimeline",
    text: "打卡與日誌並排一看，站長那晚 22:38 就離站了。",
  },
];

export const SUSPECTS = {
  lu: {
    name: "呂維中",
    role: "站長・55 歲",
    portrait: "▲",
    line: "「那件大衣誰都借得走，我當晚在鎮公所開會。」",
  },
  kuo: {
    name: "郭阿信",
    role: "電務員・31 歲（當年）",
    portrait: "◆",
    line: "「班表上寫我值班，可我那晚在北端修配電盤。」",
  },
  shen: {
    name: "沈品瑤",
    role: "記帳員・28 歲（當年）",
    portrait: "●",
    line: "「帳我對了三年，一毛不差。那晚我根本沒排班。」",
  },
};

export const CULPRIT = "shen";

/** 定罪需要的三格答案。 */
export const VERDICT_KEY = {
  motive: "evLedger",
  opportunity: "evRoster",
  physical: "evHairpin",
};

export const SLOTS = [
  { id: "motive", name: "動機", hint: "誰非得讓林火土閉嘴？" },
  { id: "opportunity", name: "機會", hint: "23:14 誰在蒸汽管旁？" },
  { id: "physical", name: "物證", hint: "什麼東西只有兇手會留下？" },
];

/** 指認被駁回時的針對性反駁（依錯誤內容給提示，而不是罐頭訊息）。 */
export const REBUTTALS = {
  suspect: {
    lu: "檢察官敲桌：「呂維中 22:38 就下卡赴會，打卡與行車日誌對得起來。他不在站上，你告不了他。」",
    kuo: "檢察官敲桌：「郭阿信的腳印全在北端配電室。你要重判一次三十年前判錯的人？」",
    none: "檢察官把卷宗推回來：「你連要告誰都還沒寫。」",
  },
  motive: {
    evLetter: "「信上沒有收件人。辯護人會說那是死者寫給任何人的。動機要有名有姓。」",
    evOfficial: "「官方報告是要被推翻的東西，不是動機。」",
    evCast: "「名冊只說明誰在站上，不說明誰想殺人。」",
    empty: "「動機空著。你要法官自己想像？」",
    other: "「這一張撐不起殺人動機。找出有名字、有金額的那一本。」",
  },
  opportunity: {
    evTimeline: "「時序表證明的是呂維中不在場。排除不等於指認。」",
    evOil: "「機油足跡只洗清了郭阿信。」",
    empty: "「機會空著。她那晚憑什麼在站上？」",
    other: "「這證明不了她 23:14 該出現在月台。查值班表。」",
  },
  physical: {
    evPhoto: "「照片裡是那件大衣，不是穿它的人。臉在蒸汽裡。」",
    evCoat: "「袖口只證明大衣被借走，借的人可以是任何人。」",
    empty: "「物證空著。沒有東西把她的手放在閥門上。」",
    other: "「這件東西碰不到閥門。找只有徒手開閥才會留下的東西。」",
  },
};

export const VERDICT_WIN =
  "髮夾送驗，齒間鐵屑與蒸汽閥門吻合；私帳本補上動機，復原班表把她放回 3/12 的夜班。" +
  "沈品瑤在偵訊室第三個小時承認：她鬆開閥門時只想製造一場停駛，沒想到林火土會回頭去關。" +
  "郭阿信的名字，三十年後從責任欄劃掉。";

export const VERDICT_LOSE =
  "第三次退件。天亮了，怪手開進舊站，卷宗連同月台一起封進水泥。林火土的名字停在「意外」那一欄。";

export const SCENES = {
  archive: {
    name: "檔案室",
    line: "鐵架之間全是霉味，日光燈壞了一半。",
    hotspots: [
      {
        id: "shelf",
        name: "舊卷宗架",
        cx: 17.8,
        cy: 47.5,
        w: 24,
        h: 56,
        look: "三排鐵架，1987 那格被抽出來過——邊緣的灰塵有新的指痕。",
        gives: "dossier",
        evidence: "evOfficial",
        sound: "paper",
        repeat: "架上只剩空檔夾與灰。",
      },
      {
        id: "cabinet",
        name: "鐵櫃",
        cx: 42.2,
        cy: 52.5,
        w: 17,
        h: 46,
        look: "上鎖的鐵櫃，鎖孔邊刻著一個小小的「檔 3」。",
        requires: "brassKey",
        lockedText: "櫃門紋風不動，鎖孔邊刻著「檔 3」。得找到對應的鑰匙。",
        useText: "銅鑰匙轉了兩圈，門軸慘叫一聲。裡面塞著一疊燒過的紙。",
        gives: "rosterBurnt",
        sound: "creak",
        repeat: "櫃裡剩下的都是空白表格。",
      },
      {
        id: "desk",
        name: "值班桌燈",
        cx: 75,
        cy: 62.5,
        w: 30,
        h: 26,
        look: "桌燈還會亮。抽屜卡了一半，裡面滾出一支黃銅放大鏡。",
        gives: "magnifier",
        sound: "latch",
        repeat: "抽屜空了，燈罩上停著一隻乾掉的飛蛾。",
      },
      {
        id: "vent",
        name: "通風口",
        cx: 85,
        cy: 22.5,
        w: 16,
        h: 17,
        look: "牆上的通風口，柵格後面卡著白色的東西。四顆十字螺絲。",
        requires: "screwdriver",
        lockedText: "柵格後面卡著紙，但四顆十字螺絲鎖死了。",
        useText: "螺絲一顆顆落地，你從灰網後夾出半張信紙。",
        gives: "letterA",
        sound: "paper",
        repeat: "通風口只剩三十年的煤灰。",
      },
    ],
  },
  darkroom: {
    name: "暗房",
    line: "紅燈還亮著，藥水味濃得像有人昨天才離開。",
    hotspots: [
      {
        id: "lamp",
        name: "紅燈",
        cx: 12.5,
        cy: 17.5,
        w: 14,
        h: 20,
        look: "安全燈的紅光把一切壓成血色。牆上釘著手寫流程：底片＋顯影劑。",
        evidence: null,
        sound: "click",
        repeat: "紅燈嗡嗡作響，像有人在耳邊清喉嚨。",
      },
      {
        id: "line",
        name: "曬圖夾",
        cx: 53,
        cy: 29,
        w: 52,
        h: 22,
        look: "曬圖線上夾著一截沒沖洗的 35mm 底片，剪口很急。",
        gives: "negative",
        sound: "cloth",
        repeat: "剩下的夾子空盪盪地晃。",
      },
      {
        id: "tray",
        name: "顯影槽",
        cx: 36,
        cy: 66,
        w: 36,
        h: 20,
        look: "三個瓷槽都乾了，架上還立著半瓶顯影劑，標籤寫 1987.03。",
        gives: "developer",
        sound: "latch",
        repeat: "槽底結著一層鹽花。",
      },
      {
        id: "bin",
        name: "廢紙簍",
        cx: 84,
        cy: 71,
        w: 16,
        h: 22,
        look: "紙簍底層壓著一截撕碎的信紙下半段，字跡被藥水暈開一角。",
        gives: "letterB",
        sound: "paper",
        repeat: "剩下的都是廢相紙。",
      },
    ],
  },
  office: {
    name: "站長室",
    line: "皮椅上的凹痕還在，好像有人剛站起來。",
    hotspots: [
      {
        id: "coat",
        name: "大衣架",
        cx: 11.5,
        cy: 55,
        w: 14,
        h: 52,
        look: "站長的呢大衣掛了三十年。口袋深處有一把刻著「檔 3」的小銅鑰匙。",
        gives: "brassKey",
        sound: "cloth",
        repeat: "大衣沉甸甸地垂著，聞得到樟腦。",
        bonus: {
          needs: ["photo"],
          evidence: "evCoat",
          text: "照片裡那件就是它。你翻開袖口：粉餅的痕跡，還有一小塊蒸汽燙焦——站長不擦粉。",
        },
      },
      {
        id: "clock",
        name: "掛鐘",
        cx: 37.5,
        cy: 21,
        w: 16,
        h: 26,
        look: "掛鐘停在 23:14，玻璃裂成蛛網。有人用鉛筆在鐘面下寫了「保險箱」。",
        sets: "knowsCode",
        sound: "click",
        repeat: "23:14。指針再也不會動了。",
      },
      {
        id: "safe",
        name: "保險箱",
        cx: 83,
        cy: 42.5,
        w: 20,
        h: 32,
        look: "牆內嵌的四位數保險箱，轉盤換成了按鍵，鍵面被磨得發白。",
        keypad: {
          length: 4,
          code: "2314",
          needs: "knowsCode",
          needsText: "四位數字。你還不知道該按什麼——站長室裡總有人把號碼寫在順手的地方。",
          gives: "ledger",
          evidence: "evLedger",
          okText: "喀。箱門彈開，裡面只有一本沒有封面的帳。",
          failText: "紅燈閃了一下，鎖芯重新咬死。",
        },
        sound: "latch",
        repeat: "保險箱空了，只剩一層絨布。",
      },
      {
        id: "drawer",
        name: "辦公桌抽屜",
        cx: 44,
        cy: 66,
        w: 24,
        h: 20,
        look: "抽屜裡是行車日誌，22:40 那行之後，筆跡換了一個人。",
        gives: "logbook",
        sound: "creak",
        repeat: "其餘都是空白表單與斷掉的鉛筆。",
      },
    ],
  },
  storeroom: {
    name: "月台倉庫",
    line: "蒸汽主管從這裡出去，管壁還留著爆裂那年的裂唇。",
    hotspots: [
      {
        id: "crates",
        name: "木箱堆",
        cx: 22,
        cy: 62.5,
        w: 30,
        h: 32,
        look: "疊到天花板的木箱，標籤都是站務耗材。有一箱被拖開過，地板刮出弧線。",
        sound: "cloth",
        repeat: "木箱裡只有生鏽的道釘。",
      },
      {
        id: "toolrack",
        name: "工具架",
        cx: 49,
        cy: 47.5,
        w: 20,
        h: 24,
        look: "工具架上少了一支管鉗，剩一支纏電火布的十字起子。",
        gives: "screwdriver",
        sound: "latch",
        repeat: "掛勾空著，形狀還印在牆上的油污裡。",
      },
      {
        id: "pipe",
        name: "蒸汽管檢修蓋",
        cx: 69,
        cy: 28.5,
        w: 18,
        h: 22,
        look: "爆裂點旁的檢修蓋，螺絲被人上得歪歪的——當年拆過又鎖回去。",
        requires: "screwdriver",
        lockedText: "檢修蓋的螺絲頭都磨花了，徒手轉不開。",
        useText: "蓋子掀開，內側的積碳裡卡著一枚珍珠髮夾。",
        gives: "hairpin",
        evidence: "evHairpin",
        sound: "creak",
        repeat: "檢修蓋敞著，裡頭是三十年的積碳。",
      },
      {
        id: "stain",
        name: "地面油污",
        cx: 76.5,
        cy: 82.5,
        w: 22,
        h: 16,
        look: "地上一片黑漬。光線太暗，看不出是油還是血。",
        requires: "magnifier",
        lockedText: "黑漬的紋路太細，肉眼分不出是機油還是別的。",
        useText: "放大鏡下是鞋底的機油紋，尺寸與方向都指向北端配電室——郭阿信那晚在的地方。",
        evidence: "evOil",
        sound: "found",
        repeat: "油痕已經記在筆記本上了。",
      },
    ],
  },
  dutyroom: {
    name: "值班室",
    line: "牆上的班表褪成米色，收音機還插著電。",
    hotspots: [
      {
        id: "punch",
        name: "打卡鐘",
        cx: 18,
        cy: 30,
        w: 20,
        h: 28,
        look: "打卡鐘的卡匣沒清過。3/12 那疊還在最上面。",
        gives: "timecard",
        sound: "click",
        repeat: "卡匣裡剩下空白卡。",
      },
      {
        id: "board",
        name: "布告欄",
        cx: 48,
        cy: 31,
        w: 34,
        h: 36,
        look: "泛黃的人事公告：那年站上碰得到蒸汽閥的只有三個人——站長呂維中、電務員郭阿信、記帳員沈品瑤。",
        evidence: "evCast",
        sets: "knowsCast",
        sound: "paper",
        repeat: "三張大頭照被日光曬得只剩輪廓。",
      },
      {
        id: "lockers",
        name: "置物櫃",
        cx: 84,
        cy: 55,
        w: 24,
        h: 56,
        look: "郭阿信的櫃子沒鎖，裡面是洗不掉的機油味與一雙工作靴。沈品瑤的櫃子連名條都撕了。",
        sound: "creak",
        repeat: "櫃門開開闔闔，撞出空洞的迴音。",
      },
      {
        id: "radio",
        name: "老收音機",
        cx: 46,
        cy: 65,
        w: 20,
        h: 18,
        look: "旋鈕一轉，雜訊裡漏出半句地方電台：「……舊站今晨開拆，家屬仍要求重啟調查……」",
        sound: "click",
        repeat: "只剩雜訊。",
      },
    ],
  },
};

export const SCENE_ORDER = ["archive", "darkroom", "office", "storeroom", "dutyroom"];

export const TUTORIAL = [
  "現場的光點就是熱點——直接點下去搜查。",
  "搜到的東西進下方證物欄。先點證物選取，再點熱點就是「使用」。",
  "連點兩件證物可以嘗試組合，拼出新的線索。",
  "線索夠了就開「指認」，把動機／機會／物證擺上桌。指錯三次，卷宗封存。",
];
