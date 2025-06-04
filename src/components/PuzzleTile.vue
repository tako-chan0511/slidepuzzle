<!-- src/components/PuzzleTile.vue -->
<template>
  <div
    :class="['tile', { empty: tile.value === 0 }]"
    @click="() => $emit('click-tile', tile)"
  >
    <!-- 空タイルは中身を表示しない -->
    <span v-if="tile.value !== 0">{{ tile.value }}</span>
  </div>
</template>

<script lang="ts" setup>
import type { Tile } from "@/types";
import { defineProps, defineEmits } from "vue";

const props = defineProps<{ tile: Tile }>();
const emits = defineEmits<{
  (e: "click-tile", tile: Tile): void;
}>();
</script>

<style scoped>
.tile {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  font-weight: bold;
  border: 1px solid #ccc;
  border-radius: 4px;
  /* 数字タイルの背景色 */
  background-color: #cfe8fc; /* 淡いライトブルー */
  color: #333; /* 濃いグレー（ほぼ黒） */
  user-select: none;
}

/* 空タイル（値が0のタイル）のスタイル */
.tile.empty {
  background-color: #e0e0e0; /* 薄いグレー */
  /* 空タイルに数字は表示しないので、色指定は不要 */
}

/* モバイル端末でも押しやすいよう余白を確保 */
.tile {
  width: 60px;
  height: 60px;
}

@media (max-width: 480px) {
  /* スマホや小さめスクリーンではタイルを少し小さく */
  .tile {
    width: 48px;
    height: 48px;
    font-size: 1rem;
  }
}
</style>
