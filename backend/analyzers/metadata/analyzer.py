"""Package metadata analyzer."""
from __future__ import annotations
from datetime import datetime, timezone
from typing import Optional, List
from ...schemas import MetadataResult, SignalResult, RegistryResult
from ...config import get_settings

settings = get_settings()


def analyze_metadata(registry: RegistryResult) -> MetadataResult:
    signals: List[SignalResult] = []
    now = datetime.now(timezone.utc)

    package_age_days: Optional[int] = None
    is_new = False

    if registry.published_at:
        pub = registry.published_at
        if pub.tzinfo is None:
            pub = pub.replace(tzinfo=timezone.utc)
        package_age_days = (now - pub).days
        is_new = package_age_days < settings.new_package_age_days

        if package_age_days < 1:
            signals.append(SignalResult(
                name="package_age",
                status="DANGER",
                value=package_age_days,
                description="Package was created less than 24 hours ago.",
            ))
        elif package_age_days < 7:
            signals.append(SignalResult(
                name="package_age",
                status="DANGER",
                value=package_age_days,
                description=f"Package was created only {package_age_days} days ago — very new.",
            ))
        elif package_age_days < settings.new_package_age_days:
            signals.append(SignalResult(
                name="package_age",
                status="WARNING",
                value=package_age_days,
                description=f"Package is {package_age_days} days old. Relatively new.",
            ))
        else:
            signals.append(SignalResult(
                name="package_age",
                status="OK",
                value=package_age_days,
                description=f"Package has been available for {package_age_days} days.",
            ))

    version_count = len(registry.all_versions)

    if version_count == 0:
        signals.append(SignalResult(
            name="version_history",
            status="WARNING",
            value=version_count,
            description="No published versions found.",
        ))
    elif version_count == 1:
        signals.append(SignalResult(
            name="version_history",
            status="WARNING",
            value=version_count,
            description="Only one version ever published — limited release history.",
        ))
    else:
        signals.append(SignalResult(
            name="version_history",
            status="OK",
            value=version_count,
            description=f"{version_count} versions published.",
        ))

    if registry.download_count is not None:
        if registry.download_count < settings.low_download_threshold:
            signals.append(SignalResult(
                name="download_count",
                status="WARNING",
                value=registry.download_count,
                description=f"Very low download count: {registry.download_count}.",
            ))
        else:
            signals.append(SignalResult(
                name="download_count",
                status="OK",
                value=registry.download_count,
                description=f"Download count: {registry.download_count}.",
            ))

    if not registry.publisher:
        signals.append(SignalResult(
            name="publisher",
            status="WARNING",
            value=None,
            description="No publisher information available.",
        ))
    else:
        signals.append(SignalResult(
            name="publisher",
            status="OK",
            value=registry.publisher,
            description=f"Publisher: {registry.publisher}.",
        ))

    if not registry.description:
        signals.append(SignalResult(
            name="description",
            status="WARNING",
            value=None,
            description="Package has no description.",
        ))

    if not registry.license:
        signals.append(SignalResult(
            name="license",
            status="WARNING",
            value=None,
            description="No license specified.",
        ))

    is_abandoned = version_count > 0 and package_age_days and package_age_days > 1500 and version_count < 3

    return MetadataResult(
        package_age_days=package_age_days,
        version_count=version_count,
        is_new=is_new,
        is_abandoned=bool(is_abandoned),
        signals=signals,
    )
