// src/composables/usePuzzle.ts
import { ref, computed } from "vue";
import type { Tile, BoardSize } from "@/types";

export function usePuzzle(size: BoardSize = 4) {
  const tiles = ref<Tile[]>([]);
  const EMPTY_VALUE = 0;

  /** 盤面を初期化 */
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

  /** 可解性判定 */
  function isSolvable(values: number[]): boolean {
    let inversions = 0;
    const flat = values.filter((v) => v !== EMPTY_VALUE);
    for (let i = 0; i < flat.length; i++) {
      for (let j = i + 1; j < flat.length; j++) {
        if (flat[i] > flat[j]) inversions++;
      }
    }
    if (size % 2 === 0) {
      const emptyIndex = values.indexOf(EMPTY_VALUE);
      const emptyRowFromTop = Math.floor(emptyIndex / size);
      const emptyRowFromBottom = size - emptyRowFromTop;
      return (
        (emptyRowFromBottom % 2 === 0 && inversions % 2 === 1) ||
        (emptyRowFromBottom % 2 === 1 && inversions % 2 === 0)
      );
    }
    return inversions % 2 === 0;
  }

  /** シャッフル */
  function shuffleTiles() {
    const arr = tiles.value.map((t) => ({ ...t }));
    const values = arr.map((t) => t.value);
    do {
      for (let i = values.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [values[i], values[j]] = [values[j], values[i]];
      }
    } while (!isSolvable(values));

    arr.forEach((t, i) => {
      t.value = values[i];
      t.row = Math.floor(i / size);
      t.col = i % size;
    });
    tiles.value = arr;
  }

  /** 複数／単一タイル移動 */
  function moveTile(tile: Tile) {
    const emptyIdx = tiles.value.findIndex((t) => t.value === EMPTY_VALUE);
    const emptyTile = tiles.value[emptyIdx];
    const clickedIdx = tiles.value.findIndex(
      (t) => t.row === tile.row && t.col === tile.col
    );

    // 横一列に空マスがある場合
    if (emptyTile.row === tile.row) {
      const row = tile.row;
      const cClicked = tile.col;
      const cEmpty = emptyTile.col;
      const direction = cEmpty > cClicked ? 1 : -1;
      const colsBetween = [];
      for (
        let c = cClicked;
        direction === 1 ? c <= cEmpty : c >= cEmpty;
        c += direction
      ) {
        colsBetween.push(c);
      }
      if (colsBetween.length <= 2) {
        tiles.value = tiles.value.map((t, i) => {
          if (i === emptyIdx) return { ...tile, row: row, col: cEmpty };
          if (i === clickedIdx) return { ...emptyTile, row: row, col: cClicked };
          return t;
        });
        return;
      }
      const clickedValue = tile.value;
      const newTiles = tiles.value.map((t) => ({ ...t }));
      for (let idxCol = colsBetween.length - 1; idxCol >= 1; idxCol--) {
        const fromCol = colsBetween[idxCol - 1];
        const toCol = colsBetween[idxCol];
        const fromIdx = newTiles.findIndex(
          (t) => t.row === row && t.col === fromCol
        );
        newTiles[fromIdx].col = toCol;
        newTiles[fromIdx].row = row;
      }
      const clickedTileIdx = newTiles.findIndex(
        (t) => t.row === row && t.col === cClicked
      );
      newTiles[clickedTileIdx].value = EMPTY_VALUE;
      const emptyNewIdx = newTiles.findIndex(
        (t) => t.value === EMPTY_VALUE && t.row === row && t.col === cClicked
      );
      newTiles[emptyNewIdx] = {
        value: clickedValue,
        row: row,
        col: cEmpty,
      };
      tiles.value = newTiles;
      return;
    }

    // 縦一列に空マスがある場合
    if (emptyTile.col === tile.col) {
      const col = tile.col;
      const rClicked = tile.row;
      const rEmpty = emptyTile.row;
      const direction = rEmpty > rClicked ? 1 : -1;
      const rowsBetween = [];
      for (
        let r = rClicked;
        direction === 1 ? r <= rEmpty : r >= rEmpty;
        r += direction
      ) {
        rowsBetween.push(r);
      }
      if (rowsBetween.length <= 2) {
        tiles.value = tiles.value.map((t, i) => {
          if (i === emptyIdx) return { ...tile, row: rEmpty, col: col };
          if (i === clickedIdx) return { ...emptyTile, row: rClicked, col: col };
          return t;
        });
        return;
      }
      const clickedValue = tile.value;
      const newTiles = tiles.value.map((t) => ({ ...t }));
      for (let idxRow = rowsBetween.length - 1; idxRow >= 1; idxRow--) {
        const fromRow = rowsBetween[idxRow - 1];
        const toRow = rowsBetween[idxRow];
        const fromIdx = newTiles.findIndex(
          (t) => t.row === fromRow && t.col === col
        );
        newTiles[fromIdx].row = toRow;
        newTiles[fromIdx].col = col;
      }
      const clickedTileIdx = newTiles.findIndex(
        (t) => t.row === rClicked && t.col === col
      );
      newTiles[clickedTileIdx].value = EMPTY_VALUE;
      const emptyNewIdx = newTiles.findIndex(
        (t) =>
          t.value === EMPTY_VALUE && t.row === rClicked && t.col === col
      );
      newTiles[emptyNewIdx] = {
        value: clickedValue,
        row: rEmpty,
        col: col,
      };
      tiles.value = newTiles;
      return;
    }

    // 移動不可
    return;
  }

  const isSolved = computed(() => {
    for (let i = 0; i < tiles.value.length - 1; i++) {
      if (tiles.value[i].value !== i + 1) return false;
    }
    return tiles.value[tiles.value.length - 1].value === EMPTY_VALUE;
  });

  // 初期化を呼ぶ
  initTiles();

  // 返り値に initTiles を含める
  return {
    size,
    tiles,
    shuffleTiles,
    moveTile,
    isSolved,
    initTiles
  };
}
