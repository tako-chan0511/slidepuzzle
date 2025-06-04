<!-- src/components/PuzzleTile.vue -->
<template>
  <div
    class="puzzle-tile"
    :class="{ empty: tile.value === 0 }"
    @click="onClick"
  >
    <!-- 値が 0（空マス）の場合は何も表示しない -->
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
