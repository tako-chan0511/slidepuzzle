// src/composables/usePuzzle.ts
import { ref, computed } from "vue";
import type { Tile, BoardSize } from "@/types";

/**
 * N×M のスライドパズルを管理する Composable
 * - rows × cols の長方形盤面を扱う
 * - 複数タイル移動時の重複を防ぐオリジナルのシフトロジックを保持
 */
export function usePuzzle(rows: number = 4, cols: number = 4) {
  const tiles = ref<Tile[]>([]);
  const EMPTY_VALUE = 0;

  /** 盤面を初期化：1～(rows*cols-1)、最後を 0 (= 空) にする */
  function initTiles() {
    const arr: Tile[] = [];
    for (let idx = 0; idx < rows * cols; idx++) {
      const value = idx === rows * cols - 1 ? EMPTY_VALUE : idx + 1;
      arr.push({
        value,
        row: Math.floor(idx / cols),
        col: idx % cols,
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
    if (rows % 2 === 0) {
      const emptyIndex = values.indexOf(EMPTY_VALUE);
      const emptyRowFromTop = Math.floor(emptyIndex / cols);
      const emptyRowFromBottom = rows - emptyRowFromTop;
      return (
        (emptyRowFromBottom % 2 === 0 && inversions % 2 === 1) ||
        (emptyRowFromBottom % 2 === 1 && inversions % 2 === 0)
      );
    }
    return inversions % 2 === 0;
  }

  /** シャッフル (可解な状態のみを生成) */
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
      t.row = Math.floor(i / cols);
      t.col = i % cols;
    });
    tiles.value = arr;
  }

  /**
   * タイルクリック時の移動処理
   * - 同じ行／列に空マスがある場合、クリック～空白までのすべてをシフト
   * - 斜めなどは何もしない
   */
  function moveTile(tile: Tile) {
    const emptyTile = tiles.value.find((t) => t.value === EMPTY_VALUE)!;
    const clickedTile = tile;

    // 横一列に空マスがある場合
    if (emptyTile.row === clickedTile.row) {
      const row = clickedTile.row;
      const cClicked = clickedTile.col;
      const cEmpty = emptyTile.col;
      const direction = cEmpty > cClicked ? 1 : -1;

      // クリック～空マスまでの列番号
      const colsBetween: number[] = [];
      for (
        let c = cClicked;
        direction === 1 ? c <= cEmpty : c >= cEmpty;
        c += direction
      ) {
        colsBetween.push(c);
      }

      // 隣接スワップ
      if (colsBetween.length <= 2) {
        const idxEmpty = tiles.value.findIndex((t) => t.value === EMPTY_VALUE);
        const idxClicked = tiles.value.findIndex(
          (t) => t.row === row && t.col === cClicked
        );
        tiles.value = tiles.value.map((t, i) => {
          if (i === idxEmpty) return { ...clickedTile, row, col: cEmpty };
          if (i === idxClicked) return { ...emptyTile, row, col: cClicked };
          return t;
        });
        return;
      }

      // 複数タイルを一括シフト
      const movingTiles: Tile[] = [];
      for (const c of colsBetween) {
        const t = tiles.value.find((x) => x.row === row && x.col === c)!;
        movingTiles.push({ ...t });
      }

      // クリックタイルの値を保持
      const clickedValue = movingTiles[0].value;

      // すべてのタイルを後方にずらす
      for (let i = movingTiles.length - 1; i >= 1; i--) {
        movingTiles[i].value = movingTiles[i - 1].value;
      }
      // 先頭を空マス
      movingTiles[0].value = EMPTY_VALUE;

      // 行／列情報更新
      for (let i = 0; i < movingTiles.length; i++) {
        movingTiles[i].row = row;
        movingTiles[i].col = colsBetween[i];
      }

      // 末尾にクリックタイルの値を再配置せず、movingTiles[last] は既に前のループで正しい値を持つ

      // 変更を tiles に反映
      const newTiles = tiles.value.map((t) => ({ ...t }));
      for (let i = 0; i < colsBetween.length; i++) {
        const col = colsBetween[i];
        const idxOriginal = newTiles.findIndex(
          (x) => x.row === row && x.col === col
        );
        newTiles[idxOriginal] = { ...movingTiles[i] };
      }
      tiles.value = newTiles;
      return;
    }

    // 縦一列に空マスがある場合
    if (emptyTile.col === clickedTile.col) {
      const col = clickedTile.col;
      const rClicked = clickedTile.row;
      const rEmpty = emptyTile.row;
      const direction = rEmpty > rClicked ? 1 : -1;

      // クリック～空マスまでの行番号
      const rowsBetween: number[] = [];
      for (
        let r = rClicked;
        direction === 1 ? r <= rEmpty : r >= rEmpty;
        r += direction
      ) {
        rowsBetween.push(r);
      }

      // 隣接スワップ
      if (rowsBetween.length <= 2) {
        const idxEmpty = tiles.value.findIndex((t) => t.value === EMPTY_VALUE);
        const idxClicked = tiles.value.findIndex(
          (t) => t.row === rClicked && t.col === col
        );
        tiles.value = tiles.value.map((t, i) => {
          if (i === idxEmpty) return { ...clickedTile, row: rEmpty, col };
          if (i === idxClicked) return { ...emptyTile, row: rClicked, col };
          return t;
        });
        return;
      }

      // 複数タイルを一括シフト
      const movingTiles: Tile[] = [];
      for (const r of rowsBetween) {
        const t = tiles.value.find((x) => x.row === r && x.col === col)!;
        movingTiles.push({ ...t });
      }

      // クリックタイルの値を保持
      const clickedValue = movingTiles[0].value;

      // 後方にずらす
      for (let i = movingTiles.length - 1; i >= 1; i--) {
        movingTiles[i].value = movingTiles[i - 1].value;
      }
      // 先頭を空マス
      movingTiles[0].value = EMPTY_VALUE;

      // 行／列情報更新
      for (let i = 0; i < movingTiles.length; i++) {
        movingTiles[i].row = rowsBetween[i];
        movingTiles[i].col = col;
      }

      // 末尾は自動的に clickedValue が移動している（重複なし）

      // 変更を tiles に反映
      const newTiles = tiles.value.map((t) => ({ ...t }));
      for (let i = 0; i < rowsBetween.length; i++) {
        const r = rowsBetween[i];
        const idxOriginal = newTiles.findIndex(
          (x) => x.row === r && x.col === col
        );
        newTiles[idxOriginal] = { ...movingTiles[i] };
      }
      tiles.value = newTiles;
      return;
    }

    // それ以外は移動不可
    return;
  }

  /** 完成判定 */
  const isSolved = computed(() => {
    for (let i = 0; i < tiles.value.length - 1; i++) {
      if (tiles.value[i].value !== i + 1) return false;
    }
    return tiles.value[tiles.value.length - 1].value === EMPTY_VALUE;
  });

  // 初期化
  initTiles();

  return {
    rows,
    cols,
    tiles,
    shuffleTiles,
    moveTile,
    isSolved,
    initTiles,
  };
}
