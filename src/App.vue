<!-- src/App.vue -->
<template>
  <div id="app">
    <h1>パズルスライダー</h1>

    <!-- 操作パネルに shuffle/reset のメソッドを渡す -->
    <PuzzleControls
      @shuffle-requested="shuffleTiles"
      @reset-requested="resetBoard"
    />

    <!-- 盤面には tiles, size, moveTile, isSolved を渡す -->
    <PuzzleBoard
      :size="size"
      :tiles="tiles"
      :moveTile="moveTile"
      :isSolved="isSolved"
    />

    <!-- クリアメッセージ -->
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

// ここで１回だけ usePuzzle を呼び出し、同じ状態を子コンポーネントに渡す
const { size, tiles, shuffleTiles, initTiles: resetBoard, moveTile, isSolved } =
  usePuzzle(/* デフォルトサイズ 4 */);
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
