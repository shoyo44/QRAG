import os
import json
import networkx as nx
import numpy as np
from readerwriterlock import rwlock
from typing import List, Dict, Tuple, Optional
from app.core.config import settings

class GraphService:
    def __init__(self, file_path: Optional[str] = None):
        self.file_path = file_path or settings.GRAPH_STORE_PATH
        self.lock = rwlock.RWLockFair()
        self.graph = self._load_graph()

    def _load_graph(self) -> nx.MultiDiGraph:
        if os.path.exists(self.file_path):
            try:
                with open(self.file_path, "r", encoding="utf-8") as f:
                    data = json.load(f)
                    # Pass multigraph=True and directed=True to correctly restore MultiDiGraph
                    return nx.node_link_graph(data, multigraph=True, directed=True)
            except Exception:
                # Fallback to empty graph on parse failure
                return nx.MultiDiGraph()
        return nx.MultiDiGraph()

    def _save_graph(self):
        # Ensure parent directory exists
        dir_name = os.path.dirname(self.file_path)
        if dir_name:
            os.makedirs(dir_name, exist_ok=True)
            
        with open(self.file_path, "w", encoding="utf-8") as f:
            # networkx provides node_link_data to serialize to JSON-compatible dict
            data = nx.node_link_data(self.graph)
            json.dump(data, f, ensure_ascii=False, indent=2)

    def add_triplet(self, subject: str, predicate: str, obj: str, metadata: Optional[Dict] = None):
        """Adds nodes and relationship edges thread-safely."""
        meta = metadata or {}
        with self.lock.gen_wlock():
            # Add nodes if they don't exist
            if not self.graph.has_node(subject):
                self.graph.add_node(subject, name=subject, type="Entity")
            if not self.graph.has_node(obj):
                self.graph.add_node(obj, name=obj, type="Entity")
                
            # Add directed edge with predicate relationship name
            self.graph.add_edge(subject, obj, relation=predicate, **meta)
            self._save_graph()

    def add_triplets(self, triplets: List[Dict[str, str]], metadata: Optional[Dict] = None):
        """Adds a list of triplets thread-safely in a single write operation."""
        meta = metadata or {}
        with self.lock.gen_wlock():
            for trip in triplets:
                sub = trip.get("subject", "").strip()
                pred = trip.get("predicate", "").strip()
                obj = trip.get("object", "").strip()
                
                if not sub or not obj or not pred:
                    continue
                
                if not self.graph.has_node(sub):
                    self.graph.add_node(sub, name=sub, type="Entity")
                if not self.graph.has_node(obj):
                    self.graph.add_node(obj, name=obj, type="Entity")
                    
                self.graph.add_edge(sub, obj, relation=pred, **meta)
            self._save_graph()

    def extract_subgraph(self, center_node: str, hops: int = 3) -> nx.MultiDiGraph:
        """Extracts N-hop subgraph centered around a specific entity."""
        with self.lock.gen_rlock():
            if not self.graph.has_node(center_node):
                return nx.MultiDiGraph()
            
            # Find all nodes within N hops
            nodes = list(nx.single_source_shortest_path_length(self.graph, center_node, cutoff=hops).keys())
            return self.graph.subgraph(nodes).copy()

    def prune_subgraph(self, subgraph: nx.MultiDiGraph, max_nodes: int = 12) -> nx.MultiDiGraph:
        """Filters nodes in the subgraph to keep the size within the qubit budget.
        Re-establishes connectivity using original paths if pruning creates multiple partitions.
        """
        if len(subgraph) == 0:
            return subgraph
            
        if len(subgraph) <= max_nodes:
            return subgraph

        # Compute PageRank on undirected version of subgraph to score node importance
        undirected_sub = subgraph.to_undirected()
        pagerank = nx.pagerank(undirected_sub)
        
        # Sort nodes by PageRank score
        sorted_nodes = sorted(pagerank.items(), key=lambda x: x[1], reverse=True)
        retained_nodes = [node for node, score in sorted_nodes[:max_nodes]]
        
        # Create pruned subgraph view
        pruned = subgraph.subgraph(retained_nodes).copy()
        
        # Ensure graph remains connected. If disconnected, add path edges from the original subgraph.
        # Check weekly connectivity
        components = list(nx.weakly_connected_components(pruned))
        if len(components) > 1:
            base_node = list(components[0])[0]
            for comp in components[1:]:
                target_node = list(comp)[0]
                try:
                    # Find path in the original subgraph
                    path = nx.shortest_path(subgraph, source=base_node, target=target_node)
                    # Add path nodes and edges back into pruned graph
                    for i in range(len(path) - 1):
                        u, v = path[i], path[i+1]
                        if not pruned.has_node(u):
                            pruned.add_node(u, **subgraph.nodes[u])
                        if not pruned.has_node(v):
                            pruned.add_node(v, **subgraph.nodes[v])
                        # Add edges between u and v from original subgraph
                        if subgraph.has_edge(u, v):
                            for key, data in subgraph[u][v].items():
                                pruned.add_edge(u, v, key=key, **data)
                except (nx.NetworkXNoPath, nx.NodeNotFound):
                    continue
                    
        return pruned

    def get_canonical_adjacency_matrix(self, subgraph: nx.MultiDiGraph) -> Tuple[List[str], np.ndarray]:
        """Returns the adjacency matrix sorted alphabetically by node labels
        to solve permutation sensitivity (Graph Isomorphism).
        Note: subgraph is always a detached .copy() — no lock needed here.
        """
        nodes = sorted(list(subgraph.nodes()))
        if not nodes:
            return [], np.zeros((0, 0))

        adj_matrix = nx.to_numpy_array(subgraph, nodelist=nodes)

        # Normalize matrix to keep Hamiltonian eigenvalues in a bounded range
        norm = np.linalg.norm(adj_matrix)
        if norm > 0:
            adj_matrix = adj_matrix / norm

        return nodes, adj_matrix

    def clear_graph(self):
        """Thread-safe clear operation."""
        with self.lock.gen_wlock():
            self.graph.clear()
            self._save_graph()
