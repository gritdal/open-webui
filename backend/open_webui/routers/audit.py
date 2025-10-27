import os
import httpx
from fastapi import APIRouter, HTTPException

router = APIRouter()

ENFORCER = os.getenv("POLICY_ENFORCER_URL", "http://policy_enforcer:8181").rstrip("/")

@router.get("/decision-logs")
async def decision_logs():
    url = f"{ENFORCER}/decision_logs"
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            r = await client.get(url, headers={"accept": "application/json"})
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Failed to reach policy enforcer: {e}")

    if r.status_code != 200:
        raise HTTPException(status_code=r.status_code, detail=r.text)

    data = r.json()
    items = data if isinstance(data, list) else [data]
    items = [x for x in items if isinstance(x, dict) and x]  # drop null/empty

    mapped = []
    for x in items:
        is_allow = bool(x.get("allow"))
        result_str = "allow" if is_allow else "block"
        mapped.append({
            "timestamp": x.get("timestamp"),
            "path": f"guarddecision/{result_str}",
            "result": result_str,
            "input": x.get("input"),
        })

    return mapped
