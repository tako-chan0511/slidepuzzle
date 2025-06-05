<!-- src/App.vue -->
<template>
  <div id="app">
    <h1>パズルスライダーＮ×Ｍ</h1>

    <!-- サイズ設定フォーム -->
    <div class="size-form">
      <label>
        行数 (Rows):
        <input
          type="number"
          v-model.number="rowsInput"
          min="2"
          max="10"
          @change="clearError"
        />
      </label>
      <label>
        列数 (Cols):
        <input
          type="number"
          v-model.number="colsInput"
          min="2"
          max="10"
          @change="clearError"
        />
      </label>
      <button @click="initializePuzzle">設定反映</button>
      <p v-if="errorMsg" class="error">{{ errorMsg }}</p>
    </div>

    <!-- 操作パネルに shuffle/reset のメソッドを渡す -->
    <PuzzleControls
      @shuffle-requested="puzzle.shuffleTiles()"
      @reset-requested="puzzle.initTiles()"
    />

    <!-- 盤面には currentRows, currentCols, tiles, moveTile, isSolved を渡す -->
    <PuzzleBoard
      :rows="currentRows"
      :cols="currentCols"
      :tiles="puzzle.tiles.value"
      :moveTile="puzzle.moveTile"
      :isSolved="puzzle.isSolved.value"
    />

    <!-- クリアメッセージ -->
    <div class="status-bar">
      <p>盤面サイズ：{{ currentRows }} × {{ currentCols }}</p>
      <p v-if="puzzle.isSolved.value">おめでとう！ 完成しました。</p>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from "vue";
import { usePuzzle } from "@/composables/usePuzzle";
import PuzzleControls from "@/components/PuzzleControls.vue";
import PuzzleBoard from "@/components/PuzzleBoard.vue";

// 入力フォーム用（途中変更では盤面に反映しない）
const rowsInput = ref<number>(4);
const colsInput = ref<number>(4);
const errorMsg = ref<string>("");

// 現在の盤面サイズ（「設定反映」ボタンでこちらを更新）
const currentRows = ref<number>(4);
const currentCols = ref<number>(4);

// 最初に 4×4 でパズルを生成
let puzzle = usePuzzle(currentRows.value, currentCols.value);

/** エラーメッセージをクリア */
function clearError() {
  errorMsg.value = "";
}

/** 「設定反映」ボタンを押したときだけ盤面サイズを更新し、パズルを再生成 */
function initializePuzzle() {
  if (
    !Number.isInteger(rowsInput.value) ||
    !Number.isInteger(colsInput.value) ||
    rowsInput.value < 2 ||
    colsInput.value < 2 ||
    rowsInput.value > 10 ||
    colsInput.value > 10
  ) {
    errorMsg.value = "行数・列数は 2 ～ 10 の整数にしてください。";
    return;
  }
  currentRows.value = rowsInput.value;
  currentCols.value = colsInput.value;
  puzzle = usePuzzle(currentRows.value, currentCols.value);
}
</script>

<style>
#app {
  max-width: 500px;
  margin: 0 auto;
  padding: 24px;
  text-align: center;
  font-family: Arial, sans-serif;
}

.size-form {
  display: flex;
  gap: 12px;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
}

.size-form input {
  width: 50px;
  text-align: center;
}

.error {
  color: red;
  margin-top: 8px;
}

.status-bar {
  margin-top: 16px;
}
</style>
