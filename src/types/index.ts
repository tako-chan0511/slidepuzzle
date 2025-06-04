// src/types/index.ts

/** 1つのタイルを表す型 */
export interface Tile {
  /** 0 を空マスとする */
  value: number;
  /** 行（0 から N-1） */
  row: number;
  /** 列（0 から N-1） */
  col: number;
}

/** 盤面サイズ（デフォルトは 4×4 の15パズル） */
export type BoardSize = 3 | 4 | 5; // 必要に応じて拡張

/** タイル移動可能判定のための方向 */
export type Direction = "up" | "down" | "left" | "right";
