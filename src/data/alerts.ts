import type { Alert, AlertResponse } from "@/lib/types"
import generated from "./generated/alerts.json"

const base = generated as AlertResponse

export function getAlerts(filters: Record<string, string> = {}): AlertResponse {
  let alerts: Alert[] = base.alerts
  if (filters.severity) alerts = alerts.filter((a) => a.severity === filters.severity)
  if (filters.status) alerts = alerts.filter((a) => a.status === filters.status)
  if (filters.commodity) alerts = alerts.filter((a) => a.commodity === filters.commodity)
  if (filters.region) alerts = alerts.filter((a) => a.region === filters.region)
  return { summary: base.summary, alerts }
}
