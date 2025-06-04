<!-- src/App.vue -->
<template>
  <div id="app">
    <h1>パズルスライダー</h1>

    <!-- 操作パネル -->
    <PuzzleControls
      @shuffle-requested="shuffleTiles"
      @reset-requested="resetBoard"
    />

    <!-- 盤面 -->
    <PuzzleBoard />

    <!-- 任意：クリア後に表示するメッセージや統計情報 -->
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
