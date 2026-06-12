import { useState, useEffect } from "react";
import { getModelInfo, getFeatureImportance } from "../services/api";

export function useModelInfo() {
  const [modelInfo, setModelInfo] = useState(null);
  const [featureImportance, setFeatureImportance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    Promise.all([getModelInfo(), getFeatureImportance()])
      .then(([info, fi]) => {
        setModelInfo(info);
        setFeatureImportance(fi?.feature_importance || {});
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return { modelInfo, featureImportance, loading, error };
}
