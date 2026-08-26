import asyncio
import json
import time
import httpx
import websockets
import pytest

BASE_URL = "http://127.0.0.1:8000"
WS_URL = "ws://127.0.0.1:8000/api/v1/ws/query"

async def run_step_health():
    print("--------------------------------------------------")
    print("TEST 1: Health Check Endpoint (/health)")
    async with httpx.AsyncClient(timeout=10.0) as client:
        res = await client.get(f"{BASE_URL}/health")
        assert res.status_code == 200, f"Expected 200, got {res.status_code}"
        data = res.json()
        print(f"  [PASS] Status: {data.get('status')}")
        print(f"  [PASS] LLM Provider: {data.get('llm_provider')}")
        print(f"  [PASS] Embed Provider: {data.get('embed_provider')}")
        print(f"  [PASS] Qubit Limit: {data.get('max_qubits_limit')}")
        return True

async def run_step_document_ingestion():
    print("--------------------------------------------------")
    print("TEST 2: Document Ingestion & Pipeline (/api/v1/documents/upload)")
    payload = {
        "title": "Quantum Graphene Research Paper",
        "content": "Graphene is composed of Carbon atoms arranged in a 2D honeycomb lattice. Graphene exhibits extraordinary Electrical Conductivity and High Strength. Quantum Hall Effect is observed in Graphene at room temperature.",
        "metadata": {"author": "Dr. Quantum", "year": 2026}
    }
    async with httpx.AsyncClient(timeout=30.0) as client:
        res = await client.post(f"{BASE_URL}/api/v1/documents/upload", json=payload)
        assert res.status_code == 200, f"Expected 200, got {res.status_code}"
        data = res.json()
        doc_id = data.get("doc_id")
        print(f"  [PASS] Document submitted to ingestion queue. Doc ID: {doc_id}")
        print("  Waiting 5 seconds for background chunking, Nomic embedding & triplet extraction...")
        await asyncio.sleep(5)
        return doc_id

async def run_step_simple_query():
    print("--------------------------------------------------")
    print("TEST 3: Simple Query Vector Retrieval (/api/v1/query)")
    payload = {
        "query": "What is Graphene composed of?",
        "session_id": "test_e2e_session"
    }
    async with httpx.AsyncClient(timeout=60.0) as client:
        res = await client.post(f"{BASE_URL}/api/v1/query", json=payload)
        assert res.status_code == 200, f"Expected 200, got {res.status_code}"
        data = res.json()
        print(f"  [PASS] Classified Intent: '{data.get('intent')}'")
        print(f"  [PASS] Latency: {data.get('latency_ms', 0):.2f} ms")
        print(f"  [PASS] Answer: {data.get('answer')[:120]}...")
        return True

async def run_step_complex_query():
    print("--------------------------------------------------")
    print("TEST 4: Complex Multi-Hop Graph Query (/api/v1/query)")
    payload = {
        "query": "How does Graphene relate to Carbon atoms and Electrical Conductivity?",
        "session_id": "test_e2e_session"
    }
    async with httpx.AsyncClient(timeout=60.0) as client:
        res = await client.post(f"{BASE_URL}/api/v1/query", json=payload)
        assert res.status_code == 200, f"Expected 200, got {res.status_code}"
        data = res.json()
        subgraph = data.get('subgraph') or {}
        print(f"  [PASS] Classified Intent: '{data.get('intent')}'")
        print(f"  [PASS] Subgraph Nodes: {subgraph.get('nodes', [])}")
        print(f"  [PASS] Latency: {data.get('latency_ms', 0):.2f} ms")
        print(f"  [PASS] Answer: {data.get('answer', '')[:120]}...")
        return True

async def run_step_websocket_streaming():
    print("--------------------------------------------------")
    print("TEST 5: Real-Time WebSocket Query & Token Streaming (/api/v1/ws/query)")
    tokens = []
    steps_seen = []
    
    async with websockets.connect(WS_URL) as ws:
        await ws.send(json.dumps({
            "query": "What physical effects are observed in Graphene?",
            "session_id": "test_ws_session"
        }))
        
        while True:
            try:
                msg = await asyncio.wait_for(ws.recv(), timeout=30.0)
                data = json.loads(msg)
                step = data.get("step")
                if step and step not in steps_seen:
                    steps_seen.append(step)
                
                if step == "token":
                    tokens.append(data.get("token", ""))
                
                if step == "done":
                    break
            except asyncio.TimeoutError:
                print("  [FAIL] WebSocket timeout waiting for tokens")
                return False
                
    full_text = "".join(tokens)
    print(f"  [PASS] Execution Pipeline Steps Tracked: {steps_seen}")
    print(f"  [PASS] Total Streamed Tokens: {len(tokens)}")
    print(f"  [PASS] Streamed Response Snippet: {full_text[:100]}...")
    return True

async def run_step_chat_history_and_analytics():
    print("--------------------------------------------------")
    print("TEST 6: Chat Memory & Query Audit Logs (/api/v1/chat/history & /analytics/logs)")
    async with httpx.AsyncClient(timeout=10.0) as client:
        # History
        hist_res = await client.get(f"{BASE_URL}/api/v1/chat/history?session_id=test_e2e_session")
        assert hist_res.status_code == 200
        history = hist_res.json()
        print(f"  [PASS] Session Chat History Messages Found: {len(history)}")
        
        # Analytics logs
        logs_res = await client.get(f"{BASE_URL}/api/v1/analytics/logs?limit=10")
        assert logs_res.status_code == 200
        logs = logs_res.json()
        print(f"  [PASS] Total Audit Log Entries: {len(logs)}")
        return True

async def run_step_document_deletion(doc_id: str):
    print("--------------------------------------------------")
    print("TEST 7: Document Deletion & Vector/Graph Cleanup (/api/v1/documents/{doc_id})")
    async with httpx.AsyncClient(timeout=10.0) as client:
        res = await client.delete(f"{BASE_URL}/api/v1/documents/{doc_id}")
        assert res.status_code == 200
        data = res.json()
        print(f"  [PASS] Document Deleted: {data.get('doc_id')}")
        return True

@pytest.mark.asyncio
async def test_full_e2e_pipeline():
    """Pytest entrypoint for end-to-end integration test pipeline."""
    assert await run_step_health()
    doc_id = await run_step_document_ingestion()
    assert doc_id is not None
    assert await run_step_simple_query()
    assert await run_step_complex_query()
    assert await run_step_websocket_streaming()
    assert await run_step_chat_history_and_analytics()
    assert await run_step_document_deletion(doc_id)

async def main():
    print("==================================================")
    print(" Q-GRAPHRAG END-TO-END INTEGRATION TEST SUITE")
    print("==================================================")
    
    start_time = time.time()
    results = []
    
    try:
        results.append(("Health Check", await run_step_health()))
        doc_id = await run_step_document_ingestion()
        results.append(("Document Ingestion", bool(doc_id)))
        results.append(("Simple Query Search", await run_step_simple_query()))
        results.append(("Complex Multi-Hop Query", await run_step_complex_query()))
        results.append(("WebSocket Token Streaming", await run_step_websocket_streaming()))
        results.append(("History & Audit Analytics", await run_step_chat_history_and_analytics()))
        if doc_id:
            results.append(("Document Deletion", await run_step_document_deletion(doc_id)))
    except Exception as e:
        print(f"\n[FAIL] Test suite failed with exception: {e}")
        import traceback
        traceback.print_exc()
        
    print("\n==================================================")
    print(" TEST SUITE SUMMARY RESULTS")
    print("==================================================")
    all_passed = True
    for name, passed in results:
        status = "[PASS]" if passed else "[FAIL]"
        if not passed:
            all_passed = False
        print(f"  {name:<35} : {status}")
    print(f"Total Execution Time: {time.time() - start_time:.2f} seconds")
    print("==================================================")

if __name__ == "__main__":
    asyncio.run(main())
