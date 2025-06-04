Vue 3 + Vite + TypeScript を用いたパズルスライダーのコンポーネント構成案とApp.vueひな形例
Vue 3 + Vite + TypeScript を用いたパズルスライダー（15パズルなど）の基本的なコンポーネント構成案と、App.vue のひな形例を示します。目的はスライダーゲームの盤面（タイル配置）、操作ボタン（リセットやシャッフル）、状態管理ロジックを分離し、可読性と拡張性を保つことです。

1. ディレクトリ構成例
pazurusuraidaa/
├── public/
│   └── index.html
├── src/
│   ├── assets/                  # 画像やフォントなど
│   ├── components/
│   │   ├── PuzzleBoard.vue      # 盤面（マス目・タイル）の描画と移動ロジック
│   │   ├── PuzzleTile.vue       # 1マス分のタイルを表現
│   │   └── PuzzleControls.vue   # 「シャッフル」「リセット」など操作パネル
│   ├── composables/
│   │   └── usePuzzle.ts         # パズルの状態管理・ロジック（composition API のフック）
│   ├── types/
│   │   └── index.ts             # 型定義（たとえばタイル位置など）
│   ├── App.vue                  # ルートコンポーネント
│   ├── main.ts                  # エントリポイント
│   └── style.css                # グローバルスタイル（必要に応じて）
├── tsconfig.json
├── vite.config.ts
└── package.json
components/ 以下

PuzzleBoard.vue → 盤面全体を描画し、タイルを並べるコンポーネント
PuzzleTile.vue → 個々のタイルを表示。クリック時に移動可能かどうか判定は親に委譲
PuzzleControls.vue → 「シャッフル」「リセット」「サイズ変更（オプション）」などの操作ボタン一式
composables/usePuzzle.ts
Composition API＋TypeScript でパズルの状態（タイルの並び、空マスの位置、スライド可能判定など）を管理するフックファイル。
これを取り込むことで、PuzzleBoard.vue から状態を参照・更新したり、App.vue から「シャッフル」命令を発行したりできる。

types/index.ts
Tile や Position といったインターフェース／型定義をまとめる。

2. 型定義例（src/types/index.ts）
まずは、タイルや盤面サイズなどを定義する型を準備します。

TypeScript

// src/types/index.ts

/** 1つのタイルを表す型 */
export interface Tile {
  /** 0 を空マスとする */
  value: number;
  /** 行（0 から N-1） */
  row: number;
  /** 列（0 から N-1） */
  col: number;
}

/** 盤面サイズ（デフォルトは 4×4 の15パズル） */
export type BoardSize = 3 | 4 | 5; // 必要に応じて拡張

/** タイル移動可能判定のための方向 */
export type Direction = "up" | "down" | "left" | "right";
3. パズルの状態管理 Composable（src/composables/usePuzzle.ts）
Composition API を用いて、盤面のタイル配列や操作ロジックを切り出します。これでどのコンポーネントからも同じ状態を使えるようになります。

TypeScript

// src/composables/usePuzzle.ts
import { ref, computed } from "vue";
import type { Tile, BoardSize, Direction } from "@/types";

/**
 * パズルの状態を管理するカスタムフック
 */
export function usePuzzle(size: BoardSize = 4) {
  // 盤面のタイル配列を一次元配列で管理（index = row * size + col）
  const tiles = ref<Tile[]>([]);

  /** 空マスの値を 0 とする */
  const EMPTY_VALUE = 0;

  //--- 初期化処理 ---//
  /**
   * 初期状態を生成（1, 2, ..., size*size - 1, 0）
   */
  function initTiles() {
    const arr: Tile[] = [];
    for (let idx = 0; idx < size * size; idx++) {
      const value = idx === size * size - 1 ? EMPTY_VALUE : idx + 1;
      arr.push({
        value,
        row: Math.floor(idx / size),
        col: idx % size,
      });
    }
    tiles.value = arr;
  }

  /**
   * Fisher–Yates シャッフルでランダム配置
   * ただし、15パズルは可解性 (solvable) を考慮する必要があるので、
   * 可解ならOK、不可解なら再シャッフル。
   */
  function shuffleTiles() {
    const arr = tiles.value.map((t) => ({ ...t }));
    // 値のみをシャッフル
    const values = arr.map((t) => t.value);
    do {
      for (let i = values.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [values[i], values[j]] = [values[j], values[i]];
      }
    } while (!isSolvable(values));

    // シャッフル後の値をタイルに再セット
    arr.forEach((t, i) => {
      t.value = values[i];
      t.row = Math.floor(i / size);
      t.col = i % size;
    });
    tiles.value = arr;
  }

  /**
   * 1次元配列の values が可解 (solvable) か判定するヘルパー
   */
  function isSolvable(values: number[]): boolean {
    let inversions = 0;
    // 空マスは除外してカウント
    const flat = values.filter((v) => v !== EMPTY_VALUE);
    for (let i = 0; i < flat.length; i++) {
      for (let j = i + 1; j < flat.length; j++) {
        if (flat[i] > flat[j]) inversions++;
      }
      }
    // 盤面が偶数サイズの場合、空マスの行番号（下から数えて何行目か）も考慮
    if (size % 2 === 0) {
      // 空マスの現在のインデックス
      const emptyIndex = values.indexOf(EMPTY_VALUE);
      const emptyRowFromTop = Math.floor(emptyIndex / size); // 0スタート
      const emptyRowFromBottom = size - emptyRowFromTop;
      // 可解性条件：
      // (空マスの行が下から偶数行なら inversion は奇数、奇数行なら inversion は偶数)
      return (
        (emptyRowFromBottom % 2 === 0 && inversions % 2 === 1) ||
        (emptyRowFromBottom % 2 === 1 && inversions % 2 === 0)
      );
    }
    // 盤面が奇数サイズの場合、inversion が偶数なら可解
    return inversions % 2 === 0;
  }

  /** タイルをクリックしたときの移動処理 */
  function moveTile(tile: Tile) {
    const emptyIdx = tiles.value.findIndex((t) => t.value === EMPTY_VALUE);
    const targetIdx = tiles.value.findIndex(
      (t) => t.row === tile.row && t.col === tile.col
    );
    // 空マスとの距離判定（上下左右いずれか1マスか）
    const empty = tiles.value[emptyIdx];
    const dr = Math.abs(empty.row - tile.row);
    const dc = Math.abs(empty.col - tile.col);
    if (dr + dc !== 1) {
      // マンハッタン距離が1でなければ移動不可
      return;
    }
    // 1. 空マスとクリックタイルを交換
    tiles.value = tiles.value.map((t, i) => {
      if (i === emptyIdx) {
        return { ...tile, row: empty.row, col: empty.col };
      }
      if (i === targetIdx) {
        return { ...empty, row: tile.row, col: tile.col };
      }
      return t;
    });
  }

  /** 現在完成状態かを判定 */
  const isSolved = computed(() => {
    for (let i = 0; i < tiles.value.length - 1; i++) {
      if (tiles.value[i].value !== i + 1) return false;
    }
    // 最後のマスが EMPTY_VALUE になっているか
    return tiles.value[tiles.value.length - 1].value === EMPTY_VALUE;
  });

  //--- 初回呼び出しで初期化 ---//
  initTiles();

  return {
    size,
    tiles,
    shuffleTiles,
    moveTile,
    isSolved,
  };
}
ポイント

タイルは Tile 型で { value: number; row: number; col: number } を保持。値が 0 のものを空マスとする。
initTiles() で初期配置を作り、shuffleTiles() で可解性を担保したシャッフルを実行。
moveTile() でクリックしたタイルが空マスと隣接していればスワップ。
isSolved は完成判定用の computed プロパティ。
4. タイルコンポーネント（src/components/PuzzleTile.vue）
1マスに相当するタイルを押下可能にし、表示・簡易スタイルを提供します。

コード スニペット

<template>
  <div
    class="puzzle-tile"
    :class="{ empty: tile.value === 0 }"
    @click="onClick"
  >
    <span v-if="tile.value !== 0">{{ tile.value }}</span>
  </div>
</template>

<script lang="ts" setup>
import { defineProps, defineEmits } from "vue";
import type { Tile } from "@/types";

const props = defineProps<{
  tile: Tile;
}>();

const emits = defineEmits<{
  (e: "click-tile", tile: Tile): void;
}>();

function onClick() {
  if (props.tile.value === 0) return;
  emits("click-tile", props.tile);
}
</script>

<style scoped>
.puzzle-tile {
  width: 80px;
  height: 80px;
  border: 1px solid #333;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 1.5rem;
  cursor: pointer;
  user-select: none;
  background-color: #f0f0f0;
}
.puzzle-tile.empty {
  background-color: transparent;
  cursor: default;
}
</style>
ポイント

tile.value === 0 のときは「空マス」として何も表示せず、クリック無効化。
クリックがあったら親（PuzzleBoard.vue）へ click-tile イベントを発行。
5. 盤面コンポーネント（src/components/PuzzleBoard.vue）
タイルをグリッド状に並べ、PuzzleTile を配置・クリックイベントを拾って usePuzzle の moveTile() を呼び出します。

コード スニペット

<template>
  <div class="board-wrapper">
    <div
      class="board-grid"
      :style="{
        gridTemplateColumns: `repeat(${size}, 1fr)`,
        gridTemplateRows: `repeat(${size}, 1fr)`,
      }"
    >
      <PuzzleTile
        v-for="tile in tiles"
        :key="`${tile.row}-${tile.col}`"
        :tile="tile"
        @click-tile="handleTileClick"
      />
    </div>
    <p v-if="isSolved" class="solved-message">クリア！</p>
  </div>
</template>

<script lang="ts" setup>
import { computed } from "vue";
import PuzzleTile from "./PuzzleTile.vue";
import { usePuzzle } from "@/composables/usePuzzle";

const { size, tiles, moveTile, isSolved } = usePuzzle(/* デフォルト 4 */);

/** タイル押下時 */
function handleTileClick(tile: typeof tiles.value[number]) {
  moveTile(tile);
}
</script>

<style scoped>
.board-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.board-grid {
  display: grid;
  gap: 4px;
  margin-bottom: 12px;
}
.solved-message {
  color: green;
  font-weight: bold;
}
</style>
ポイント

usePuzzle() をインポートし、返ってきた tiles をループして PuzzleTile を配置。
CSS グリッド（display: grid; grid-template-columns: repeat(size, 1fr)）で正方形グリッドを実現。
クリア判定（isSolved）が真になったらメッセージを表示。
6. 操作パネルコンポーネント（src/components/PuzzleControls.vue）
シャッフルやリセットボタンを配置し、親へイベントを伝達します。

コード スニペット

<template>
  <div class="controls">
    <button @click="onShuffle">シャッフル</button>
    <button @click="onReset">リセット</button>
    </div>
</template>

<script lang="ts" setup>
import { defineEmits } from "vue";

const emits = defineEmits<{
  (e: "shuffle-requested"): void;
  (e: "reset-requested"): void;
}>();

function onShuffle() {
  emits("shuffle-requested");
}

function onReset() {
  emits("reset-requested");
}
</script>

<style scoped>
.controls {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
}
button {
  padding: 6px 12px;
  font-size: 1rem;
  cursor: pointer;
}
</style>
ポイント

ボタンをクリックすると親にイベントを飛ばすだけのシンプル構造。
親コンポーネント（App.vue）はこれを拾って usePuzzle の shuffleTiles()／initTiles() を呼び出す。
7. ルートコンポーネント（src/App.vue）
上記３つのコンポーネントをまとめ、全体のレイアウトや操作フローを定義します。具体的には、PuzzleControls での命令を受けて usePuzzle のシャッフル／リセットを呼び出し、PuzzleBoard に現在のタイル配列を渡します。

コード スニペット

<template>
  <div id="app">
    <h1>パズルスライダー</h1>

    <PuzzleControls
      @shuffle-requested="shuffleTiles"
      @reset-requested="resetBoard"
    />

    <PuzzleBoard />

    <div class="status-bar">
      <p>盤面サイズ：{{ size }} × {{ size }}</p>
      <p v-if="isSolved">おめでとう！ 完成しました。</p>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { usePuzzle } from "@/composables/usePuzzle";
import PuzzleControls from "@/components/PuzzleControls.vue";
import PuzzleBoard from "@/components/PuzzleBoard.vue";

/** usePuzzle を App.vue でも使うことで操作パネルとの連携を確実にする */
const { size, shuffleTiles, initTiles: resetBoard, isSolved } = usePuzzle(/* 任意でサイズを渡せる */);
</script>

<style>
#app {
  max-width: 400px;
  margin: 0 auto;
  padding: 24px;
  text-align: center;
  font-family: Arial, sans-serif;
}
.status-bar {
  margin-top: 16px;
}
</style>
ポイント

usePuzzle をここでも呼んで、PuzzleControls のイベントハンドラに直接メソッドを渡している（shuffleTiles、resetBoard）。
PuzzleBoard は内部で別途 usePuzzle を呼び、同じ状態を共有する想定（Composition API の呼び出し元が異なっても同一モジュールを使っていればリアクティブに同期される）。
盤面サイズやクリア状態を表示するステータスバーを追加し、ユーザーに進捗感を与える。
8. main.ts（エントリポイント例）
TypeScript

// src/main.ts
import { createApp } from "vue";
import App from "./App.vue";

createApp(App).mount("#app");
Vite の初期テンプレート通りです。tsconfig.json や vite.config.ts はプロジェクト初期化時にすでに生成されている想定です。

9. まとめと発展
責務の分離

PuzzleTile.vue：1マスの描画とクリック検知
PuzzleBoard.vue：タイル配列をグリッドでレンダリング＆クリックを親に伝搬
PuzzleControls.vue：シャッフル・リセットなどの操作フローを一手に担う
usePuzzle.ts：タイル配置ロジック、可解性チェック、移動アルゴリズム、完成判定を独立したモジュールに
拡張性

盤面サイズやタイルの見た目（色・フォントなど）は CSS/Style を調整すれば簡単に対応可能。
usePuzzle に BoardSize 型を引数で渡すことで、3×3～5×5 といった多様なサイズをサポートできる。
「移動回数のカウント」「タイマー機能」「レベル選択」などを追加したい場合、usePuzzle に新たな state やメソッドを追加し、App.vue・Controls.vue から必要なデータを参照・操作すれば実装しやすい。
TypeScript の利点

Tile や BoardSize などの型を厳密に定義することで、移動ロジックやシャッフル時のバグを防ぎやすい。
Composition API（usePuzzle）自体が TypeScript 対応なので、リファクタリング時の型チェックや補完が効きやすい。
以上が、Vue 3 + Vite + TypeScript を用いてパズルスライダーを構築する際の典型的なコンポーネント構成案と、App.vue のひな形例です。この構成をベースに、UI デザインや機能追加（移動回数の表示、クリア判定後のアニメーションなど）を組み込むことで、自分好みの完成度の高いパズルスライダーを作ってみてください。