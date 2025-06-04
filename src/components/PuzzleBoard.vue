<!-- src/components/PuzzleBoard.vue -->
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
import { defineProps } from "vue";
import PuzzleTile from "./PuzzleTile.vue";
import type { Tile } from "@/types";

// Props の型を定義
const props = defineProps<{
  size: number;
  tiles: Tile[];
  moveTile: (tile: Tile) => void;
  isSolved: boolean;
}>();

/** タイル押下時 は props.moveTile を呼ぶ */
function handleTileClick(tile: Tile) {
  props.moveTile(tile);
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
