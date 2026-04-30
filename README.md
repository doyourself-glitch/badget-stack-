# Budget Stack

> **「あといくら使えるか」を直感的に。Apple Aestheticを追求したミニマルな予算管理アプリ。**

`Budget Stack` は、家計簿のような「記録の負担」を最小限に抑え、現在の残余予算（Margin）を把握することに特化したパーソナルファイナンスツールです。

[https://vercel.com/doyourself-glitchs-projects/badget-stack-jzpe/9Mzh6matRo1UzKWEd64c7MxkZ6uB]([GitHubリポジトリURL])

---

## ✨ UI/UX Philosophy

Appleのプロダクトデザインにインスパイアされた、シンプルかつ重厚感のある体験を設計しました。

-   **Glassmorphism & Elevation:** `backdrop-filter` を活用したグラスモフィズムを採用。物理的な奥行き（Elevation）を演出することで、情報の優先度を視覚的に整理しています。
-   **Micro-interactions:** Vibration API を用いた触覚フィードバックを実装。ボタン押下時の物理的な手応えが、デジタルな操作に心地よさを加えます。
-   **Clarity & Margin:** 「Margin（残余）」を最も大きく配置。タイポグラフィと十分な余白により、アプリを開いた瞬間に最も重要な情報を認識できるよう調整しました。

## 🛠 Technical Stack

-   **Frontend:** React / TypeScript
-   **Styling:** CSS3 (Custom Properties / Flexbox / Glassmorphism)
-   **Data Persistence:** LocalStorage API
-   **Feedback:** Vibration API

## 🚀 Key Features

-   **Real-time Margin Calculation:** 目標予算と支出の差分をリアルタイムに計算し、プログレスバーで視覚化。
-   **Smart Categorization:** 頻出するカテゴリーを選択式にし、入力の手間を削減。
-   **Safe Logging:** 記録ミスを即座に修正できる削除機能と、1日の終わりにデータをリセットする確定機能を搭載。
-   **Responsive Design:** モバイルデバイスでの片手操作に最適化されたレイアウト。
