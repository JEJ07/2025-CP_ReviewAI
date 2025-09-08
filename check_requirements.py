import pkg_resources

requirements_file = "requirements.txt"

with open(requirements_file) as f:
    requirements = f.read().splitlines()

# Parse requirements into pkg_resources Requirement objects
requirements = [pkg_resources.Requirement.parse(r) for r in requirements]

installed = {d.project_name.lower(): d.version for d in pkg_resources.working_set}

print("Checking installed packages...\n")
for req in requirements:
    name = req.project_name.lower()
    if name not in installed:
        print(f"❌ {req} NOT INSTALLED")
    elif installed[name] != str(req.specs[0][1]):  # Compare versions
        print(f"⚠️ {req} -> Installed: {installed[name]}")
    else:
        print(f"✅ {req} is installed")
