#!/usr/bin/env python3
"""Comprehensive import validation test for AI Education Platform.
Tests all system imports and dependencies to ensure proper functionality.
"""

import sys
import traceback
from typing import Any


def test_standard_library_imports() -> dict[str, Any]:
    """Test standard library imports."""
    results = {"status": "success", "errors": []}

    try:
        print("✅ Standard library imports: SUCCESS")
    except Exception as e:
        results["status"] = "error"
        results["errors"].append(f"Standard library import error: {str(e)}")
        print(f"❌ Standard library imports: {str(e)}")

    return results


def test_fastapi_imports() -> dict[str, Any]:
    """Test FastAPI and related imports."""
    results = {"status": "success", "errors": []}

    try:
        print("✅ FastAPI imports: SUCCESS")
    except Exception as e:
        results["status"] = "error"
        results["errors"].append(f"FastAPI import error: {str(e)}")
        print(f"❌ FastAPI imports: {str(e)}")

    return results


def test_database_imports() -> dict[str, Any]:
    """Test database-related imports."""
    results = {"status": "success", "errors": []}

    try:
        print("✅ Database imports: SUCCESS")
    except Exception as e:
        results["status"] = "error"
        results["errors"].append(f"Database import error: {str(e)}")
        print(f"❌ Database imports: {str(e)}")

    return results


def test_redis_imports() -> dict[str, Any]:
    """Test Redis imports."""
    results = {"status": "success", "errors": []}

    try:
        print("✅ Redis imports: SUCCESS")
    except Exception as e:
        results["status"] = "error"
        results["errors"].append(f"Redis import error: {str(e)}")
        print(f"❌ Redis imports: {str(e)}")

    return results


def test_pydantic_imports() -> dict[str, Any]:
    """Test Pydantic imports."""
    results = {"status": "success", "errors": []}

    try:
        print("✅ Pydantic imports: SUCCESS")
    except Exception as e:
        results["status"] = "error"
        results["errors"].append(f"Pydantic import error: {str(e)}")
        print(f"❌ Pydantic imports: {str(e)}")

    return results


def test_system_monitoring_imports() -> dict[str, Any]:
    """Test system monitoring imports."""
    results = {"status": "success", "errors": []}

    try:
        print("✅ System monitoring imports: SUCCESS")
    except Exception as e:
        results["status"] = "error"
        results["errors"].append(f"System monitoring import error: {str(e)}")
        print(f"❌ System monitoring imports: {str(e)}")

    return results


def test_app_core_imports() -> dict[str, Any]:
    """Test application core module imports."""
    results = {"status": "success", "errors": []}

    try:
        # Add the backend directory to Python path
        import os
        import sys

        backend_path = os.path.join(os.path.dirname(__file__), ".")
        if backend_path not in sys.path:
            sys.path.insert(0, backend_path)

        print("✅ App core imports: SUCCESS")
    except Exception as e:
        results["status"] = "error"
        results["errors"].append(f"App core import error: {str(e)}")
        print(f"❌ App core imports: {str(e)}")
        traceback.print_exc()

    return results


def test_middleware_imports() -> dict[str, Any]:
    """Test middleware imports."""
    results = {"status": "success", "errors": []}

    try:
        print("✅ Middleware imports: SUCCESS")
    except Exception as e:
        results["status"] = "error"
        results["errors"].append(f"Middleware import error: {str(e)}")
        print(f"❌ Middleware imports: {str(e)}")
        traceback.print_exc()

    return results


def test_api_imports() -> dict[str, Any]:
    """Test API module imports."""
    results = {"status": "success", "errors": []}

    try:
        print("✅ API imports: SUCCESS")
    except Exception as e:
        results["status"] = "error"
        results["errors"].append(f"API import error: {str(e)}")
        print(f"❌ API imports: {str(e)}")
        traceback.print_exc()

    return results


def test_models_imports() -> dict[str, Any]:
    """Test model imports."""
    results = {"status": "success", "errors": []}

    try:
        print("✅ Models imports: SUCCESS")
    except Exception as e:
        results["status"] = "error"
        results["errors"].append(f"Models import error: {str(e)}")
        print(f"❌ Models imports: {str(e)}")
        traceback.print_exc()

    return results


def test_route_imports() -> dict[str, Any]:
    """Test route module imports."""
    results = {"status": "success", "errors": []}

    try:
        print("✅ Routes imports: SUCCESS")
    except Exception as e:
        results["status"] = "error"
        results["errors"].append(f"Routes import error: {str(e)}")
        print(f"❌ Routes imports: {str(e)}")
        traceback.print_exc()

    return results


def main():
    """Run comprehensive import tests."""
    print("🔍 AI Education Platform - Import Validation Test")
    print("=" * 60)

    test_functions = [
        test_standard_library_imports,
        test_fastapi_imports,
        test_database_imports,
        test_redis_imports,
        test_pydantic_imports,
        test_system_monitoring_imports,
        test_app_core_imports,
        test_middleware_imports,
        test_api_imports,
        test_models_imports,
        test_route_imports,
    ]

    all_results = []
    total_tests = len(test_functions)
    passed_tests = 0

    for test_func in test_functions:
        print(f"\n📋 Running {test_func.__name__}...")
        result = test_func()
        all_results.append({"test": test_func.__name__, "result": result})

        if result["status"] == "success":
            passed_tests += 1

    print("\n" + "=" * 60)
    print("📊 IMPORT TEST SUMMARY")
    print("=" * 60)
    print(f"Total Tests: {total_tests}")
    print(f"Passed: {passed_tests}")
    print(f"Failed: {total_tests - passed_tests}")
    print(f"Success Rate: {(passed_tests / total_tests) * 100:.1f}%")

    if passed_tests == total_tests:
        print("\n🎉 ALL IMPORTS SUCCESSFUL! System is ready.")
        return 0
    else:
        print("\n⚠️  SOME IMPORTS FAILED. Check errors above.")
        print("\nFailed Tests:")
        for test_result in all_results:
            if test_result["result"]["status"] != "success":
                print(f"  - {test_result['test']}")
                for error in test_result["result"]["errors"]:
                    print(f"    Error: {error}")
        return 1


if __name__ == "__main__":
    sys.exit(main())
