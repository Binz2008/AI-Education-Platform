#!/usr/bin/env python3
"""
Path Guardian - نظام حماية المسارات لمنصة التعليم بالذكاء الاصطناعي
يضمن أن جميع المكونات الجديدة تتبع بنية المشروع المحددة
"""

import json
import os
import sys
from pathlib import Path
from typing import Dict, List, Optional
import re

class PathGuardian:
    def __init__(self, config_path: str = "project-structure.json"):
        self.config_path = config_path
        self.config = self._load_config()
        self.root_path = Path(self.config["rootPath"])
        
    def _load_config(self) -> Dict:
        """تحميل تكوين بنية المشروع"""
        try:
            with open(self.config_path, 'r', encoding='utf-8') as f:
                return json.load(f)
        except FileNotFoundError:
            print(f"❌ ملف التكوين غير موجود: {self.config_path}")
            sys.exit(1)
            
    def validate_file_path(self, file_path: str) -> bool:
        """التحقق من صحة مسار الملف"""
        path = Path(file_path)
        
        # التحقق من أن الملف داخل المشروع
        try:
            relative_path = path.relative_to(self.root_path)
        except ValueError:
            print(f"❌ الملف خارج نطاق المشروع: {file_path}")
            return False
            
        # التحقق من نوع الملف والمسار المسموح
        file_ext = path.suffix
        return self._validate_by_extension(str(relative_path), file_ext)
        
    def _validate_by_extension(self, relative_path: str, extension: str) -> bool:
        """التحقق من المسار حسب نوع الملف"""
        rules = self.config["fileTypeRules"]
        
        for file_type, rule in rules.items():
            if extension in rule["extensions"]:
                allowed_paths = rule["allowedPaths"]
                
                # التحقق من أن الملف في مسار مسموح (يدعم المسارات الفرعية)
                for allowed_path in allowed_paths:
                    # تحويل المسارات لاستخدام نفس الفاصل
                    normalized_relative = relative_path.replace("\\", "/")
                    normalized_allowed = allowed_path.replace("\\", "/")
                    
                    if (normalized_relative.startswith(normalized_allowed + "/") or 
                        normalized_relative == normalized_allowed):
                        return self._validate_naming_convention(
                            Path(relative_path).stem, 
                            rule["enforceNaming"]
                        )
                        
                print(f"❌ مسار غير مسموح لنوع الملف {file_type}: {relative_path}")
                print(f"   المسارات المسموحة: {allowed_paths}")
                return False
                
        # إذا لم يتم العثور على قاعدة، السماح بالملف
        return True
        
    def _validate_naming_convention(self, filename: str, convention: str) -> bool:
        """التحقق من اتفاقية تسمية الملفات"""
        if convention == "snake_case":
            pattern = r'^[a-z0-9_]+$'
        elif convention == "PascalCase":
            pattern = r'^[A-Z][a-zA-Z0-9]*$'
        else:
            return True  # لا توجد قيود
            
        if not re.match(pattern, filename):
            print(f"❌ اسم الملف لا يتبع اتفاقية {convention}: {filename}")
            return False
            
        return True
        
    def suggest_correct_path(self, file_path: str) -> Optional[str]:
        """اقتراح المسار الصحيح للملف"""
        path = Path(file_path)
        extension = path.suffix
        filename = path.stem
        
        rules = self.config["fileTypeRules"]
        
        for file_type, rule in rules.items():
            if extension in rule["extensions"]:
                # اقتراح مسار أكثر ذكاءً حسب نوع الملف
                if extension == ".py":
                    if "model" in filename.lower():
                        suggested_path = "backend/app/models"
                    elif "route" in filename.lower() or "api" in filename.lower():
                        suggested_path = "backend/app/api/routes"
                    elif "schema" in filename.lower():
                        suggested_path = "backend/app/schemas"
                    elif "core" in filename.lower() or "config" in filename.lower():
                        suggested_path = "backend/app/core"
                    else:
                        suggested_path = rule["allowedPaths"][0]
                elif extension in [".ts", ".tsx"]:
                    if "component" in filename.lower() or extension == ".tsx":
                        suggested_path = "frontend/components"
                    elif "page" in filename.lower():
                        suggested_path = "frontend/app"
                    elif "store" in filename.lower() or "state" in filename.lower():
                        suggested_path = "frontend/state"
                    elif "util" in filename.lower() or "lib" in filename.lower():
                        suggested_path = "frontend/lib"
                    else:
                        suggested_path = rule["allowedPaths"][0]
                else:
                    suggested_path = rule["allowedPaths"][0]
                
                # تصحيح اسم الملف حسب الاتفاقية
                if rule["enforceNaming"] == "snake_case":
                    corrected_name = re.sub(r'([A-Z])', r'_\1', filename).lower().strip('_')
                elif rule["enforceNaming"] == "PascalCase":
                    corrected_name = ''.join(word.capitalize() for word in filename.split('_'))
                else:
                    corrected_name = filename
                    
                return f"{suggested_path}/{corrected_name}{extension}"
                
        return None
        
    def scan_project(self) -> Dict[str, List[str]]:
        """فحص المشروع للملفات غير المتوافقة"""
        violations = {
            "wrong_paths": [],
            "naming_violations": [],
            "mixed_languages": []
        }
        
        for root, dirs, files in os.walk(self.root_path):
            # تجاهل المجلدات المستثناة
            dirs[:] = [d for d in dirs if d not in ['.git', 'node_modules', '.next', '__pycache__', '.pytest_cache']]
            
            for file in files:
                file_path = os.path.join(root, file)
                if not self.validate_file_path(file_path):
                    violations["wrong_paths"].append(file_path)
                    
        return violations
        
    def create_file_safely(self, file_path: str, content: str = "") -> bool:
        """إنشاء ملف مع التحقق من المسار"""
        if not self.validate_file_path(file_path):
            suggested = self.suggest_correct_path(file_path)
            if suggested:
                print(f"💡 المسار المقترح: {suggested}")
                response = input("هل تريد استخدام المسار المقترح؟ (y/n): ")
                if response.lower() == 'y':
                    file_path = os.path.join(self.root_path, suggested)
                else:
                    return False
            else:
                return False
                
        # إنشاء المجلدات إذا لم تكن موجودة
        os.makedirs(os.path.dirname(file_path), exist_ok=True)
        
        # إنشاء الملف
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
            
        print(f"✅ تم إنشاء الملف: {file_path}")
        return True

def main():
    """الدالة الرئيسية"""
    guardian = PathGuardian()
    
    if len(sys.argv) < 2:
        print("الاستخدام:")
        print("  python path-guardian.py scan          - فحص المشروع")
        print("  python path-guardian.py validate <path> - التحقق من مسار")
        print("  python path-guardian.py create <path>   - إنشاء ملف آمن")
        return
        
    command = sys.argv[1]
    
    if command == "scan":
        print("🔍 فحص بنية المشروع...")
        violations = guardian.scan_project()
        
        if not any(violations.values()):
            print("✅ جميع الملفات تتبع بنية المشروع الصحيحة")
        else:
            print("❌ تم العثور على مخالفات:")
            for violation_type, files in violations.items():
                if files:
                    print(f"\n{violation_type}:")
                    for file in files:
                        print(f"  - {file}")
                        
    elif command == "validate" and len(sys.argv) > 2:
        file_path = sys.argv[2]
        if guardian.validate_file_path(file_path):
            print(f"✅ المسار صحيح: {file_path}")
        else:
            suggested = guardian.suggest_correct_path(file_path)
            if suggested:
                print(f"💡 المسار المقترح: {suggested}")
                
    elif command == "create" and len(sys.argv) > 2:
        file_path = sys.argv[2]
        content = sys.argv[3] if len(sys.argv) > 3 else ""
        guardian.create_file_safely(file_path, content)
        
    else:
        print("❌ أمر غير صحيح")

if __name__ == "__main__":
    main()
