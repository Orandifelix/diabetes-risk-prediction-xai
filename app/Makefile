.PHONY: dev api web install lint test docker-up docker-down

# ── Development ───────────────────────────────────────────────
dev:
	@echo "Starting full stack..."
	@cd apps/api && uvicorn app.main:app --reload --port 8000 &
	@cd apps/web && yarn dev

api:
	cd apps/api && uvicorn app.main:app --reload --port 8000

web:
	cd apps/web && yarn dev

# ── Install ───────────────────────────────────────────────────
install:
	cd apps/web && yarn install
	cd apps/api && pip install -r requirements.txt

# ── Lint ──────────────────────────────────────────────────────
lint:
	cd apps/web && yarn lint
	cd apps/api && ruff check .

# ── Test ──────────────────────────────────────────────────────
test:
	cd apps/api && pytest tests/ -v

# ── Docker ────────────────────────────────────────────────────
docker-up:
	docker-compose -f apps/docker-compose.yml up -d

docker-down:
	docker-compose -f apps/docker-compose.yml down
