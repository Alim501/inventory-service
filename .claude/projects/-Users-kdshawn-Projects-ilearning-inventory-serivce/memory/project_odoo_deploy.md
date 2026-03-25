---
name: odoo_deploy_todo
description: Before deploying Odoo to Railway, hardcoded URL must be changed
type: project
---

URL бэкенда в Odoo-модуле захардкожен для локалки.

**Файл:** `odoo/inventory_connector/models/inventory.py`
**Строка:** `url = 'http://host.docker.internal:3001/api/v1/inventory'`

**Why:** Пользователь сознательно захардкодил для локального тестирования, перед деплоем на Railway нужно заменить на реальный URL.

**How to apply:** Перед деплоем на Railway заменить на реальный URL Railway-бэкенда. Также напомнить что для Railway docker-compose не нужен — деплоить из папки odoo/ через Dockerfile напрямую.
