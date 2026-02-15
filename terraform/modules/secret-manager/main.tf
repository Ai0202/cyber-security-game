resource "google_secret_manager_secret" "secrets" {
  for_each = toset(var.secret_names)

  secret_id = each.value

  replication {
    auto {}
  }

  labels = var.labels
}

resource "google_secret_manager_secret_version" "versions" {
  for_each = toset(var.secret_names)

  secret      = google_secret_manager_secret.secrets[each.value].id
  secret_data = var.secret_values[each.value]
}
