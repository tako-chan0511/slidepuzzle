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

  /**
   * タイルをクリックしたときの移動処理
   * → 同じ行／列に空マスがある場合、その間のすべてのタイルを空マス方向にシフトする
   */
  function moveTile(tile: Tile) {
    const emptyTile = tiles.value.find((t) => t.value === EMPTY_VALUE)!;
    const clickedTile = tile;

    // 1) 横一列に空マスがある場合
    if (emptyTile.row === clickedTile.row) {
      const row = clickedTile.row;
      const cClicked = clickedTile.col;
      const cEmpty = emptyTile.col;
      const direction = cEmpty > cClicked ? 1 : -1; // +1: 右へ, -1: 左へ

      // クリックタイルから空マスまでの「列番号」をすべて列挙
      const colsBetween: number[] = [];
      for (
        let c = cClicked;
        direction === 1 ? c <= cEmpty : c >= cEmpty;
        c += direction
      ) {
        colsBetween.push(c);
      }

      // 隣接している場合は従来どおり 1枚だけスワップ
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

      // 複数タイルを一度にシフトする場合
      // ────────────────────────────────────
      // クリックタイル～空マスタイルまでのタイルをすべて取得
      const movingTiles: Tile[] = [];
      for (const col of colsBetween) {
        const t = tiles.value.find((x) => x.row === row && x.col === col)!;
        movingTiles.push({ ...t });
      }

      // クリックタイルの値を保存
      const clickedValue = movingTiles[0].value;

      // 値を右（または左）へシフト
      for (let i = movingTiles.length - 1; i >= 1; i--) {
        movingTiles[i].value = movingTiles[i - 1].value;
      }
      // クリックタイル位置には空マスをセット
      movingTiles[0].value = EMPTY_VALUE;

      // それぞれのタイルの行／列を更新
      for (let i = 0; i < movingTiles.length; i++) {
        movingTiles[i].row = row;
        movingTiles[i].col = colsBetween[i];
      }

      // 空マス位置にクリックタイルの値をセット（最後のインデックスではすでに前のタイルの値が入っているので不要）
      // ※前のループで movingTiles[last].value に元々前のタイルの値が入っているため、ここで clickedValue を重複して設定しない

      // 変更後のタイル配置を反映
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

    // 2) 縦一列に空マスがある場合
    if (emptyTile.col === clickedTile.col) {
      const col = clickedTile.col;
      const rClicked = clickedTile.row;
      const rEmpty = emptyTile.row;
      const direction = rEmpty > rClicked ? 1 : -1; // +1: 下へ, -1: 上へ

      // クリックタイルから空マスまでの「行番号」をすべて列挙
      const rowsBetween: number[] = [];
      for (
        let r = rClicked;
        direction === 1 ? r <= rEmpty : r >= rEmpty;
        r += direction
      ) {
        rowsBetween.push(r);
      }

      // 隣接している場合は 1枚だけスワップ
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

      // 複数タイルを一度にシフトする場合
      // ────────────────────────────────────
      // クリックタイル～空マスタイルまでのタイルをすべて取得
      const movingTiles: Tile[] = [];
      for (const row of rowsBetween) {
        const t = tiles.value.find((x) => x.row === row && x.col === col)!;
        movingTiles.push({ ...t });
      }

      // クリックタイルの値を保存
      const clickedValue = movingTiles[0].value;

      // 値を下（または上）へシフト
      for (let i = movingTiles.length - 1; i >= 1; i--) {
        movingTiles[i].value = movingTiles[i - 1].value;
      }
      // クリックタイル位置には空マスをセット
      movingTiles[0].value = EMPTY_VALUE;

      // それぞれのタイルの行／列を更新
      for (let i = 0; i < movingTiles.length; i++) {
        movingTiles[i].row = rowsBetween[i];
        movingTiles[i].col = col;
      }

      // 空マス位置にクリックタイルの値をセット（不要な重複代入を省略）

      // 変更後のタイル配置を反映
      const newTiles = tiles.value.map((t) => ({ ...t }));
      for (let i = 0; i < rowsBetween.length; i++) {
        const row = rowsBetween[i];
        const idxOriginal = newTiles.findIndex(
          (x) => x.row === row && x.col === col
        );
        newTiles[idxOriginal] = { ...movingTiles[i] };
      }
      tiles.value = newTiles;
      return;
    }

    // 3) それ以外（斜め or 離れている）場合は移動不可
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
    size,
    tiles,
    shuffleTiles,
    moveTile,
    isSolved,
    initTiles,
  };
}
