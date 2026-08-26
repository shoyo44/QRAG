import logging
import numpy as np
import pennylane as qml
from typing import List, Optional, Tuple
from app.core.config import settings

logger = logging.getLogger(__name__)

class QuantumKernelService:
    def __init__(self, max_qubits: Optional[int] = None):
        self.max_qubits = max_qubits or settings.MAX_QUBITS

    def _project_node_features_to_angles(self, features: Optional[List[List[float]]], num_nodes: int) -> List[float]:
        """Projects dense embedding vectors for each node into a single rotation angle in [0, pi]
        to prepare the quantum initial state.
        """
        if not features:
            return [0.0] * num_nodes
            
        angles = []
        for i in range(num_nodes):
            if i < len(features) and features[i]:
                feat_arr = np.array(features[i])
                # Project via mean or normalized sum to map representation to an angle
                avg_val = np.mean(feat_arr)
                # Map to [0, pi] using sigmoid-like scaling
                angle = np.pi / (1.0 + np.exp(-avg_val))
                angles.append(float(angle))
            else:
                angles.append(0.0)
        return angles

    def _build_hamiltonian(self, num_qubits: int, adj_matrix: np.ndarray, gamma: float = 0.5) -> Optional[qml.Hamiltonian]:
        """Maps adjacency matrix elements to a graph Heisenberg Hamiltonian:
        H = -gamma * sum( A_ij * (X_i X_j + Y_i Y_j + Z_i Z_j) )
        """
        coeffs = []
        obs = []
        
        for i in range(num_qubits):
            for j in range(i + 1, num_qubits):
                weight = adj_matrix[i, j]
                if abs(weight) > 1e-5:
                    coeff = -gamma * weight
                    
                    # X_i @ X_j term
                    coeffs.append(coeff)
                    obs.append(qml.PauliX(i) @ qml.PauliX(j))
                    
                    # Y_i @ Y_j term
                    coeffs.append(coeff)
                    obs.append(qml.PauliY(i) @ qml.PauliY(j))
                    
                    # Z_i @ Z_j term
                    coeffs.append(coeff)
                    obs.append(qml.PauliZ(i) @ qml.PauliZ(j))
                    
        if not coeffs:
            return None
            
        return qml.Hamiltonian(coeffs, obs)

    def compute_kernel_similarity(self, 
                                  adj_matrix_1: np.ndarray, 
                                  adj_matrix_2: np.ndarray, 
                                  node_features_1: Optional[List[List[float]]] = None,
                                  node_features_2: Optional[List[List[float]]] = None,
                                  time: float = 1.0, 
                                  trotter_steps: int = 3) -> float:
        """Evolves two graph states under their respective Hamiltonians and 
        returns their state vector overlap similarity in Hilbert space.
        """
        N1 = adj_matrix_1.shape[0]
        N2 = adj_matrix_2.shape[0]
        N = max(N1, N2)

        if N == 0:
            return 1.0

        # Clamp N to the qubit budget BEFORE building the padding arrays
        if N > self.max_qubits:
            logger.warning(
                f"Merged graph size {N} exceeds classical qubit simulation limit of "
                f"{self.max_qubits}. Truncating to {self.max_qubits} qubits."
            )
            N = self.max_qubits
            N1 = min(N1, N)
            N2 = min(N2, N)

        # Pad (or truncate) adjacency matrices to N x N
        A1 = np.zeros((N, N))
        A2 = np.zeros((N, N))
        A1[:N1, :N1] = adj_matrix_1[:N1, :N1]
        A2[:N2, :N2] = adj_matrix_2[:N2, :N2]

        # Project and pad node features to angles
        angles_1 = self._project_node_features_to_angles(node_features_1, N1)
        angles_2 = self._project_node_features_to_angles(node_features_2, N2)
        
        # Pad angles list to match size N
        angles_1 = angles_1 + [0.0] * (N - len(angles_1))
        angles_2 = angles_2 + [0.0] * (N - len(angles_2))

        # Setup PennyLane lightning qubit simulator device
        dev = qml.device("lightning.qubit", wires=N)

        # Build Hamiltonians
        H1 = self._build_hamiltonian(N, A1)
        H2 = self._build_hamiltonian(N, A2)

        # QNode to extract state vector 1
        @qml.qnode(dev)
        def get_state_1():
            # Initial state preparation using Ry node features injection
            for i in range(N):
                qml.RY(angles_1[i], wires=i)
            # Continuous Time Quantum Random Walk evolution
            if H1 is not None:
                qml.ApproxTimeEvolution(H1, time, trotter_steps)
            return qml.state()

        # QNode to extract state vector 2
        @qml.qnode(dev)
        def get_state_2():
            # Initial state preparation using Ry node features injection
            for i in range(N):
                qml.RY(angles_2[i], wires=i)
            # Continuous Time Quantum Random Walk evolution
            if H2 is not None:
                qml.ApproxTimeEvolution(H2, time, trotter_steps)
            return qml.state()

        try:
            # Simulate state vectors
            state_1 = get_state_1()
            state_2 = get_state_2()
            
            # Compute inner product overlap: K(G1, G2) = |<psi_1 | psi_2>|^2
            overlap = np.abs(np.dot(np.conj(state_1), state_2))**2
            return float(overlap)
        except Exception as e:
            logger.error(f"Quantum simulation kernel failed: {e}")
            raise e

    def compute_quantum_walk_node_probabilities(
        self,
        adj_matrix: np.ndarray,
        seed_indices: List[int],
        time: float = 1.0,
        trotter_steps: int = 3
    ) -> np.ndarray:
        """Runs Continuous-Time Quantum Walk (CTQW) on the graph from the seed node(s).
        Returns a probability vector of size N giving the quantum interference probability
        for each node in the graph.
        """
        N = adj_matrix.shape[0]
        if N == 0:
            return np.array([])
        if N == 1:
            return np.array([1.0])

        if N > self.max_qubits:
            N = self.max_qubits
            adj_matrix = adj_matrix[:N, :N]

        # Valid seeds inside bounds
        valid_seeds = [s for s in seed_indices if 0 <= s < N]
        if not valid_seeds:
            valid_seeds = [0]

        # Equal superposition over seed nodes for initial state in single-excitation subspace
        initial_amplitudes = np.zeros(2**N, dtype=complex)
        for s in valid_seeds:
            basis_idx = 1 << (N - 1 - s)
            initial_amplitudes[basis_idx] = 1.0 / np.sqrt(len(valid_seeds))

        # Setup PennyLane device
        dev = qml.device("lightning.qubit", wires=N)
        H = self._build_hamiltonian(N, adj_matrix)

        @qml.qnode(dev)
        def walk_circuit():
            qml.StatePrep(initial_amplitudes, wires=range(N))
            if H is not None:
                qml.ApproxTimeEvolution(H, time, trotter_steps)
            return qml.probs(wires=range(N))

        try:
            all_probs = walk_circuit()
            # Calculate single-qubit excitation probability P(qubit i = 1)
            node_probs = np.zeros(N)
            for basis_idx, p in enumerate(all_probs):
                if p > 1e-8:
                    for i in range(N):
                        if (basis_idx >> (N - 1 - i)) & 1:
                            node_probs[i] += p
            total_p = np.sum(node_probs)
            if total_p > 0:
                node_probs = node_probs / total_p
            return node_probs
        except Exception as e:
            logger.warning(f"CTQW node probability simulation fallback: {e}")
            deg = np.sum(np.abs(adj_matrix), axis=1)
            total_d = np.sum(deg)
            return deg / total_d if total_d > 0 else np.ones(N) / N

    def export_nisq_openqasm(self, adj_matrix: np.ndarray, num_qubits: int = 4) -> str:
        """Exports the Trotterized graph Heisenberg Hamiltonian evolution circuit 
        to OpenQASM 2.0 format for deployment on physical NISQ quantum hardware (e.g. IBM Q).
        """
        dev = qml.device("default.qubit", wires=num_qubits)
        H = self._build_hamiltonian(num_qubits, adj_matrix)
        
        @qml.qnode(dev)
        def circuit():
            for i in range(num_qubits):
                qml.RY(np.pi / 4, wires=i)
            if H is not None:
                qml.ApproxTimeEvolution(H, 1.0, 2)
            return qml.state()

        try:
            tape = qml.transforms.make_tape(circuit)()
            qasm_str = tape.to_openqasm()
            return qasm_str
        except Exception as e:
            logger.warning(f"Could not convert circuit to OpenQASM: {e}")
            return "// OpenQASM Export Stub for NISQ Execution\nOPENQASM 2.0;\ninclude \"qelib1.inc\";\nqreg q[4];\ncreg c[4];\n"

