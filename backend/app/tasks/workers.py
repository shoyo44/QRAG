import logging
from celery import Celery
import numpy as np
from typing import List, Optional
from app.core.config import settings
from app.services.quantum_kernel import QuantumKernelService

logger = logging.getLogger(__name__)

# Initialize Celery Application
celery_app = Celery(
    "qrag_tasks", 
    broker=settings.REDIS_URL, 
    backend=settings.REDIS_URL
)

# Optional configuration overrides
celery_app.conf.update(
    task_serializer="json",
    result_serializer="json",
    accept_content=["json"],
    timezone="UTC",
    enable_utc=True
)

# Lazy worker-level singleton — instantiated on first task call, not on import
_kernel_service = None

@celery_app.task(name="tasks.compute_subgraph_similarity")
def compute_subgraph_similarity_task(
    adj_matrix_1_list: List[List[float]],
    adj_matrix_2_list: List[List[float]],
    node_features_1: Optional[List[List[float]]] = None,
    node_features_2: Optional[List[List[float]]] = None,
    time: float = 1.0,
    trotter_steps: int = 3
) -> float:
    """Asynchronous background worker task that performs simulated 
    Hilbert space state vector similarity scoring using PennyLane.
    """
    logger.info("Starting Celery task: compute_subgraph_similarity")
    # Lazy-init the kernel service on the first call inside this worker process
    global _kernel_service
    if _kernel_service is None:
        _kernel_service = QuantumKernelService(max_qubits=settings.MAX_QUBITS)
    try:
        # Convert lists back to numpy arrays
        A1 = np.array(adj_matrix_1_list)
        A2 = np.array(adj_matrix_2_list)
        
        # Calculate overlap similarity
        similarity = _kernel_service.compute_kernel_similarity(
            adj_matrix_1=A1,
            adj_matrix_2=A2,
            node_features_1=node_features_1,
            node_features_2=node_features_2,
            time=time,
            trotter_steps=trotter_steps
        )
        logger.info(f"Similarity calculation complete: {similarity}")
        return similarity
    except Exception as e:
        logger.error(f"Failed to execute background quantum walk kernel task: {e}")
        raise e
