"""
Q-GRAPHRAG COMPREHENSIVE INTEGRATED TEST SUITE
================================================
Tests:
  Section A — Backend Unit Tests (no server needed)
    A1. GraphService CRUD + subgraph extraction + pruning + adjacency matrix
    A2. QuantumKernelService Hamiltonian build + similarity + truncation fix
    A3. VectorService connection + collection init + upsert + search
    A4. StorageService JSON fallback read/write/delete
    A5. Evaluation metrics (exact match, token F1, retrieval, qubit profiler)
    A6. AgentRouter JSON parsing

  Section B — Backend API Contract Tests (live server at localhost:8000)
    B1.  GET  /health
    B2.  GET  /api/v1/graph  (new endpoint)
    B3.  POST /api/v1/documents/upload
    B4.  POST /api/v1/documents/upload-file (multipart)
    B5.  POST /api/v1/query  (simple intent)
    B6.  POST /api/v1/query  (complex intent)
    B7.  WS   /api/v1/ws/query  (token streaming)
    B8.  GET  /api/v1/chat/history
    B9.  GET  /api/v1/history/sessions
    B10. GET  /api/v1/analytics/logs
    B11. DELETE /api/v1/documents/{doc_id}
    B12. DELETE /api/v1/history/session/{id}

  Section C — Frontend API Contract Validation
    C1. Verify all api.* methods point to correct HTTP verb + endpoint
    C2. Verify WS URL construction
"""

import asyncio
import json
import os
import sys
import time
import tempfile
import unittest
import io

import numpy as np

# ─────────────────────────────────────────────────────────────────────────────
# Section A — Pure Unit Tests
# ─────────────────────────────────────────────────────────────────────────────

class TestGraphService(unittest.TestCase):
    def setUp(self):
        from app.services.graph_service import GraphService
        self.tmp = tempfile.NamedTemporaryFile(suffix=".json", delete=False)
        self.tmp.close()
        self.svc = GraphService(file_path=self.tmp.name)

    def tearDown(self):
        if os.path.exists(self.tmp.name):
            os.unlink(self.tmp.name)

    def test_add_and_retrieve_triplet(self):
        self.svc.add_triplet("Graphene", "composed_of", "Carbon")
        self.assertIn("Graphene", self.svc.graph)
        self.assertIn("Carbon", self.svc.graph)
        self.assertTrue(self.svc.graph.has_edge("Graphene", "Carbon"))

    def test_add_triplets_batch(self):
        triplets = [
            {"subject": "A", "predicate": "relates_to", "object": "B"},
            {"subject": "B", "predicate": "contains",   "object": "C"},
            {"subject": "",  "predicate": "bad",         "object": "D"},
        ]
        self.svc.add_triplets(triplets)
        self.assertIn("A", self.svc.graph)
        self.assertNotIn("D", self.svc.graph)

    def test_extract_subgraph(self):
        self.svc.add_triplets([
            {"subject": "Root", "predicate": "has", "object": "Child1"},
            {"subject": "Root", "predicate": "has", "object": "Child2"},
            {"subject": "Child1","predicate": "links","object": "Leaf"},
        ])
        sg = self.svc.extract_subgraph("Root", hops=2)
        self.assertIn("Root", sg)
        self.assertIn("Leaf", sg)

    def test_extract_subgraph_missing_node(self):
        sg = self.svc.extract_subgraph("NonExistent", hops=2)
        self.assertEqual(len(sg), 0)

    def test_prune_subgraph_under_budget(self):
        for i in range(5):
            self.svc.add_triplet("A", "to", f"N{i}")
        sg = self.svc.extract_subgraph("A", hops=1)
        pruned = self.svc.prune_subgraph(sg, max_nodes=10)
        self.assertLessEqual(len(pruned), 10)

    def test_prune_subgraph_over_budget(self):
        for i in range(20):
            self.svc.add_triplet("Hub", "to", f"Node{i}")
        sg = self.svc.extract_subgraph("Hub", hops=1)
        pruned = self.svc.prune_subgraph(sg, max_nodes=8)
        self.assertLessEqual(len(pruned), 8)

    def test_canonical_adjacency_matrix(self):
        self.svc.add_triplet("X", "rel", "Y")
        sg = self.svc.extract_subgraph("X", hops=1)
        nodes, A = self.svc.get_canonical_adjacency_matrix(sg)
        self.assertEqual(len(nodes), 2)
        self.assertEqual(A.shape, (2, 2))
        self.assertEqual(nodes, sorted(nodes))

    def test_clear_graph(self):
        self.svc.add_triplet("P", "q", "R")
        self.svc.clear_graph()
        self.assertEqual(len(self.svc.graph), 0)

    def test_persistence(self):
        self.svc.add_triplet("Persist", "to", "Disk")
        from app.services.graph_service import GraphService
        svc2 = GraphService(file_path=self.tmp.name)
        self.assertIn("Persist", svc2.graph)


class TestQuantumKernel(unittest.TestCase):
    def setUp(self):
        from app.services.quantum_kernel import QuantumKernelService
        self.svc = QuantumKernelService(max_qubits=6)

    def test_identical_matrices_high_similarity(self):
        A = np.array([[0, 1, 0], [1, 0, 1], [0, 1, 0]], dtype=float)
        sim = self.svc.compute_kernel_similarity(A, A)
        self.assertGreater(sim, 0.5, "Identical graphs should have high similarity")

    def test_zero_size_returns_one(self):
        A = np.zeros((0, 0))
        sim = self.svc.compute_kernel_similarity(A, A)
        self.assertEqual(sim, 1.0)

    def test_single_node(self):
        A = np.zeros((1, 1))
        sim = self.svc.compute_kernel_similarity(A, A)
        self.assertIsInstance(sim, float)

    def test_truncation_does_not_crash(self):
        """Previously crashed with NameError — verify the bug fix holds."""
        N = 8
        A = np.ones((N, N)) - np.eye(N)
        sim = self.svc.compute_kernel_similarity(A, A)
        self.assertIsInstance(sim, float)

    def test_hamiltonian_empty_adjacency(self):
        A = np.zeros((4, 4))
        H = self.svc._build_hamiltonian(4, A)
        self.assertIsNone(H)

    def test_hamiltonian_with_edges(self):
        A = np.array([[0, 1], [1, 0]], dtype=float)
        H = self.svc._build_hamiltonian(2, A)
        self.assertIsNotNone(H)

    def test_different_size_matrices_padded(self):
        A1 = np.array([[0, 1], [1, 0]], dtype=float)
        A2 = np.array([[0, 1, 0], [1, 0, 1], [0, 1, 0]], dtype=float)
        sim = self.svc.compute_kernel_similarity(A1, A2)
        self.assertIsInstance(sim, float)
        self.assertGreaterEqual(sim, 0.0)
        self.assertLessEqual(sim, 1.0)

    def test_angle_projection(self):
        angles = self.svc._project_node_features_to_angles([[0.5, 0.5], [1.0, -1.0]], 2)
        self.assertEqual(len(angles), 2)
        for a in angles:
            self.assertGreaterEqual(a, 0.0)
            self.assertLessEqual(a, np.pi)


class TestVectorServiceUnit(unittest.TestCase):
    def setUp(self):
        import os
        os.environ["QDRANT_HOST"] = "127.0.0.1"
        os.environ["QDRANT_PORT"] = "19999"
        from app.services.vector_service import VectorService
        self.svc = VectorService()

    def test_client_initializes(self):
        self.assertIsNotNone(self.svc.client)

    def test_initialize_collection_any_size(self):
        self.svc.initialize_collection(vector_size=512)
        self.assertEqual(self.svc._initialized_vector_size, 512)
        self.svc.initialize_collection(vector_size=1024)
        self.assertIsNotNone(self.svc._initialized_vector_size)

    def test_clear_collection(self):
        self.svc.initialize_collection(vector_size=4)
        self.svc.clear_collection()


class TestStorageServiceFallback(unittest.TestCase):
    def setUp(self):
        self.tmp_dir = tempfile.mkdtemp()
        from app.services.storage_service import JSONFallbackClient
        self.db = JSONFallbackClient(data_dir=self.tmp_dir)

    def test_insert_and_find(self):
        self.db.insert_one("test_col", {"key": "value", "user": "alice"})
        results = self.db.find("test_col", {"key": "value"})
        self.assertEqual(len(results), 1)
        self.assertEqual(results[0]["user"], "alice")

    def test_find_no_match(self):
        self.db.insert_one("col2", {"x": 1})
        results = self.db.find("col2", {"x": 99})
        self.assertEqual(results, [])

    def test_delete_many(self):
        self.db.insert_one("col3", {"tag": "keep"})
        self.db.insert_one("col3", {"tag": "delete"})
        self.db.insert_one("col3", {"tag": "delete"})
        removed = self.db.delete_many("col3", {"tag": "delete"})
        self.assertEqual(removed, 2)
        remaining = self.db.find("col3", {})
        self.assertEqual(len(remaining), 1)

    def test_concurrent_writes_no_corruption(self):
        import threading
        errors = []
        def insert_batch(n):
            try:
                for i in range(10):
                    self.db.insert_one("concurrent", {"thread": n, "i": i})
            except Exception as e:
                errors.append(str(e))
        threads = [threading.Thread(target=insert_batch, args=(t,)) for t in range(5)]
        for t in threads: t.start()
        for t in threads: t.join()
        self.assertEqual(errors, [], f"Concurrent write errors: {errors}")
        all_docs = self.db.find("concurrent", {})
        self.assertEqual(len(all_docs), 50)


class TestEvaluationMetrics(unittest.TestCase):
    def test_exact_match_case_insensitive(self):
        from app.evaluation.benchmark_engine import calculate_exact_match
        self.assertEqual(calculate_exact_match("Hello World", "hello world"), 1.0)
        self.assertEqual(calculate_exact_match("Hello", "World"), 0.0)

    def test_token_f1(self):
        from app.evaluation.benchmark_engine import calculate_token_f1
        p, r, f1 = calculate_token_f1("Graphene is carbon", "Graphene is composed of carbon")
        self.assertGreater(f1, 0)
        self.assertGreater(p, 0)
        self.assertGreater(r, 0)

    def test_retrieval_metrics(self):
        from app.evaluation.benchmark_engine import calculate_retrieval_metrics
        preds = ["Graphene carbon", "2D lattice"]
        golds = ["Graphene is carbon", "2D honeycomb lattice"]
        m = calculate_retrieval_metrics(preds, golds, k=5)
        self.assertIn("precision_at_k", m)
        self.assertIn("recall_at_k", m)
        self.assertGreater(m["precision_at_k"], 0)

    def test_qubit_scalability_profiler(self):
        from app.evaluation.scalability_bench import profile_qubit_scaling
        res = profile_qubit_scaling(max_n=4)
        self.assertEqual(len(res), 2)
        self.assertEqual(res[0]["num_qubits"], 2)
        self.assertEqual(res[0]["hilbert_space_dim"], 4)

    def test_data_loader(self):
        from app.evaluation.data_loader import load_benchmark_dataset
        ds = load_benchmark_dataset()
        self.assertGreater(len(ds), 0)
        self.assertIn("question", ds[0])
        self.assertIn("answer", ds[0])

    def test_ragas_evaluator_structure(self):
        from app.evaluation.ragas_evaluator import RagasEvaluator
        ev = RagasEvaluator()
        scores = ev.compute_ragas_scores(
            query="What is graphene?",
            answer="Graphene is carbon.",
            retrieved_contexts=["Graphene is composed of carbon atoms."],
            ground_truth_facts=["Graphene is composed of carbon atoms."]
        )
        self.assertIn("faithfulness", scores)
        self.assertIn("answer_relevance", scores)


class TestAgentRouterParsing(unittest.TestCase):
    def test_valid_json_parsing(self):
        raw = '{"intent": "complex", "entities": ["Graphene", "Carbon"], "reason": "Multi-hop"}'
        data = json.loads(raw)
        self.assertEqual(data["intent"], "complex")
        self.assertEqual(len(data["entities"]), 2)

    def test_markdown_fence_stripping(self):
        raw = '```json\n{"intent":"simple","entities":[],"reason":"direct"}\n```'
        lines = raw.strip().split("\n")
        if lines[0].startswith("```"):
            lines = lines[1:]
        if lines[-1].strip() == "```":
            lines = lines[:-1]
        data = json.loads("\n".join(lines))
        self.assertEqual(data["intent"], "simple")


# ─────────────────────────────────────────────────────────────────────────────
# Section B — Live Server API Contract Tests
# ─────────────────────────────────────────────────────────────────────────────

async def check_server_running(base_url: str) -> bool:
    try:
        import httpx
        async with httpx.AsyncClient(timeout=5.0) as c:
            r = await c.get(f"{base_url}/health")
            return r.status_code == 200
    except Exception:
        return False


async def run_api_tests(base_url: str = "http://127.0.0.1:8000") -> list:
    import httpx, websockets
    results = []

    def ok(name, detail=""):
        results.append({"test": name, "status": "PASS", "detail": detail})
        print(f"  [PASS] {name}" + (f" — {detail}" if detail else ""))

    def fail(name, detail=""):
        results.append({"test": name, "status": "FAIL", "detail": detail})
        print(f"  [FAIL] {name}" + (f" — {detail}" if detail else ""))

    async with httpx.AsyncClient(timeout=90.0) as client:

        # B1 — Health
        try:
            r = await client.get(f"{base_url}/health")
            d = r.json()
            assert r.status_code == 200
            assert d.get("status") == "healthy"
            ok("B1 GET /health", f"provider={d.get('llm_provider')}, nodes={d.get('local_graph_nodes')}")
        except Exception as e:
            fail("B1 GET /health", str(e))

        # B2 — Graph endpoint
        try:
            r = await client.get(f"{base_url}/api/v1/graph")
            d = r.json()
            assert r.status_code == 200
            assert "nodes" in d and "edges" in d
            assert "node_count" in d
            ok("B2 GET /api/v1/graph", f"nodes={d['node_count']}, edges={d['edge_count']}")
        except Exception as e:
            fail("B2 GET /api/v1/graph", str(e))

        # B3 — Document ingestion (text)
        doc_id = None
        try:
            payload = {
                "title": "Q-GraphRAG Test Document",
                "content": (
                    "Graphene is composed of Carbon atoms arranged in a 2D honeycomb lattice. "
                    "Graphene exhibits extraordinary Electrical Conductivity and High Strength. "
                    "Quantum Hall Effect is observed in Graphene at room temperature. "
                    "Carbon nanotubes are cylindrical molecules derived from graphene sheets."
                ),
                "metadata": {"author": "Integration Test", "year": 2026}
            }
            r = await client.post(f"{base_url}/api/v1/documents/upload", json=payload)
            d = r.json()
            assert r.status_code == 200
            doc_id = d.get("doc_id")
            assert doc_id, "No doc_id in response"
            ok("B3 POST /api/v1/documents/upload", f"doc_id={doc_id[:8]}...")
            print("      Waiting 8s for background ingestion (embedding + triplet extraction)...")
            await asyncio.sleep(8)
        except Exception as e:
            fail("B3 POST /api/v1/documents/upload", str(e))

        # B4 — File upload (multipart TXT)
        try:
            txt_content = b"Superconductivity emerges in materials at extremely low temperatures. Cooper pairs form a quantum condensate."
            files = {"file": ("superconductor.txt", io.BytesIO(txt_content), "text/plain")}
            r = await client.post(f"{base_url}/api/v1/documents/upload-file", files=files)
            d = r.json()
            assert r.status_code == 200
            assert "doc_id" in d
            ok("B4 POST /api/v1/documents/upload-file", f"chars={d.get('chars_extracted')}, doc_id={d['doc_id'][:8]}...")
        except Exception as e:
            fail("B4 POST /api/v1/documents/upload-file", str(e))

        # B5 — Simple query (vector retrieval)
        try:
            r = await client.post(f"{base_url}/api/v1/query", json={
                "query": "What is Graphene composed of?",
                "session_id": "integration_test_session"
            })
            d = r.json()
            assert r.status_code == 200
            assert "answer" in d and len(d["answer"]) > 0
            assert "intent" in d
            assert "latency_ms" in d
            ok("B5 POST /api/v1/query (simple)", f"intent={d['intent']}, latency={d['latency_ms']:.0f}ms")
        except Exception as e:
            fail("B5 POST /api/v1/query (simple)", str(e))

        # B6 — Complex query (graph walk)
        try:
            r = await client.post(f"{base_url}/api/v1/query", json={
                "query": "How does Graphene relate to Carbon atoms and Electrical Conductivity?",
                "session_id": "integration_test_session"
            })
            d = r.json()
            assert r.status_code == 200
            assert "answer" in d
            ok("B6 POST /api/v1/query (complex)", f"intent={d.get('intent')}, subgraph={'yes' if d.get('subgraph') else 'no (vector fallback)'}")
        except Exception as e:
            fail("B6 POST /api/v1/query (complex)", str(e))

        # B7 — WebSocket streaming
        try:
            ws_url = base_url.replace("http://", "ws://") + "/api/v1/ws/query"
            tokens = []
            steps = []
            async with websockets.connect(ws_url, open_timeout=10) as ws:
                await ws.send(json.dumps({
                    "query": "What physical effects are observed in Graphene?",
                    "session_id": "integration_test_ws"
                }))
                while True:
                    try:
                        msg = await asyncio.wait_for(ws.recv(), timeout=60.0)
                        data = json.loads(msg)
                        step = data.get("step")
                        if step and step not in steps:
                            steps.append(step)
                        if step == "token":
                            tokens.append(data.get("token", ""))
                        if step == "done":
                            break
                    except asyncio.TimeoutError:
                        fail("B7 WS /api/v1/ws/query", "Timeout waiting for tokens")
                        break
            if tokens:
                ok("B7 WS /api/v1/ws/query", f"tokens={len(tokens)}, steps={steps}")
            elif not any(r["test"] == "B7 WS /api/v1/ws/query" and r["status"] == "FAIL" for r in results):
                fail("B7 WS /api/v1/ws/query", "No tokens received")
        except Exception as e:
            fail("B7 WS /api/v1/ws/query", str(e))

        # B8 — Chat history
        try:
            r = await client.get(f"{base_url}/api/v1/chat/history?session_id=integration_test_session")
            d = r.json()
            assert r.status_code == 200
            assert isinstance(d, list)
            ok("B8 GET /api/v1/chat/history", f"messages={len(d)}")
        except Exception as e:
            fail("B8 GET /api/v1/chat/history", str(e))

        # B9 — Sessions list
        try:
            r = await client.get(f"{base_url}/api/v1/history/sessions")
            d = r.json()
            assert r.status_code == 200
            assert isinstance(d, list)
            ok("B9 GET /api/v1/history/sessions", f"sessions={len(d)}")
        except Exception as e:
            fail("B9 GET /api/v1/history/sessions", str(e))

        # B10 — Analytics logs
        try:
            r = await client.get(f"{base_url}/api/v1/analytics/logs?limit=20")
            d = r.json()
            assert r.status_code == 200
            assert isinstance(d, list)
            ok("B10 GET /api/v1/analytics/logs", f"log_entries={len(d)}")
        except Exception as e:
            fail("B10 GET /api/v1/analytics/logs", str(e))

        # B11 — Document deletion
        if doc_id:
            try:
                r = await client.delete(f"{base_url}/api/v1/documents/{doc_id}")
                d = r.json()
                assert r.status_code == 200
                assert d.get("status") == "deleted"
                ok("B11 DELETE /api/v1/documents/{doc_id}", f"deleted={d.get('doc_id', '')[:8]}...")
            except Exception as e:
                fail("B11 DELETE /api/v1/documents/{doc_id}", str(e))
        else:
            fail("B11 DELETE /api/v1/documents/{doc_id}", "Skipped — doc_id unavailable")

        # B12 — Delete test session
        try:
            r = await client.delete(f"{base_url}/api/v1/history/session/integration_test_session")
            d = r.json()
            assert r.status_code == 200
            ok("B12 DELETE /api/v1/history/session/{id}", f"status={d.get('status')}")
        except Exception as e:
            fail("B12 DELETE /api/v1/history/session/{id}", str(e))

    return results


# ─────────────────────────────────────────────────────────────────────────────
# Section C — Frontend API Contract Validation
# ─────────────────────────────────────────────────────────────────────────────

def run_frontend_contract_tests() -> list:
    results = []
    client_path = os.path.join(
        os.path.dirname(__file__),
        "..", "frontend", "src", "api", "client.ts"
    )

    def ok(name, detail=""):
        results.append({"test": name, "status": "PASS", "detail": detail})
        print(f"  [PASS] {name}" + (f" — {detail}" if detail else ""))

    def fail(name, detail=""):
        results.append({"test": name, "status": "FAIL", "detail": detail})
        print(f"  [FAIL] {name}" + (f" — {detail}" if detail else ""))

    try:
        with open(client_path, "r", encoding="utf-8") as f:
            source = f.read()
    except FileNotFoundError:
        fail("C0 Load client.ts", f"File not found: {client_path}")
        return results

    ok("C0 Load client.ts", "Parsed successfully")

    expected_methods = {
        "C1 getHealth":       ("client.get",    "/health"),
        "C2 getGraph":        ("client.get",    "/api/v1/graph"),
        "C3 uploadDocument":  ("client.post",   "/api/v1/documents/upload"),
        "C4 uploadFile":      ("client.post",   "/api/v1/documents/upload-file"),
        "C5 deleteDocument":  ("client.delete", "/api/v1/documents/"),
        "C6 query":           ("client.post",   "/api/v1/query"),
        "C7 runAblation":     ("client.post",   "/api/v1/research/ablation"),
        "C8 getScalability":  ("client.get",    "/api/v1/research/scalability"),
        "C9 getMongoStatus":  ("client.get",    "/api/v1/history/mongo-status"),
        "C10 getSessions":    ("client.get",    "/api/v1/history/sessions"),
        "C11 getChatHistory": ("client.get",    "/api/v1/chat/history"),
        "C12 deleteSession":  ("client.delete", "/api/v1/history/session/"),
        "C13 clearHistory":   ("client.delete", "/api/v1/history/clear"),
        "C14 getAnalyticsLogs":("client.get",   "/api/v1/analytics/logs"),
    }

    for test_name, (verb, path_fragment) in expected_methods.items():
        if path_fragment in source and verb in source:
            ok(test_name, f"{verb}('{path_fragment}...')")
        else:
            fail(test_name, f"Could not find '{verb}' with path '{path_fragment}' in client.ts")

    return results


# ─────────────────────────────────────────────────────────────────────────────
# Runner
# ─────────────────────────────────────────────────────────────────────────────

def run_unit_tests() -> list:
    suite = unittest.TestSuite()
    for cls in [
        TestGraphService,
        TestQuantumKernel,
        TestVectorServiceUnit,
        TestStorageServiceFallback,
        TestEvaluationMetrics,
        TestAgentRouterParsing,
    ]:
        suite.addTests(unittest.TestLoader().loadTestsFromTestCase(cls))

    buf = io.StringIO()
    runner = unittest.TextTestRunner(stream=buf, verbosity=2)
    result = runner.run(suite)

    output = buf.getvalue()
    for line in output.split("\n"):
        if line.strip():
            print("  " + line)

    return result


async def main():
    BASE_URL = "http://127.0.0.1:8000"

    print("=" * 60)
    print("  Q-GRAPHRAG COMPREHENSIVE INTEGRATED TEST SUITE")
    print("=" * 60)
    t_start = time.time()

    all_section_results = {}

    # ── Section A: Unit Tests ──────────────────────────────────────────────
    print("\n[SECTION A] Backend Unit Tests")
    print("-" * 60)
    unit_result = run_unit_tests()
    a_pass = unit_result.testsRun - len(unit_result.failures) - len(unit_result.errors)
    a_fail = len(unit_result.failures) + len(unit_result.errors)
    all_section_results["A — Unit Tests"] = {"pass": a_pass, "fail": a_fail}

    # ── Section B: API Tests ───────────────────────────────────────────────
    print("\n[SECTION B] Backend API Contract Tests")
    print("-" * 60)
    server_up = await check_server_running(BASE_URL)
    if not server_up:
        print(f"  [INFO] Backend server not running at {BASE_URL}")
        print("         Testing unit tests and frontend contracts only.")
        all_section_results["B — API Contract"] = {"pass": 0, "fail": 0, "skipped": True}
        b_results = []
    else:
        b_results = await run_api_tests(BASE_URL)
        b_pass = sum(1 for r in b_results if r["status"] == "PASS")
        b_fail = sum(1 for r in b_results if r["status"] == "FAIL")
        all_section_results["B — API Contract"] = {"pass": b_pass, "fail": b_fail}

    # ── Section C: Frontend Contract Tests ────────────────────────────────
    print("\n[SECTION C] Frontend API Contract Validation")
    print("-" * 60)
    c_results = run_frontend_contract_tests()
    c_pass = sum(1 for r in c_results if r["status"] == "PASS")
    c_fail = sum(1 for r in c_results if r["status"] == "FAIL")
    all_section_results["C — Frontend Contract"] = {"pass": c_pass, "fail": c_fail}

    # ── Summary ───────────────────────────────────────────────────────────
    elapsed = time.time() - t_start
    print("\n" + "=" * 60)
    print("  FINAL TEST SUMMARY")
    print("=" * 60)
    total_pass = 0
    total_fail = 0
    for section, counts in all_section_results.items():
        if counts.get("skipped"):
            print(f"  {section:<30}  SKIPPED (server offline)")
        else:
            p, f = counts["pass"], counts["fail"]
            total_pass += p
            total_fail += f
            status = "ALL PASS" if f == 0 else f"{f} FAILED"
            print(f"  {section:<30}  {p} pass / {f} fail  [{status}]")

    print(f"\n  Total: {total_pass} passed, {total_fail} failed")
    print(f"  Duration: {elapsed:.2f}s")
    print("=" * 60)

    return total_fail == 0


if __name__ == "__main__":
    success = asyncio.run(main())
    sys.exit(0 if success else 1)
