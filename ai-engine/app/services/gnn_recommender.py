from __future__ import annotations

from dataclasses import dataclass
from typing import Dict, Iterable


@dataclass
class GNNRecommender:
    enabled: bool = False

    def __post_init__(self) -> None:
        try:
            import torch  # noqa: F401
            import torch_geometric  # noqa: F401
            self.enabled = True
        except Exception:
            self.enabled = False

    def rank_adjustments(self, feature_rows: Iterable[Dict[str, float]]) -> list[float]:
        rows = list(feature_rows)
        if not rows:
            return []

        if not self.enabled:
            return [0.0 for _ in rows]

        # Placeholder graph scoring until trained edge-index model is added.
        # Produces small bounded lift based on relational features.
        adjustments: list[float] = []
        for row in rows:
            interest = row.get("interest", 0.0)
            academic = row.get("academic", 0.0)
            admission = row.get("admission", 0.0)
            adjustments.append(max(-0.03, min(0.05, 0.04 * interest + 0.03 * academic + 0.03 * admission - 0.05)))
        return adjustments
