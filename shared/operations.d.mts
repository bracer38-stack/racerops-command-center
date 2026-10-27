import type { Alert, Business, CloudFile, Inventory, Todo, Resource } from '../src/live/types';
export const businessNames: Business[];
export function decodeText(value: unknown): string;
export function formatDate(value?: string | null): string;
export function classifyAlert(alert: Alert): Alert & { promotional: boolean };
export function missingFields(item: Inventory): string[];
export interface Suggestion { field: 'size' | 'color' | 'brand'; value: string; previous: string }
export function inventorySuggestions(item: Inventory): Suggestion[];
export interface Move { id: string; resource: Resource; business: Business; title: string; detail: string; record: Alert | Inventory | Todo }
export function todayMoves(snapshot: { alerts: Alert[]; inventory: Inventory[]; todos: Todo[] }): Move[];
export function compactFiles(files: CloudFile[]): CloudFile[];
