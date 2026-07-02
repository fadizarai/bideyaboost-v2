from __future__ import annotations
from dataclasses import dataclass
import math
from app.models.registry import ModelRegistry


# Pente de la sigmoid tunisienne calibrée sur la réalité des admissions.
# À delta = +10pts : prob ≈ 77%   (voeu réaliste-haut)
# À delta =   0pts : prob ≈ 50%   (voeu réaliste)
# À delta = -10pts : prob ≈ 23%   (voeu ambitieux)
# À delta = -20pts : prob ≈  9%   (voeu très ambitieux)
_BASE_K = 0.12


def _sigmoid(x: float) -> float:
    try:
        return 1.0 / (1.0 + math.exp(-x))
    except OverflowError:
        return 0.0 if x < 0 else 1.0


@dataclass
class AdmissionPredictor:
    """
    Prédit la probabilité d'admission d'un bachelier tunisien.

    Système tunisien : une seule valeur de référence existe par filière,
    le score de clôture (dernier bachelier admis l'année précédente).

    Pipeline :
      1. Récupère la prédiction LSTM du cutoff 2026 (si disponible)
      2. Ajuste la pente k via XGBoost (compétitivité intrinsèque de la filière)
      3. Calcule la probabilité via sigmoid centrée sur le cutoff de référence
    """
    registry: ModelRegistry

    def predict_probability(
        self,
        orientation_score: float,
        institution: dict,
        city_name: str | None = None,
    ) -> tuple[float, str, dict | None]:
        """
        Retourne (probabilité, confiance, trend_info).

        Args:
            orientation_score : FG calculée du bachelier (0–200), avec bonus régional.
            institution       : dict depuis institutions.json.
            city_name         : ville de l'institution (pour les encoders XGBoost).

        Returns:
            probability : float entre 0.01 et 0.99.
            confidence  : "high" | "medium" | "low".
            trend_info  : dict LSTM ou None.
        """
        # ------------------------------------------------------------------ #
        # 0. Extraire le score de clôture — seule valeur de référence réelle  #
        # ------------------------------------------------------------------ #
        score_cloture_raw = (
            institution.get("admission_score_last")    # ancien nom dans le code
            or institution.get("score_cloture_2025")   # nom guide 2026
            or institution.get("score_cloture")        # nom générique
        )

        # ------------------------------------------------------------------ #
        # 1. LSTM — prédire le cutoff 2026 à partir de la tendance historique #
        # ------------------------------------------------------------------ #
        # FIX CRITIQUE : le champ s'appelle "institution" dans institutions.json,
        # pas "name". C'est pourquoi le LSTM retournait None systématiquement.
        inst_name = (
            institution.get("institution")
            or institution.get("name")
            or ""
        )
        trend_info = self.registry.lstm_predictor.predict_2026_cutoff(inst_name)

        # Cutoff de référence : prédiction LSTM si disponible, sinon clôture 2025
        if trend_info and trend_info.get("predicted_cutoff_2026"):
            ref_cutoff = float(trend_info["predicted_cutoff_2026"])
            lstm_active = True
        elif score_cloture_raw is not None:
            ref_cutoff = float(score_cloture_raw)
            lstm_active = False
        else:
            # Aucune donnée historique → fallback linéaire
            probability = min(0.99, orientation_score / 200.0)
            return probability, "low", None

        # ------------------------------------------------------------------ #
        # 2. XGBoost — ajuster la pente k selon la compétitivité de la filière#
        # ------------------------------------------------------------------ #
        # Le XGBoost ne prédit PAS la probabilité personnelle du bachelier.
        # Il prédit si une filière est "compétitive" (difficile à intégrer).
        # On utilise cette information pour rendre la sigmoid plus ou moins
        # abrupte : filière très compétitive → courbe plus raide (k plus grand),
        # filière peu compétitive → courbe plus douce.
        k = _BASE_K
        xgb_active = False

        if (
            self.registry.xgb_model is not None
            and self.registry.label_encoders is not None
            and score_cloture_raw is not None
        ):
            try:
                import numpy as np

                field_encoded = self._safe_encode(
                    "field_encoder", institution.get("field", "")
                )
                type_encoded = self._safe_encode(
                    "institution_type_encoder",
                    institution.get("institution_type", "University"),
                )
                city_encoded = self._safe_encode(
                    "city_encoder", city_name or "Tunis"
                )

                features = np.array([[
                    float(score_cloture_raw),
                    float(institution.get("study_duration_years") or 3.0),
                    float(institution.get("capacity") or 100.0),
                    float(field_encoded),
                    float(type_encoded),
                    float(city_encoded),
                ]])

                # competitiveness ∈ [0, 1] : 1 = très difficile à intégrer
                competitiveness = float(
                    self.registry.xgb_model.predict_proba(features)[0][1]
                )

                # Rendre la courbe plus abrupte pour les filières compétitives.
                # k varie entre 0.08 (peu compétitif) et 0.18 (très compétitif).
                k = _BASE_K * (0.67 + competitiveness * 1.0)
                xgb_active = True

            except Exception:
                pass  # k reste à _BASE_K

        # ------------------------------------------------------------------ #
        # 3. Sigmoid centrée sur le cutoff de référence                       #
        # ------------------------------------------------------------------ #
        delta = orientation_score - ref_cutoff
        probability = _sigmoid(k * delta)

        # ------------------------------------------------------------------ #
        # 4. Confiance                                                         #
        # ------------------------------------------------------------------ #
        if lstm_active and xgb_active:
            confidence = "high"
        elif lstm_active or xgb_active:
            confidence = "medium"
        else:
            confidence = "low"

        return (
            max(0.01, min(0.99, probability)),
            confidence,
            trend_info,
        )

    # ---------------------------------------------------------------------- #
    # Helpers                                                                  #
    # ---------------------------------------------------------------------- #

    def _safe_encode(self, encoder_name: str, val: str) -> int:
        le = self.registry.label_encoders.get(encoder_name)
        if le is None:
            return 0
        try:
            if val in le.classes_:
                return int(le.transform([val])[0])
            return 0
        except Exception:
            return 0