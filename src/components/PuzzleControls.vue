<!-- src/components/PuzzleControls.vue -->
<template>
  <div class="controls">
    <button @click="onShuffle">シャッフル</button>
    <button @click="onReset">リセット</button>
    <!-- 必要に応じて、盤面サイズを変更するセレクトなどを追加可能 -->
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
