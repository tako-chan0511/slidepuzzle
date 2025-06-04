// src/composables/usePuzzle.ts
import { ref, computed } from "vue";
import type { Tile, BoardSize, Direction } from "@/types";

/**
 * パズルの状態を管理するカスタムフック
 */
export function usePuzzle(size: BoardSize = 4) {
  // 盤面のタイル配列を一次元配列で管理（index = row * size + col）
  const tiles = ref<Tile[]>([]);

  /** 空マスの値を 0 とする */
  const EMPTY_VALUE = 0;

  //--- 初期化処理 ---//
  /**
   * 初期状態を生成（1, 2, ..., size*size - 1, 0）
   */
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

  /**
   * Fisher–Yates シャッフルでランダム配置
   * ただし、15パズルは可解性 (solvable) を考慮する必要があるので、
   * 可解ならOK、不可解なら再シャッフル。
   */
  function shuffleTiles() {
    const arr = tiles.value.map((t) => ({ ...t }));
    // 値のみをシャッフル
    const values = arr.map((t) => t.value);
    do {
      for (let i = values.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [values[i], values[j]] = [values[j], values[i]];
      }
    } while (!isSolvable(values));

    // シャッフル後の値をタイルに再セット
    arr.forEach((t, i) => {
      t.value = values[i];
      t.row = Math.floor(i / size);
      t.col = i % size;
    });
    tiles.value = arr;
  }

  /**
   * 1次元配列の values が可解 (solvable) か判定するヘルパー
   */
  function isSolvable(values: number[]): boolean {
    let inversions = 0;
    // 空マスは除外してカウント
    const flat = values.filter((v) => v !== EMPTY_VALUE);
    for (let i = 0; i < flat.length; i++) {
      for (let j = i + 1; j < flat.length; j++) {
        if (flat[i] > flat[j]) inversions++;
      }
    }
    // 盤面が偶数サイズの場合、空マスの行番号（下から数えて何行目か）も考慮
    if (size % 2 === 0) {
      // 空マスの現在のインデックス
      const emptyIndex = values.indexOf(EMPTY_VALUE);
      const emptyRowFromTop = Math.floor(emptyIndex / size); // 0スタート
      const emptyRowFromBottom = size - emptyRowFromTop;
      // 可解性条件：
      // (空マスの行が下から偶数行なら inversion は奇数、奇数行なら inversion は偶数)
      return (
        (emptyRowFromBottom % 2 === 0 && inversions % 2 === 1) ||
        (emptyRowFromBottom % 2 === 1 && inversions % 2 === 0)
      );
    }
    // 盤面が奇数サイズの場合、inversion が偶数なら可解
    return inversions % 2 === 0;
  }

  /** タイルをクリックしたときの移動処理 */
  function moveTile(tile: Tile) {
    const emptyIdx = tiles.value.findIndex((t) => t.value === EMPTY_VALUE);
    const targetIdx = tiles.value.findIndex(
      (t) => t.row === tile.row && t.col === tile.col
    );
    // 空マスとの距離判定（上下左右いずれか1マスか）
    const empty = tiles.value[emptyIdx];
    const dr = Math.abs(empty.row - tile.row);
    const dc = Math.abs(empty.col - tile.col);
    if (dr + dc !== 1) {
      // マンハッタン距離が1でなければ移動不可
      return;
    }
    // 1. 空マスとクリックタイルを交換
    tiles.value = tiles.value.map((t, i) => {
      if (i === emptyIdx) {
        return { ...tile, row: empty.row, col: empty.col };
      }
      if (i === targetIdx) {
        return { ...empty, row: tile.row, col: tile.col };
      }
      return t;
    });
  }

  /** 現在完成状態かを判定 */
  const isSolved = computed(() => {
    for (let i = 0; i < tiles.value.length - 1; i++) {
      if (tiles.value[i].value !== i + 1) return false;
    }
    // 最後のマスが EMPTY_VALUE になっているか
    return tiles.value[tiles.value.length - 1].value === EMPTY_VALUE;
  });

  //--- 初回呼び出しで初期化 ---//
  initTiles();

  return {
    size,
    tiles,
    shuffleTiles,
    moveTile,
    isSolved,
  };
}
