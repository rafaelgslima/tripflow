# TripFlow API

Python FastAPI backend for TripFlow.

## Setup

```bash
# Create and activate virtual environment
python3 -m venv .venv
source .venv/bin/activate

# Install dependencies
pip install -e ".[dev]"

# Copy and fill in environment variables
cp .env.example .env
```

## Running

```bash
# Development server (with auto-reload)
fastapi dev app/main.py

# Production
fastapi run app/main.py
```

## Testing

```bash
pytest
```

## Project Structure

```
app/
├── main.py              # FastAPI application factory
├── config.py            # Settings (pydantic-settings)
├── dependencies.py      # Shared FastAPI dependencies (auth, db)
├── exceptions.py        # Custom exception classes
├── routers/
│   └── travel_plans.py  # Travel plans endpoints
├── services/
│   └── travel_plans.py  # Business logic
├── repositories/
│   └── travel_plans.py  # Database access
└── schemas/
    ├── common.py        # Shared Pydantic schemas (pagination, errors)
    └── travel_plans.py  # Travel plan request/response schemas
tests/
├── conftest.py          # Shared fixtures
└── routers/
    └── test_travel_plans.py
```
