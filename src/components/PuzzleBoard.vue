<!-- src/components/PuzzleBoard.vue -->
<template>
  <div class="board-wrapper">
    <div
      class="board-grid"
      :style="{
        gridTemplateColumns: `repeat(${cols}, 1fr)`,
        gridTemplateRows: `repeat(${rows}, 1fr)`,
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

const props = defineProps<{
  rows: number;
  cols: number;
  tiles: Tile[];
  moveTile: (tile: Tile) => void;
  isSolved: boolean;
}>();

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
