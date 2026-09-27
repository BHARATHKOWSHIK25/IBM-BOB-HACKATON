"""Backend tests for DepPhantom.

Run from the depphantom/ directory:
  python -m pytest backend/tests/test_core.py -v
"""
import sys
import os

# Ensure 'backend' package is importable
_HERE = os.path.dirname(os.path.abspath(__file__))
_BACKEND_PARENT = os.path.join(_HERE, '..', '..')  # depphantom/
if _BACKEND_PARENT not in sys.path:
    sys.path.insert(0, _BACKEND_PARENT)


class TestTyposquattingDetector:
    def test_detects_requets(self):
        from backend.analyzers.typosquatting.detector import detect_typosquatting
        result = detect_typosquatting("requets", "pypi")
        assert result.is_suspicious is True
        assert result.closest_match == "requests"
        assert result.similarity_score > 0.80

    def test_no_false_positive_requests(self):
        from backend.analyzers.typosquatting.detector import detect_typosquatting
        result = detect_typosquatting("requests", "pypi")
        assert result.is_suspicious is False

    def test_detects_lodash_typo(self):
        from backend.analyzers.typosquatting.detector import detect_typosquatting
        result = detect_typosquatting("loadsh", "npm")
        assert result.is_suspicious is True
        assert result.closest_match == "lodash"

    def test_npm_ecosystem(self):
        from backend.analyzers.typosquatting.detector import detect_typosquatting
        result = detect_typosquatting("expres", "npm")
        assert result.similarity_score > 0.7


class TestRiskEngine:
    def _make_registry(self, **kwargs):
        from backend.schemas import RegistryResult
        return RegistryResult(**{"exists": True, **kwargs})

    def _make_typosquat(self, **kwargs):
        from backend.schemas import TyposquatResult
        return TyposquatResult(**kwargs)

    def _make_meta(self, **kwargs):
        from backend.schemas import MetadataResult
        return MetadataResult(**kwargs)

    def _make_script(self, **kwargs):
        from backend.schemas import ScriptRiskResult
        return ScriptRiskResult(**{"risk_level": "LOW", "findings": [], "signals": [], **kwargs})

    def _make_dep(self, **kwargs):
        from backend.schemas import DependencyRiskResult
        return DependencyRiskResult(**{"risk_level": "LOW", "suspicious_deps": [], "signals": [], **kwargs})

    def _make_intent(self, **kwargs):
        from backend.schemas import IntentResult
        return IntentResult(**{"match_level": "MATCH", "explanation": "OK", "signals": [], **kwargs})

    def test_nonexistent_package_is_critical(self):
        from backend.risk.engine import calculate_risk
        registry = self._make_registry(exists=False)
        typosquat = self._make_typosquat()
        meta = self._make_meta()
        script = self._make_script()
        dep = self._make_dep()
        intent = self._make_intent(match_level="UNKNOWN")
        risk, conf, reasons, _ = calculate_risk(
            registry, typosquat, meta, script, dep, intent, source="AI_AGENT"
        )
        assert risk in ("HIGH", "CRITICAL")
        assert any("does not exist" in r.lower() for r in reasons)

    def test_trusted_package_is_low_risk(self):
        from backend.risk.engine import calculate_risk
        from datetime import datetime, timezone, timedelta
        registry = self._make_registry(
            exists=True,
            published_at=datetime.now(timezone.utc) - timedelta(days=4000),
            download_count=10_000_000,
            publisher="kennethreitz",
        )
        typosquat = self._make_typosquat(similarity_score=0.0, is_suspicious=False)
        meta = self._make_meta(package_age_days=4000, is_new=False, version_count=40)
        script = self._make_script(risk_level="LOW")
        dep = self._make_dep(risk_level="LOW")
        intent = self._make_intent(match_level="MATCH")
        risk, conf, _, _ = calculate_risk(
            registry, typosquat, meta, script, dep, intent, source="AI_AGENT"
        )
        assert risk == "LOW"

    def test_typosquatting_raises_risk(self):
        from backend.risk.engine import calculate_risk
        registry = self._make_registry(exists=True)
        typosquat = self._make_typosquat(
            closest_match="requests", similarity_score=0.94, is_suspicious=True
        )
        meta = self._make_meta()
        script = self._make_script()
        dep = self._make_dep()
        intent = self._make_intent(match_level="MISMATCH")
        risk, _, reasons, _ = calculate_risk(
            registry, typosquat, meta, script, dep, intent
        )
        assert risk in ("HIGH", "CRITICAL")

    def test_suspicious_script_raises_risk(self):
        from backend.risk.engine import calculate_risk
        registry = self._make_registry(exists=True)
        typosquat = self._make_typosquat()
        meta = self._make_meta()
        script = self._make_script(risk_level="CRITICAL", findings=["shell execution", "network access"])
        dep = self._make_dep()
        intent = self._make_intent()
        risk, _, _, _ = calculate_risk(
            registry, typosquat, meta, script, dep, intent
        )
        assert risk in ("HIGH", "CRITICAL")


class TestDecisionEngine:
    def test_low_risk_allows(self):
        from backend.risk.engine import get_decision
        assert get_decision("LOW") == "ALLOW"

    def test_medium_risk_reviews(self):
        from backend.risk.engine import get_decision
        assert get_decision("MEDIUM") == "REVIEW"

    def test_high_risk_blocks(self):
        from backend.risk.engine import get_decision
        assert get_decision("HIGH") == "BLOCK"

    def test_critical_risk_blocks(self):
        from backend.risk.engine import get_decision
        assert get_decision("CRITICAL") == "BLOCK"


class TestIntentAnalyzer:
    def test_http_intent_matches_requests(self):
        from backend.analyzers.intent.analyzer import analyze_intent
        result = analyze_intent(
            "requests", "pypi",
            "HTTP client for REST API calls",
            "Python HTTP for Humans."
        )
        assert result.match_level in ("MATCH", "PARTIAL")

    def test_intent_mismatch_for_suspicious_name(self):
        from backend.analyzers.intent.analyzer import analyze_intent
        result = analyze_intent(
            "crypto-miner-helper", "npm",
            "Generate PDF reports",
            None
        )
        assert any(s.status == "DANGER" for s in result.signals)

    def test_no_reason_returns_unknown(self):
        from backend.analyzers.intent.analyzer import analyze_intent
        result = analyze_intent("some-package", "pypi", None, None)
        assert result.match_level == "UNKNOWN"


class TestMetadataAnalyzer:
    def test_new_package_flagged(self):
        from backend.analyzers.metadata.analyzer import analyze_metadata
        from backend.schemas import RegistryResult
        from datetime import datetime, timezone, timedelta
        registry = RegistryResult(
            exists=True,
            published_at=datetime.now(timezone.utc) - timedelta(days=3),
            all_versions=["0.0.1"],
        )
        result = analyze_metadata(registry)
        assert result.is_new is True
        assert any(s.status == "DANGER" for s in result.signals)

    def test_old_package_ok(self):
        from backend.analyzers.metadata.analyzer import analyze_metadata
        from backend.schemas import RegistryResult
        from datetime import datetime, timezone, timedelta
        registry = RegistryResult(
            exists=True,
            published_at=datetime.now(timezone.utc) - timedelta(days=1000),
            all_versions=["1.0.0", "1.1.0", "2.0.0"],
        )
        result = analyze_metadata(registry)
        assert result.is_new is False
        assert any(s.status == "OK" for s in result.signals)


class TestDemoScenarios:
    def test_all_scenarios_exist(self):
        from backend.demo.scenarios.presets import DEMO_SCENARIOS
        assert "hallucinated" in DEMO_SCENARIOS
        assert "typosquatting" in DEMO_SCENARIOS
        assert "suspicious_existing" in DEMO_SCENARIOS
        assert "trusted" in DEMO_SCENARIOS

    def test_hallucinated_scenario_blocks(self):
        from backend.demo.scenarios.presets import DEMO_SCENARIOS
        scenario = DEMO_SCENARIOS["hallucinated"]
        assert scenario["decision"] == "BLOCK"
        assert scenario["overall_risk"] == "CRITICAL"

    def test_trusted_scenario_allows(self):
        from backend.demo.scenarios.presets import DEMO_SCENARIOS
        scenario = DEMO_SCENARIOS["trusted"]
        assert scenario["decision"] == "ALLOW"
        assert scenario["overall_risk"] == "LOW"

    def test_typosquatting_scenario_blocks(self):
        from backend.demo.scenarios.presets import DEMO_SCENARIOS
        scenario = DEMO_SCENARIOS["typosquatting"]
        assert scenario["decision"] == "BLOCK"
        assert scenario["overall_risk"] == "CRITICAL"


class TestSettings:
    def test_vercel_uses_writable_sqlite_path(self, monkeypatch):
        from backend.config import Settings

        monkeypatch.setenv("VERCEL", "1")
        monkeypatch.delenv("DATABASE_URL", raising=False)

        settings = Settings(_env_file=None)
        assert settings.database_url == "sqlite+aiosqlite:////tmp/depphantom.db"


class TestRegistryFailClosed:
    """Verify fail-closed behavior when registry is unreachable."""

    def _make_registry(self, **kwargs):
        from backend.schemas import RegistryResult
        return RegistryResult(**{"exists": False, **kwargs})

    def _make_typosquat(self, **kwargs):
        from backend.schemas import TyposquatResult
        return TyposquatResult(**kwargs)

    def _make_meta(self, **kwargs):
        from backend.schemas import MetadataResult
        return MetadataResult(**kwargs)

    def _make_script(self, **kwargs):
        from backend.schemas import ScriptRiskResult
        return ScriptRiskResult(**{"risk_level": "UNKNOWN", "findings": [], "signals": [], **kwargs})

    def _make_dep(self, **kwargs):
        from backend.schemas import DependencyRiskResult
        return DependencyRiskResult(**{"risk_level": "LOW", "suspicious_deps": [], "signals": [], **kwargs})

    def _make_intent(self, **kwargs):
        from backend.schemas import IntentResult
        return IntentResult(**{"match_level": "UNKNOWN", "explanation": "N/A", "signals": [], **kwargs})

    def test_registry_error_is_not_allow(self):
        """A registry error must never result in ALLOW."""
        from backend.risk.engine import calculate_risk, get_decision
        registry = self._make_registry(exists=False, registry_error=True)
        risk, _, reasons, explanation = calculate_risk(
            registry, self._make_typosquat(), self._make_meta(),
            self._make_script(), self._make_dep(), self._make_intent(),
            source="AI_AGENT", package_name="unknown-pkg"
        )
        decision = get_decision(risk)
        assert decision != "ALLOW", "Registry error must not result in ALLOW (fail-closed)"
        assert any("could not be completed" in r.lower() or "network error" in r.lower() for r in reasons)
        assert "could not be completed" in explanation.lower() or "unreachable" in explanation.lower()

    def test_registry_error_elevates_risk(self):
        """A registry error on its own should produce at least MEDIUM risk."""
        from backend.risk.engine import calculate_risk
        registry = self._make_registry(exists=False, registry_error=True)
        risk, _, _, _ = calculate_risk(
            registry, self._make_typosquat(), self._make_meta(),
            self._make_script(), self._make_dep(), self._make_intent(),
        )
        assert risk in ("MEDIUM", "HIGH", "CRITICAL"), f"Registry error risk should not be LOW, got {risk}"


class TestInputValidation:
    """Verify package name validation prevents injection / path traversal."""

    def test_valid_package_names(self):
        from backend.schemas import VerifyRequest, EcosystemEnum
        for name in ["requests", "my-package", "my_package", "pkg.v2", "React"]:
            req = VerifyRequest(package=name, ecosystem=EcosystemEnum.pypi)
            assert req.package == name

    def test_path_traversal_blocked(self):
        from backend.schemas import VerifyRequest, EcosystemEnum
        import pytest
        with pytest.raises(Exception):
            VerifyRequest(package="../etc/passwd", ecosystem=EcosystemEnum.pypi)

    def test_shell_metachar_blocked(self):
        from backend.schemas import VerifyRequest, EcosystemEnum
        import pytest
        for bad in ["; rm -rf /", "$(whoami)", "`id`", "pkg && evil", "pkg | cat"]:
            with pytest.raises(Exception):
                VerifyRequest(package=bad, ecosystem=EcosystemEnum.pypi)

    def test_empty_package_blocked(self):
        from backend.schemas import VerifyRequest, EcosystemEnum
        import pytest
        with pytest.raises(Exception):
            VerifyRequest(package="   ", ecosystem=EcosystemEnum.pypi)

    def test_too_long_package_blocked(self):
        from backend.schemas import VerifyRequest, EcosystemEnum
        import pytest
        with pytest.raises(Exception):
            VerifyRequest(package="a" * 300, ecosystem=EcosystemEnum.pypi)
    def test_package_name_with_spaces_blocked(self):
        from backend.schemas import VerifyRequest, EcosystemEnum
        import pytest

        with pytest.raises(Exception):
            VerifyRequest(
                package="my package",
                ecosystem=EcosystemEnum.pypi
            )      

