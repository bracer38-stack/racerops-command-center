export type Business = "Kim's Closet" | 'Over50FitLife' | 'NutriPlanPro' | 'App Studio' | 'Dual Business';
export type Resource = 'inventory' | 'alerts' | 'files' | 'apps' | 'todos' | 'notifications';
export interface RecordMeta { id: string; createdAt: string; updatedAt: string }
export interface Inventory extends RecordMeta {
  sku: string; title: string; brand: string; size: string; color: string; price: number | null;
  status: string; notes: string; season: string; platforms: string; sourceBatch: string; business: Business; imageUrl: string;
}
export interface Alert extends RecordMeta {
  account: string; externalId: string; from: string; date: string; subject: string; summary: string;
  business: Business; priority: 'High' | 'Medium' | 'Low'; actionRequired: boolean; source: string; url: string;
  mailLabels?: string; listUnsubscribe?: boolean; classificationOverride?: boolean;
}
export interface CloudFile extends RecordMeta {
  name: string; cloud: 'Google Drive' | 'OneDrive' | 'Vendoo Import' | 'Manual'; account: string;
  externalId: string; business: Business; folder: string; folderId?: string; folderPathIds?: string; status: string; url: string; source: string;
}
export interface TrackedApp extends RecordMeta { name: string; version: string; platform: string; status: string; url: string; business: Business }
export interface Todo extends RecordMeta { appId: string | null; text: string; done: boolean; business: Business }
export interface Notification extends RecordMeta { title: string; message: string; business: Business; source: string; read: boolean }
export interface Snapshot { version: 1; exportedAt: string; inventory: Inventory[]; alerts: Alert[]; files: CloudFile[]; apps: TrackedApp[]; todos: Todo[]; notifications: Notification[] }
export interface Connection { id: string; provider: 'google' | 'onedrive'; account: string; lastSync: string | null; error: string | null }
export interface SelectedFolder { id: string; name: string; business: Exclude<Business, 'Dual Business'>; ancestorIds?: string[] }
export interface FolderCandidate { id: string; name: string; path: string }
export interface ConnectorStatus { googleConfigured: boolean; onedriveConfigured: boolean; webhookConfigured: boolean; aiConfigured: boolean; connections: (Connection & { folders: SelectedFolder[] })[]; syncScope: string }
export interface Citation { table: Resource; id: string; label: string }
export interface ChatMessage { role: 'assistant' | 'user'; text: string; mode?: string; citations?: Citation[] }
export interface CsvPreview { items: Inventory[]; rowCount: number; existing: number; withPhotos: number; errors: { row: number; error: string }[] }
export interface WebhookDelivery { id: string; type: string; recordId: string; receivedAt: string }
export interface WebhookStatus { configured: boolean; total: number; deliveries: WebhookDelivery[] }
