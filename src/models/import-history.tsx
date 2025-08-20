export type ImportHistory = {
  id: string
  status: "READY" | "COMPLETED" | "FAILED"
  fileUrl: string
  createdAt: string
}
