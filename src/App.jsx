import { useState, useEffect, useRef, useCallback } from "react";

/* ===== スタイル ===== */
const S = {
  bg: "#f0f2f5",
  card: { background: "#fff", borderRadius: 12, boxShadow: "0 1px 4px rgba(0,0,0,0.06)", overflow: "hidden" },
  input: { width: "100%", padding: "10px 12px", border: "1px solid #ddd", borderRadius: 8, fontSize: 13, outline: "none" },
  btn: (c) => ({ background: c, color: "#fff", border: "none", borderRadius: 8, padding: "10px 20px", cursor: "pointer", fontSize: 13, fontWeight: 600 }),
};

/* ===== ローカルストレージ ===== */
const stor = {
  get: (k) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : null; } catch { return null; } },
  set: (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} },
  list: (prefix) => {
    const keys = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k.startsWith(prefix)) keys.push(k);
    }
    return keys;
  }
};

const ADMIN_PASS = "meeks2025";

/* ===== 手順書データ ===== */
const MANUALS = [
  {
    id:"delivery",icon:"📋",title:"納入時作業手順書",tag:"2025年度版 修正版",color:"#1B4F72",
    sections:[
      {title:"出発前点検事項（会社出発前）",content:"【出発前5点確認】会社を出発する前に指差し呼称で確認：\n①アウトリガー格納：敷板回収・ロック確認\n②ブーム格納：ワイヤー乱巻なし・正しく格納\n③製品荷締め：落下・荷崩れの可能性なし\n④部材荷締め：走行中に飛ばされる可能性なし\n⑤不具合修正：不具合を認識したままの出発は禁止"},
      {title:"作業手順一覧（No.1〜12）",content:"No.1 出発前点検：5点確認を実施。不具合のある状態で出発しない。\nNo.2 現場到着：現場前に停車。監督・業者様に電話連絡。8:00指定は30分以上前の進入禁止。\nNo.3 荷降ろし位置確認：指示内容と乖離ないか確認。危険がある場合は相談。\nNo.4 車両を停車位置に移動：桝・水道・障害物を把握。スタック可能性あれば受注課に連絡。\nNo.5 アウトリガー設置：地盤確認・敷板設置・最大位置まで張出し。U字溝蓋上への設置禁止。\nNo.6 荷解き：荷崩れ確認後、足元の安全を確保。\nNo.7 荷降ろし開始：頭上確認（電線・電話線）必須。斜め吊り禁止。風速10m/s以上は作業中止。\nNo.8 荷降ろし終了：製品養生・納品写真撮影・明細書にサイン受領。\nNo.9 ジブ・ブーム格納：頭上確認しながら縮小・旋回・定位置に格納。急旋回禁止。\nNo.10 アウトリガー格納：左右格納・敷板格納・PTO解除。→退出前5点確認を実施。\nNo.11 荷締め・出発準備：荷台荷締め・出発前写真撮影。\nNo.12 帰庫：荷台確認・整理・盗難防止装置作動・ハンドルロック。"},
      {title:"現場退出前確認5項目（各現場出発前）",content:"【退出前5点確認】各現場を離れる前に指差し呼称で確認：\n①ブーム格納：縮小・旋回・定位置に格納済み\n②アウトリガー格納：左右格納・敷板回収・ロック確認\n③ワイヤー乱巻なし：確認済み\n④フック格納：格納位置に固定済み\n⑤PTO解除：解除済みであることを確認\n\n呼称例：「ブーム格納よし！アウトリガー格納よし！ワイヤー乱巻なしよし！フック格納よし！PTO解除よし！」"}
    ]
  },
  {
    id:"accident",icon:"🚨",title:"事故対応手順書",tag:"2025年度版 修正版",color:"#922B21",
    sections:[
      {title:"緊急連絡先一覧",content:"警察：110（24時間）\n救急・消防：119（24時間）\n配車担当者：090-1213-9803（業務時間内）\n茨城工場 受注課：090-6301-8209（8:00〜17:00）\nメークス本社：0297-55-1380（業務時間内）\n時間外連絡先：0297-55-1380（17:00〜翌8:00・土日祝、自動転送）\n東京電力（電線事故）：0120-995-007（24時間）\nNTT（通信線事故）：0120-444-113（24時間）"},
      {title:"事故発生時の3原則",content:"①安全確保（二次災害の防止）\n②救護・通報（119番・110番）\n③会社連絡（配車担当：090-1213-9803）\n\n【絶対禁止事項】\n・現場からの離脱\n・事故報告の隠蔽\n・示談交渉\n・「私が悪い」等の責任を認める発言\n・SNSへの投稿"},
      {title:"電線切断時の対応",content:"【電線に接触・切断してしまった場合】\n1. 絶対に車両から降りない（感電の危険）\n2. 110番に連絡\n3. 配車担当に連絡（090-1213-9803）\n4. 東京電力に連絡（0120-995-007）\n5. 救急・警察の到着まで車内で待機"}
    ]
  },
  {
    id:"checklist",icon:"✅",title:"日常点検チェックリスト",tag:"毎日確認",color:"#1E8449",
    sections:[
      {title:"車両点検",content:"□ タイヤ空気圧・溝・損傷\n□ エンジンオイル量\n□ 冷却水量\n□ ブレーキ液量\n□ バッテリー液量\n□ ウォッシャー液量\n□ ライト・ウインカー点灯確認\n□ ワイパー作動確認\n□ ホーン作動確認"},
      {title:"ユニック点検",content:"□ 油圧オイル量\n□ ワイヤーロープの損傷・乱巻\n□ フック・シーブの状態\n□ アウトリガーの作動\n□ ブームの伸縮・起伏\n□ 旋回装置の作動\n□ 安全装置（過負荷防止等）作動確認"},
      {title:"書類・装備品",content:"□ 運転免許証携帯\n□ クレーン運転修了証携帯\n□ 配車表確認\n□ 明細書・地図\n□ アルコールチェック実施\n□ 保護具（ヘルメット・安全靴・手袋）"}
    ]
  },
  {
    id:"kyt",icon:"⚠️",title:"KYT（危険予知訓練）教材",tag:"安全教育",color:"#D4AC0D",
    sections:[
      {title:"KYT 4ラウンド法",content:"【第1ラウンド】現状把握：どんな危険が潜んでいるか\n【第2ラウンド】本質追究：これが危険のポイントだ\n【第3ラウンド】対策樹立：あなたならどうする\n【第4ラウンド】目標設定：私たちはこうする"},
      {title:"場面1：住宅地での荷降ろし",content:"【状況】住宅地の狭い道路で、電線の下でクレーン作業中。歩行者や自転車が通る。\n\n危険ポイント：\n・ブーム・吊り荷が電線に接触\n・歩行者が吊り荷の下を通過\n・アウトリガーに歩行者がつまずく\n\n対策：\n・頭上確認を徹底、電線との離隔を常に確認\n・カラーコーンで作業範囲を区画\n・誘導員を配置"},
      {title:"場面2：雨天時の現場進入",content:"【状況】前日の雨で地盤が軟弱な現場。トラックで進入しようとしている。\n\n危険ポイント：\n・地盤沈下でスタック\n・アウトリガー設置時の地盤陥没\n・スリップによる接触事故\n\n対策：\n・進入前に地盤状況を確認\n・スタック可能性があれば進入中止→受注課連絡\n・敷板を十分に使用"}
    ]
  },
  {
    id:"legal12",icon:"📚",title:"法定12項目教育資料",tag:"年間教育",color:"#6C3483",
    sections:[
      {title:"1. 事業用自動車の安全運行確保",content:"・関係法令（道路交通法・道路運送車両法・労働安全衛生法）の遵守\n・社内安全規則の理解と実践\n・運行管理者の指示に従うこと"},
      {title:"2. 事業用自動車の構造上の特性",content:"・トラック（大型車）の内輪差・外輪差\n・死角の理解（特に左側・後方）\n・制動距離が乗用車より長いこと\n・クレーン付き車両の重心の高さ"},
      {title:"3. 貨物の正しい積載方法",content:"・偏荷重の防止\n・荷崩れ防止措置の徹底\n・最大積載量の厳守\n・ラッシングベルト最低2本以上で固縛"},
      {title:"4. 過積載の危険性",content:"・ブレーキの効きが悪くなる\n・カーブでの横転リスク増大\n・タイヤのバースト危険\n・道路・橋梁への損傷\n・法令違反（罰則あり）"},
      {title:"5. 危険物運搬の注意事項",content:"・危険物の種類と表示\n・消火器の設置と使用方法\n・イエローカード（緊急連絡カード）の携帯"},
      {title:"6. 適切な運行経路と道路状況",content:"・事前の経路確認\n・道路規制情報の収集\n・工事区間・通行止め情報\n・通学路・生活道路の注意"},
      {title:"7. 危険の予測と回避",content:"・KYT（危険予知訓練）の実践\n・「だろう運転」ではなく「かもしれない運転」\n・交差点・カーブ・住宅街での減速"},
      {title:"8. 運転者の心身状態と安全運転",content:"・十分な睡眠（7時間以上推奨）\n・飲酒運転の絶対禁止\n・体調不良時は無理をしない\n・眠気のある薬の服用申告"},
      {title:"9. 安全性向上装置の活用",content:"・ABS（アンチロックブレーキ）の理解\n・バックモニター・ソナーの活用\n・ドライブレコーダーの確認\n・速度抑制装置（リミッター）"},
      {title:"10. 事故発生時の対応",content:"・事故発生時の3原則を遵守\n・二次災害の防止\n・正確な事故報告\n・事故対応手順書を参照"},
      {title:"11. 健康管理の重要性",content:"・定期健康診断の受診\n・生活習慣病の予防\n・熱中症対策\n・メンタルヘルスケア"},
      {title:"12. 交通事故統計の理解",content:"・業界の事故傾向\n・自社の事故データ分析\n・再発防止策の共有\n・安全意識の継続的向上"}
    ]
  },
  {
    id:"customer",icon:"🤝",title:"身だしなみ・マナー",tag:"接客対応",color:"#2E86C1",
    sections:[
      {title:"身だしなみ基準",content:"・作業服・ヘルメット・安全靴・保護手袋の着用\n・清潔感のある服装\n・名札の着用"},
      {title:"挨拶・マナー",content:"・積極的な挨拶（おはようございます・お疲れ様です）\n・現場では丁寧語を使用\n・時間指定厳守\n・現場・付近は禁煙\n・ゴミのポイ捨て厳禁"},
      {title:"クレーム対応",content:"・まず謝罪（「申し訳ございません」）\n・状況を正確に聞き取る\n・その場で判断できない場合は会社に連絡\n・絶対に口論しない"}
    ]
  },
  {
    id:"answer",icon:"📝",title:"回答集（管理者用）",tag:"管理者向け",color:"#7D3C98",
    sections:[
      {title:"よくある質問と回答",content:"Q: アウトリガーを最大まで張り出せない場合は？\nA: 作業中止。受注課に連絡して指示を仰ぐ。片側のみの張り出しは禁止。\n\nQ: 風が強い場合の判断基準は？\nA: 風速10m/s以上でクレーン作業中止。体感で判断せず、風速計を使用。\n\nQ: 現場で破損させてしまった場合は？\nA: すぐに配車担当に連絡。隠蔽は絶対禁止。正直に報告すれば対処できる。"},
      {title:"テスト解答一覧",content:"【基本業務テスト】\n出発前5点確認：アウトリガー格納・ブーム格納・製品荷締め・部材荷締め・不具合修正\n退出前5点確認：ブーム格納・アウトリガー格納・ワイヤー乱巻なし・フック格納・PTO解除\n\n【事故対応テスト】\n3原則：安全確保→救護通報→会社連絡\n電線切断時：車両から降りない→110番→配車担当→東京電力"}
    ]
  }
];

/* ===== Eラーニングコースデータ ===== */
const COURSES = [
  {id:"basic",title:"基本業務（出発前・退出前確認）",icon:"📋",cat:"基本業務",color:"#1B4F72",
    secs:[{title:"学習内容",body:"・出発前5点確認（アウトリガー格納・ブーム格納・製品荷締め・部材荷締め・不具合修正）\n・退出前5点確認（ブーム格納・アウトリガー格納・ワイヤー乱巻なし・フック格納・PTO解除）\n・指差し呼称の実施"}],
    quiz:[
      {q:"出発前5点確認に含まれないものは？",o:["アウトリガー格納","ブーム格納","PTO解除","製品荷締め"],a:2},
      {q:"退出前5点確認の正しい順番は？",o:["ブーム→アウトリガー→ワイヤー→フック→PTO","アウトリガー→ブーム→フック→ワイヤー→PTO","PTO→ブーム→アウトリガー→ワイヤー→フック","フック→ワイヤー→ブーム→アウトリガー→PTO"],a:0}
    ]
  },
  {id:"accident_el",title:"事故対応",icon:"🚨",cat:"緊急対応",color:"#922B21",
    secs:[{title:"学習内容",body:"・事故発生時の3原則（安全確保→救護通報→会社連絡）\n・電線切断時の対応手順\n・絶対禁止事項（離脱・隠蔽・示談・責任発言・SNS）"}],
    quiz:[
      {q:"事故発生時の3原則の正しい順番は？",o:["会社連絡→安全確保→救護","安全確保→救護通報→会社連絡","救護→会社連絡→安全確保","安全確保→会社連絡→救護"],a:1},
      {q:"電線を切断してしまった場合、最初にすべきことは？",o:["車両から降りて確認","絶対に車両から降りない","東京電力に連絡","現場から離れる"],a:1}
    ]
  },
  {id:"crane_el",title:"クレーン操作・安全",icon:"🏗️",cat:"安全管理",color:"#D35400",
    secs:[{title:"学習内容",body:"・修了証携帯必須\n・アウトリガー最大張り出し（片側禁止）\n・定格荷重厳守\n・吊り荷下立入禁止\n・強風（10m/s以上）作業中止\n・斜め吊り禁止\n・複数レバー同時操作禁止"}],
    quiz:[
      {q:"クレーン作業中止の風速基準は？",o:["5m/s以上","8m/s以上","10m/s以上","15m/s以上"],a:2},
      {q:"アウトリガーの正しい張り出し方は？",o:["片側だけでOK","最大位置まで張り出す","状況に応じて適当に","張り出さなくてもOK"],a:1}
    ]
  },
  {id:"manners_el",title:"身だしなみ・マナー・現場ルール",icon:"🤝",cat:"基本業務",color:"#2E86C1",
    secs:[{title:"学習内容",body:"・作業服・ヘルメット・安全靴・保護手袋の着用\n・積極的な挨拶。時間指定厳守\n・現場付近は禁煙。ゴミのポイ捨て厳禁\n・遣り方・水糸・饅頭を破損しない\n・地縄の内側に荷物を置かない"}],
    quiz:[
      {q:"時間指定に対して正しい行動は？",o:["早く着いても入る","指定時間厳守（早すぎもNG）","多少遅れてもOK","到着後に連絡"],a:1},
      {q:"現場でやってはいけないことは？",o:["挨拶","地縄の内側に荷物を置く","敷板を使う","指差し確認"],a:1}
    ]
  },
  {id:"loading_el",title:"積込・荷降ろし安全",icon:"📦",cat:"基本業務",color:"#7D3C98",
    secs:[{title:"学習内容",body:"・配送順番を考慮した積込\n・ラッシングベルト最低2本以上で固縛\n・手で揺すって動かないことを確認\n・到着時に荷降ろし位置を現場監督に確認\n・明細書にサインをもらう\n・数量は声に出して確認"}],
    quiz:[
      {q:"積込時に最も重要なことは？",o:["素早さ","配送順・荷締め・養生の徹底","見た目の整列","大きいものから"],a:1},
      {q:"数量確認の正しい方法は？",o:["目視のみ","声に出して1つずつ数える","重さで判断","後でまとめて"],a:1}
    ]
  },
  {id:"delivery_rules_el",title:"納品時厳守事項",icon:"🏠",cat:"ミスゼロ",color:"#795548",
    secs:[{title:"学習内容",body:"遣り方＝基礎回りの木材（位置・高さの基準）。破損すると建物の位置・高さがわからなくなる。\n饅頭＝高さ調節モルタル。破損すると工期が遅れる。\n地縄の上や内側に荷物を置かない。防湿シートは破いたり泥で汚さない。\nスラブ筋あり：外周パネル→スラブ筋→内部パネルの順に置く。"}],
    quiz:[
      {q:"「遣り方」とは？",o:["地面を掘ること","基礎回りの木材","高さ調節モルタル","湿気防止シート"],a:1},
      {q:"饅頭破損の影響は？",o:["問題なし","工期が遅れる","見た目が悪い","費用がかかる"],a:1}
    ]
  },
  {id:"health_el",title:"健康管理・飲酒・服薬",icon:"💪",cat:"健康安全",color:"#2471A3",
    secs:[{title:"学習内容",body:"・睡眠：1日7時間以上\n・飲酒：ビール中瓶1本＝分解3〜4時間、3本＝9〜12時間\n・朝食必須、昼食は腹八分目\n・眠気のある薬は会社に申告\n・花粉症は主治医に運転業務を伝えること"}],
    quiz:[
      {q:"ビール中瓶3本の分解時間は？",o:["約3〜4時間","約5〜6時間","約9〜12時間","約15時間"],a:2},
      {q:"花粉症の薬について正しいのは？",o:["市販薬を自己判断","主治医に運転業務を伝えて処方","我慢する","何でもよい"],a:1}
    ]
  },
  {id:"heatstroke_el",title:"熱中症予防",icon:"☀️",cat:"健康安全",color:"#E67E22",
    secs:[{title:"学習内容",body:"・WBGT31以上は原則外作業中止\n・1時間にコップ2〜3杯の水分補給\n・軽度（めまい）→涼しい場所で水分補給\n・重度（意識障害）→119番通報"}],
    quiz:[
      {q:"外作業中止の基準は？",o:["WBGT25以上","WBGT28以上","WBGT31以上","WBGT35以上"],a:2},
      {q:"重度の熱中症の対応は？",o:["水を飲ませる","休ませる","119番通報","自力で病院へ"],a:2}
    ]
  },
  {id:"winter_el",title:"冬季・台風対策",icon:"❄️",cat:"健康安全",color:"#5DADE2",
    secs:[{title:"学習内容",body:"・冬季はチェーン・スタッドレス準備\n・凍結路面は車間距離2倍\n・台風時は運行中止判断を早めに\n・強風時はシート・積荷の飛散防止"}],
    quiz:[
      {q:"凍結路面での正しい対応は？",o:["通常通り走行","車間距離2倍","速度を上げて通過","ブレーキを強く踏む"],a:1},
      {q:"台風時の正しい判断は？",o:["無理してでも配送","早めに運行中止判断","様子を見ながら出発","お客様次第"],a:1}
    ]
  },
  {id:"kyt_el",title:"危険予知訓練（KYT）",icon:"⚠️",cat:"安全教育",color:"#D4AC0D",
    secs:[{title:"学習内容",body:"KYT 4ラウンド法：\n第1R：現状把握（どんな危険が潜んでいるか）\n第2R：本質追究（これが危険のポイントだ）\n第3R：対策樹立（あなたならどうする）\n第4R：目標設定（私たちはこうする）"}],
    quiz:[
      {q:"KYT第1ラウンドの目的は？",o:["対策を決める","危険を見つける","目標を設定","原因を追究"],a:1},
      {q:"KYT第4ラウンドで行うことは？",o:["危険の発見","本質の追究","対策の検討","目標の設定"],a:3}
    ]
  },
  {id:"legal12_el",title:"法定12項目教育",icon:"📚",cat:"法定教育",color:"#6C3483",
    secs:[{title:"学習内容",body:"貨物自動車運送事業者が行うべき12項目：\n1.安全運行確保 2.構造上の特性 3.正しい積載方法 4.過積載の危険性\n5.危険物運搬 6.適切な運行経路 7.危険の予測と回避 8.心身状態と安全運転\n9.安全性向上装置 10.事故発生時対応 11.健康管理 12.交通事故統計"}],
    quiz:[
      {q:"法定教育は何項目か？",o:["8項目","10項目","12項目","15項目"],a:2},
      {q:"過積載の危険性に含まれないものは？",o:["ブレーキの効き低下","横転リスク増大","燃費向上","タイヤバースト"],a:2}
    ]
  },
  {id:"driving_el",title:"運転安全",icon:"🚛",cat:"安全運転",color:"#1A5276",
    secs:[{title:"学習内容",body:"・住宅街は徐行（20km/h以下）\n・交差点では左折時に左後方の巻込み確認\n・2時間ごとに15分の休憩\n・あおり運転を受けたら安全な場所に停車しドアロック→110番"}],
    quiz:[
      {q:"住宅街での適切な速度は？",o:["30km/h","20km/h以下","40km/h","制限速度通り"],a:1},
      {q:"あおり運転を受けた場合の対応は？",o:["加速して離れる","急ブレーキ","安全な場所に停車→110番","窓を開けて話す"],a:2}
    ]
  },
  {id:"mental_el",title:"メンタルヘルス",icon:"🧠",cat:"健康安全",color:"#16A085",
    secs:[{title:"学習内容",body:"・ストレスサイン：不眠・食欲低下・イライラ・集中力低下\n・相談窓口の活用\n・十分な休養と規則正しい生活\n・一人で抱え込まない"}],
    quiz:[
      {q:"ストレスサインに含まれるものは？",o:["食欲増進","快眠","集中力低下","活力向上"],a:2},
      {q:"メンタルヘルスで大切なことは？",o:["一人で頑張る","我慢する","相談窓口を活用する","気にしない"],a:2}
    ]
  }
];

const TOTAL_C = COURSES.length;
const PASS_RATE = 80;

/* ===== チャットボット知識ベース ===== */
const KB = "あなたはメークス株式会社 物流事業部のAIアシスタントです。ドライバーや従業員からの質問に対して、以下の手順書・チェックリストの内容をもとに正確・簡潔に回答してください。\n\n【緊急連絡先】\n配車担当者：090-1213-9803（業務時間内）\n茨城工場受注課：090-6301-8209（8:00〜17:00）\nメークス本社：0297-55-1380\n時間外：0297-55-1380（17:00〜翌8:00・土日祝）\n東京電力：0120-995-007、NTT：0120-444-113\n\n【出発前5点確認】①アウトリガー格納②ブーム格納③製品荷締め④部材荷締め⑤不具合修正\n【退出前5点確認】①ブーム格納②アウトリガー格納③ワイヤー乱巻なし④フック格納⑤PTO解除\n【事故3原則】安全確保→救護通報（119・110）→会社連絡（090-1213-9803）\n【電線切断】車両から降りない→110番→配車担当→東京電力\n【アウトリガー】最大位置必須。片側禁止。U字溝蓋上禁止。敷板必須。\n【クレーン中止】風速10m/s以上\n【時間指定】30分以上前の進入禁止\n\n回答は日本語で簡潔に。知識外は「管理者に問い合わせてください」と案内。";

/* ===== Header ===== */
function Header({tab,setTab,user,onLogout}){
  const tabs=[{id:"home",label:"ホーム",icon:"🏠"},{id:"manual",label:"手順書",icon:"📄"},{id:"elearning",label:"Eラーニング",icon:"🎓"},{id:"chat",label:"AIチャット",icon:"🤖"},{id:"admin",label:"管理者",icon:"🔐"}];
  return(
    <header style={{background:"linear-gradient(135deg,#0a1628,#1a2d4a)",color:"#fff",boxShadow:"0 2px 12px rgba(0,0,0,0.3)"}}>
      <div style={{maxWidth:1200,margin:"0 auto",padding:"0 20px"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"12px 0 0"}}>
          <div><div style={{fontSize:10,opacity:0.6,letterSpacing:2}}>メークス株式会社 物流事業部</div><div style={{fontSize:16,fontWeight:700}}>統合ポータル v3</div></div>
          {user&&<div style={{display:"flex",alignItems:"center",gap:10}}><span style={{fontSize:12,opacity:0.8}}>{user.name}</span><button onClick={onLogout} style={{background:"rgba(255,255,255,0.1)",border:"1px solid rgba(255,255,255,0.2)",color:"#fff",borderRadius:6,padding:"4px 10px",cursor:"pointer",fontSize:11}}>ログアウト</button></div>}
        </div>
        <nav style={{display:"flex",gap:2,marginTop:8,overflowX:"auto"}}>
          {tabs.map(t=><button key={t.id} onClick={()=>setTab(t.id)} style={{background:tab===t.id?"rgba(255,255,255,0.15)":"transparent",border:"none",color:"#fff",padding:"9px 16px",cursor:"pointer",fontSize:12,borderRadius:"6px 6px 0 0",opacity:tab===t.id?1:0.6,fontWeight:tab===t.id?700:400,borderBottom:tab===t.id?"2px solid #3498DB":"2px solid transparent",whiteSpace:"nowrap"}}>{t.icon} {t.label}</button>)}
        </nav>
      </div>
    </header>
  );
}

/* ===== Home ===== */
function Home({setTab,user}){
  const cards=[
    {icon:"📄",title:"手順書を確認する",desc:"納入手順・事故対応・KYT・法定12項目など"+MANUALS.length+"件",tab:"manual",color:"#1B4F72"},
    {icon:"🎓",title:"Eラーニングを受講する",desc:"全"+TOTAL_C+"コースの安全教育・確認テスト",tab:"elearning",color:"#1E8449"},
    {icon:"🤖",title:"AIに質問する",desc:"手順書の内容をQ&Aで即確認",tab:"chat",color:"#6C3483"}
  ];
  return(
    <div style={{maxWidth:1000,margin:"40px auto",padding:"0 20px"}}>
      <div style={{textAlign:"center",marginBottom:36}}>
        <div style={{fontSize:40,marginBottom:8}}>🚚</div>
        <h1 style={{fontSize:22,fontWeight:700,color:"#1a2d4a",marginBottom:6}}>物流事業部 統合ポータル</h1>
        <p style={{color:"#888",fontSize:13}}>{user?"ようこそ、"+user.name+"さん":"ようこそ"} — 手順書・Eラーニング・AIチャットを一元管理</p>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(260px,1fr))",gap:16,marginBottom:32}}>
        {cards.map(c=><div key={c.tab} onClick={()=>setTab(c.tab)} style={{...S.card,padding:"28px 24px",cursor:"pointer",position:"relative"}}>
          <div style={{position:"absolute",top:0,left:0,right:0,height:4,background:c.color}}/>
          <div style={{fontSize:30,marginBottom:10}}>{c.icon}</div>
          <h3 style={{fontSize:15,fontWeight:700,color:"#1a2d4a",marginBottom:6}}>{c.title}</h3>
          <p style={{fontSize:12,color:"#888"}}>{c.desc}</p>
          <div style={{marginTop:14,fontSize:12,color:c.color,fontWeight:600}}>開く →</div>
        </div>)}
      </div>
      <div style={{background:"#fff3cd",borderRadius:10,padding:"14px 18px",border:"1px solid #ffc107",fontSize:12,color:"#856404"}}>⚠️ 緊急時は <strong>配車担当：090-1213-9803</strong> へ連絡してください。</div>
    </div>
  );
}

/* ===== ManualViewer ===== */
function ManualViewer(){
  const[sel,setSel]=useState(null);const[si,setSI]=useState(0);const m=MANUALS.find(x=>x.id===sel);
  return(
    <div style={{maxWidth:1100,margin:"0 auto",padding:"24px 20px",display:"grid",gridTemplateColumns:sel?"280px 1fr":"repeat(auto-fit,minmax(240px,1fr))",gap:16}}>
      {!sel&&MANUALS.map(m=><div key={m.id} onClick={()=>{setSel(m.id);setSI(0);}} style={{...S.card,padding:"20px",cursor:"pointer",position:"relative"}}>
        <div style={{position:"absolute",top:0,left:0,right:0,height:3,background:m.color}}/>
        <div style={{fontSize:28,marginBottom:8}}>{m.icon}</div>
        <h3 style={{fontSize:14,fontWeight:700,color:"#1a2d4a"}}>{m.title}</h3>
        <span style={{fontSize:10,color:m.color,background:m.color+"15",padding:"2px 8px",borderRadius:10}}>{m.tag}</span>
      </div>)}
      {sel&&<div>
        <button onClick={()=>setSel(null)} style={{...S.btn("#666"),marginBottom:12,padding:"6px 14px",fontSize:12}}>← 一覧に戻る</button>
        {MANUALS.map(mm=><div key={mm.id} onClick={()=>{setSel(mm.id);setSI(0);}} style={{...S.card,padding:"12px 16px",marginBottom:4,cursor:"pointer",borderLeft:mm.id===sel?"3px solid "+mm.color:"3px solid transparent",background:mm.id===sel?"#f8f9fa":"#fff"}}>
          <span style={{fontSize:13}}>{mm.icon} {mm.title}</span>
        </div>)}
      </div>}
      {sel&&m&&<div style={S.card}>
        <div style={{padding:"16px 20px",borderBottom:"1px solid #eee"}}>
          <h2 style={{fontSize:16,fontWeight:700,color:m.color}}>{m.icon} {m.title}</h2>
        </div>
        <div style={{display:"flex",borderBottom:"1px solid #eee",overflowX:"auto"}}>
          {m.sections.map((s,i)=><button key={i} onClick={()=>setSI(i)} style={{background:"none",border:"none",padding:"10px 16px",cursor:"pointer",fontSize:12,fontWeight:si===i?700:400,color:si===i?m.color:"#666",borderBottom:si===i?"2px solid "+m.color:"2px solid transparent",whiteSpace:"nowrap"}}>{s.title}</button>)}
        </div>
        <div style={{padding:"24px",whiteSpace:"pre-line",fontSize:13,lineHeight:2,color:"#333"}}>{m.sections[si].content}</div>
      </div>}
    </div>
  );
}

/* ===== ELearning ===== */
function ELearning({user,setUser}){
  const[cid,setCid]=useState(null);const[step,setStep]=useState("list");const[qi,setQi]=useState(0);const[ans,setAns]=useState({});const[result,setResult]=useState(null);
  const c=COURSES.find(x=>x.id===cid);

  if(!user) return(
    <div style={{maxWidth:400,margin:"60px auto",padding:20}}>
      <div style={{...S.card,padding:"32px 28px"}}>
        <div style={{textAlign:"center",marginBottom:20}}><div style={{fontSize:36}}>🎓</div><h2 style={{fontSize:17,fontWeight:700,color:"#1a2d4a",marginTop:8}}>Eラーニング ログイン</h2></div>
        <ELLoginForm onLogin={setUser}/>
      </div>
    </div>
  );

  if(step==="list") return(
    <div style={{maxWidth:1000,margin:"0 auto",padding:"24px 20px"}}>
      <h2 style={{fontSize:18,fontWeight:700,color:"#1a2d4a",marginBottom:16}}>🎓 Eラーニング（全{TOTAL_C}コース）</h2>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(240px,1fr))",gap:12}}>
        {COURSES.map(c=><div key={c.id} onClick={()=>{setCid(c.id);setStep("learn");setQi(0);setAns({});setResult(null);}} style={{...S.card,padding:"18px",cursor:"pointer",position:"relative"}}>
          <div style={{position:"absolute",top:0,left:0,right:0,height:3,background:c.color}}/>
          <div style={{fontSize:24,marginBottom:6}}>{c.icon}</div>
          <h3 style={{fontSize:13,fontWeight:700,color:"#1a2d4a"}}>{c.title}</h3>
          <span style={{fontSize:10,color:c.color}}>{c.cat}</span>
        </div>)}
      </div>
    </div>
  );

  if(step==="learn"&&c) return(
    <div style={{maxWidth:700,margin:"0 auto",padding:"24px 20px"}}>
      <button onClick={()=>setStep("list")} style={{...S.btn("#666"),marginBottom:12,padding:"6px 14px",fontSize:12}}>← コース一覧に戻る</button>
      <div style={S.card}>
        <div style={{padding:"16px 20px",borderBottom:"1px solid #eee"}}><h2 style={{fontSize:16,fontWeight:700,color:c.color}}>{c.icon} {c.title}</h2></div>
        {c.secs.map((s,i)=><div key={i} style={{padding:"20px"}}><h3 style={{fontSize:14,fontWeight:700,marginBottom:8}}>{s.title}</h3><div style={{whiteSpace:"pre-line",fontSize:13,lineHeight:1.8,color:"#333"}}>{s.body}</div></div>)}
        <div style={{padding:"16px 20px",borderTop:"1px solid #eee"}}><button onClick={()=>setStep("quiz")} style={{...S.btn(c.color),width:"100%"}}>📝 確認テストを受ける</button></div>
      </div>
    </div>
  );

  if(step==="quiz"&&c){
    const q=c.quiz[qi];
    return(
      <div style={{maxWidth:600,margin:"0 auto",padding:"24px 20px"}}>
        <div style={S.card}>
          <div style={{padding:"16px 20px",borderBottom:"1px solid #eee"}}><span style={{fontSize:12,color:"#888"}}>問題 {qi+1} / {c.quiz.length}</span></div>
          <div style={{padding:"24px"}}>
            <p style={{fontSize:14,fontWeight:700,marginBottom:16}}>{q.q}</p>
            {q.o.map((o,i)=><div key={i} onClick={()=>setAns({...ans,[qi]:i})} style={{padding:"12px 16px",border:ans[qi]===i?"2px solid "+c.color:"1px solid #ddd",borderRadius:8,marginBottom:8,cursor:"pointer",fontSize:13,background:ans[qi]===i?c.color+"10":"#fff"}}>{o}</div>)}
          </div>
          <div style={{padding:"16px 20px",borderTop:"1px solid #eee",display:"flex",justifyContent:"space-between"}}>
            {qi>0&&<button onClick={()=>setQi(qi-1)} style={S.btn("#888")}>← 前へ</button>}
            <div/>
            {qi<c.quiz.length-1?<button onClick={()=>{if(ans[qi]!==undefined)setQi(qi+1);}} style={S.btn(c.color)} disabled={ans[qi]===undefined}>次へ →</button>
            :<button onClick={()=>{
              let sc=0;c.quiz.forEach((q,i)=>{if(ans[i]===q.a)sc++;});
              const pct=Math.round(sc/c.quiz.length*100);const pass=pct>=PASS_RATE;
              const r={date:new Date().toISOString(),empId:user.empId,name:user.name,courseId:c.id,courseName:c.title,score:sc,totalQ:c.quiz.length,pct,passed:pass};
              const key="result_"+Date.now();stor.set(key,r);
              setResult(r);setStep("result");
            }} style={S.btn(c.color)} disabled={ans[qi]===undefined}>採点する ✓</button>}
          </div>
        </div>
      </div>
    );
  }

  if(step==="result"&&result) return(
    <div style={{maxWidth:500,margin:"0 auto",padding:"24px 20px"}}>
      <div style={S.card}>
        <div style={{padding:"32px",textAlign:"center"}}>
          <div style={{fontSize:48,marginBottom:12}}>{result.passed?"🎉":"😢"}</div>
          <h2 style={{fontSize:20,fontWeight:700,color:result.passed?"#1E8449":"#C0392B"}}>{result.passed?"合格！":"不合格"}</h2>
          <p style={{fontSize:28,fontWeight:700,margin:"16px 0"}}>{result.pct}%</p>
          <p style={{fontSize:13,color:"#888"}}>{result.score}/{result.totalQ}問正解（合格ライン：{PASS_RATE}%）</p>
          <div style={{marginTop:24,display:"flex",gap:8,justifyContent:"center"}}>
            <button onClick={()=>{setStep("learn");setQi(0);setAns({});setResult(null);}} style={S.btn("#888")}>もう一度学習</button>
            <button onClick={()=>{setStep("list");setCid(null);}} style={S.btn("#1E8449")}>コース一覧へ</button>
          </div>
        </div>
      </div>
    </div>
  );

  return null;
}

function ELLoginForm({onLogin}){
  const[eid,setEid]=useState("");const[nm,setNm]=useState("");
  return(<>
    <div style={{marginBottom:14}}><label style={{fontSize:12,fontWeight:600,color:"#555",display:"block",marginBottom:4}}>社員番号</label><input value={eid} onChange={e=>setEid(e.target.value)} placeholder="例: E001" style={S.input}/></div>
    <div style={{marginBottom:20}}><label style={{fontSize:12,fontWeight:600,color:"#555",display:"block",marginBottom:4}}>氏名</label><input value={nm} onChange={e=>setNm(e.target.value)} placeholder="例: 山田太郎" style={S.input}/></div>
    <button onClick={()=>{if(eid.trim()&&nm.trim())onLogin({empId:eid.trim(),name:nm.trim()});}} disabled={!eid.trim()||!nm.trim()} style={{...S.btn("#1E8449"),width:"100%",padding:12,opacity:(!eid.trim()||!nm.trim())?0.5:1}}>ログインして受講する</button>
  </>);
}

/* ===== Chatbot ===== */
function Chatbot(){
  const[msgs,setMsgs]=useState([{role:"assistant",content:"メークス物流事業部のAIアシスタントです。手順書や安全教育について何でも聞いてください。"}]);
  const[input,setInput]=useState("");const[loading,setLoading]=useState(false);const ref=useRef(null);
  useEffect(()=>{ref.current?.scrollTo(0,ref.current.scrollHeight);},[msgs]);

  const send=async()=>{
    if(!input.trim()||loading)return;
    const q=input.trim();setInput("");setMsgs(p=>[...p,{role:"user",content:q}]);setLoading(true);
    try{
      const apiKey=import.meta.env.VITE_ANTHROPIC_API_KEY;
      if(!apiKey){setMsgs(p=>[...p,{role:"assistant",content:"APIキーが設定されていません。管理者に連絡してください。"}]);setLoading(false);return;}
      const res=await fetch("/api/chat",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({message:q,kb:KB})});
      const data=await res.json();
      setMsgs(p=>[...p,{role:"assistant",content:data.response||"回答を取得できませんでした。"}]);
    }catch(e){
      setMsgs(p=>[...p,{role:"assistant",content:"エラーが発生しました。しばらく待ってから再度お試しください。"}]);
    }
    setLoading(false);
  };

  return(
    <div style={{maxWidth:700,margin:"0 auto",padding:"24px 20px"}}>
      <div style={{...S.card,height:"70vh",display:"flex",flexDirection:"column"}}>
        <div style={{padding:"14px 20px",borderBottom:"1px solid #eee",fontSize:14,fontWeight:700,color:"#1a2d4a"}}>🤖 AIチャットボット</div>
        <div ref={ref} style={{flex:1,overflowY:"auto",padding:"16px"}}>
          {msgs.map((m,i)=><div key={i} style={{display:"flex",justifyContent:m.role==="user"?"flex-end":"flex-start",marginBottom:12}}>
            <div style={{maxWidth:"80%",padding:"10px 14px",borderRadius:12,fontSize:13,lineHeight:1.7,background:m.role==="user"?"#1a2d4a":"#f0f2f5",color:m.role==="user"?"#fff":"#333",whiteSpace:"pre-line"}}>{m.content}</div>
          </div>)}
          {loading&&<div style={{fontSize:12,color:"#888"}}>回答中...</div>}
        </div>
        <div style={{padding:"12px 16px",borderTop:"1px solid #eee",display:"flex",gap:8}}>
          <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>{if(e.key==="Enter")send();}} placeholder="質問を入力..." style={{...S.input,flex:1}}/>
          <button onClick={send} style={S.btn("#1a2d4a")} disabled={loading}>送信</button>
        </div>
      </div>
    </div>
  );
}

/* ===== AdminPanel ===== */
function AdminPanel(){
  const[auth,setAuth]=useState(false);const[pw,setPw]=useState("");const[view,setView]=useState("results");

  const getResults=()=>{
    const keys=stor.list("result_");
    return keys.map(k=>stor.get(k)).filter(Boolean).sort((a,b)=>new Date(b.date)-new Date(a.date));
  };

  if(!auth) return(
    <div style={{maxWidth:400,margin:"60px auto",padding:20}}>
      <div style={{...S.card,padding:"32px 28px"}}>
        <div style={{textAlign:"center",marginBottom:20}}><div style={{fontSize:36}}>🔐</div><h2 style={{fontSize:17,fontWeight:700,color:"#1a2d4a",marginTop:8}}>管理者ログイン</h2></div>
        <input type="password" value={pw} onChange={e=>setPw(e.target.value)} placeholder="管理者パスワード" style={{...S.input,marginBottom:16}} onKeyDown={e=>{if(e.key==="Enter"&&pw===ADMIN_PASS)setAuth(true);}}/>
        <button onClick={()=>{if(pw===ADMIN_PASS)setAuth(true);else alert("パスワードが違います");}} style={{...S.btn("#C0392B"),width:"100%",padding:12}}>ログイン</button>
      </div>
    </div>
  );

  const results=getResults();
  const fmt=(d)=>new Date(d).toLocaleString("ja-JP",{year:"numeric",month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit"});

  return(
    <div style={{maxWidth:1000,margin:"0 auto",padding:"24px 20px"}}>
      <div style={{display:"flex",gap:8,marginBottom:16}}>
        {[["results","📊 受験履歴"],["guide","📝 変更ガイド"]].map(([v,l])=><button key={v} onClick={()=>setView(v)} style={{...S.btn(view===v?"#1a2d4a":"#ccc"),padding:"8px 16px",fontSize:12}}>{l}</button>)}
      </div>

      {view==="results"&&<div style={S.card}>
        <div style={{padding:"14px 20px",borderBottom:"1px solid #e0e0e0",fontSize:14,fontWeight:700,color:"#1a2d4a"}}>📊 全受験履歴（{results.length}件）</div>
        {results.length===0?<div style={{padding:30,textAlign:"center",color:"#aaa",fontSize:13}}>まだ受験データがありません</div>
        :<div style={{overflowX:"auto"}}><table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
          <thead><tr style={{background:"#f8f9fa"}}>{["日時","社員番号","氏名","コース","スコア","結果"].map(h=><th key={h} style={{padding:"10px 14px",textAlign:"left",fontWeight:600,color:"#555"}}>{h}</th>)}</tr></thead>
          <tbody>{results.map((r,i)=><tr key={i} style={{borderBottom:"1px solid #f0f0f0"}}>
            <td style={{padding:"10px 14px",whiteSpace:"nowrap"}}>{fmt(r.date)}</td>
            <td style={{padding:"10px 14px"}}>{r.empId}</td>
            <td style={{padding:"10px 14px"}}>{r.name}</td>
            <td style={{padding:"10px 14px"}}>{r.courseName||r.courseId}</td>
            <td style={{padding:"10px 14px"}}>{r.score}/{r.totalQ}（{r.pct}%）</td>
            <td style={{padding:"10px 14px"}}><span style={{background:r.passed?"#d4edda":"#f8d7da",color:r.passed?"#155724":"#721c24",padding:"2px 8px",borderRadius:10,fontSize:11,fontWeight:600}}>{r.passed?"合格":"不合格"}</span></td>
          </tr>)}</tbody>
        </table></div>}
      </div>}

      {view==="guide"&&<div style={S.card}>
        <div style={{padding:"14px 20px",borderBottom:"1px solid #e0e0e0",fontSize:14,fontWeight:700,color:"#1a2d4a"}}>📝 コンテンツ変更ガイド</div>
        <div style={{padding:"24px",fontSize:13,lineHeight:2,color:"#333"}}>
          <p style={{fontWeight:700,color:"#C0392B",marginBottom:12}}>手順書・Eラーニングの内容変更が必要な場合：</p>
          <p>Claudeに指示することで変更できます。</p>
          <div style={{background:"#f8f9fa",borderRadius:8,padding:"14px 18px",marginTop:12}}>変更依頼の例：<br/>• 「納入手順書の○○を追加して」<br/>• 「テスト問題を△△に変更して」<br/>• 「AIチャットの知識ベースに□□を追加」<br/>• 「法令改正に伴い数値を更新」</div>
          <div style={{background:"#d4edda",borderRadius:8,padding:"14px 18px",marginTop:12,border:"1px solid #28a745"}}>対応範囲：<br/>✅ 手順書の内容追加・修正・削除<br/>✅ Eラーニングのコース・テスト問題変更<br/>✅ AIチャットボットの知識ベース更新<br/>✅ 緊急連絡先・法令数値の更新</div>
        </div>
      </div>}
    </div>
  );
}

/* ===== App ===== */
export default function App(){
  const[tab,setTab]=useState("home");const[user,setUser]=useState(null);
  const logout=()=>{setUser(null);setTab("home");};
  return(
    <div style={{minHeight:"100vh",background:S.bg,fontFamily:"'Helvetica Neue',Arial,'Hiragino Sans',sans-serif"}}>
      <Header tab={tab} setTab={setTab} user={user} onLogout={logout}/>
      {tab==="home"&&<Home setTab={setTab} user={user}/>}
      {tab==="manual"&&<ManualViewer/>}
      {tab==="elearning"&&<ELearning user={user} setUser={setUser}/>}
      {tab==="chat"&&<Chatbot/>}
      {tab==="admin"&&<AdminPanel/>}
    </div>
  );
}