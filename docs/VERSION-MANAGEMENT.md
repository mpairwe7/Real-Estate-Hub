# Version Management Guide

## Overview

This project uses **Semantic Versioning** with automated release workflows to manage versions and create GitHub releases.

## Current Version

**v0.8.0** (October 23, 2025)

---

## Semantic Versioning

We follow [Semantic Versioning 2.0.0](https://semver.org/):

### Version Format: `MAJOR.MINOR.PATCH`

- **MAJOR** (x.0.0): Incompatible API changes or breaking changes
- **MINOR** (0.x.0): New features in a backward-compatible manner
- **PATCH** (0.0.x): Backward-compatible bug fixes

### Examples

- `1.0.0` → `2.0.0`: Major breaking changes
- `1.0.0` → `1.1.0`: New features added
- `1.0.0` → `1.0.1`: Bug fixes only

---

## Creating a New Release

### Method 1: Using Yarn Scripts (Recommended)

#### 1. Patch Release (Bug Fixes)

```bash
# Bump patch version (e.g., 0.8.0 → 0.8.1)
yarn release:patch

# Push changes and tag
git push origin trunk --follow-tags
```

#### 2. Minor Release (New Features)

```bash
# Bump minor version (e.g., 0.8.0 → 0.9.0)
yarn release:minor

# Push changes and tag
git push origin trunk --follow-tags
```

#### 3. Major Release (Breaking Changes)

```bash
# Bump major version (e.g., 0.8.0 → 1.0.0)
yarn release:major

# Push changes and tag
git push origin trunk --follow-tags
```

### Method 2: Manual Versioning

#### Step 1: Update Version

```bash
# Patch version
yarn version:patch

# Minor version
yarn version:minor

# Major version
yarn version:major
```

#### Step 2: Commit Changes

```bash
# Add package.json
git add package.json

# Commit with version message
git commit -m "chore: bump version to X.Y.Z"
```

#### Step 3: Create Tag

```bash
# Create annotated tag
git tag -a vX.Y.Z -m "Release vX.Y.Z"

# Push commits and tags
git push origin trunk --follow-tags
```

---

## Automated Release Workflow

When you push a version tag (e.g., `v1.0.0`), GitHub Actions automatically:

### 1. Generate Changelog
- Extracts commits since last release
- Groups changes by type (feat, fix, docs, etc.)
- Calculates commit count

### 2. Create GitHub Release
- Creates release with version tag
- Attaches auto-generated release notes
- Includes installation instructions
- Links to documentation

### 3. Deploy to Production
- Deploys to Vercel production
- Updates live application
- Notifies team of deployment

### Workflow Triggers

```yaml
on:
  push:
    tags:
      - 'v*.*.*'  # Triggers on v1.0.0, v2.1.3, etc.
```

---

## Release Checklist

Before creating a release, ensure:

### Pre-Release Checks

- [ ] All tests passing (`yarn test:ci`)
- [ ] TypeScript clean (`yarn type-check`)
- [ ] Build successful (`yarn build`)
- [ ] Linting passes (`yarn lint`)
- [ ] Documentation updated
- [ ] CHANGELOG.md updated
- [ ] Version bumped in package.json

### Post-Release Verification

- [ ] GitHub release created
- [ ] Release notes generated
- [ ] Vercel deployment successful
- [ ] Monitoring dashboards working
- [ ] Documentation links valid

---

## Version Naming Conventions

### Tag Format

- **Production Release**: `v1.0.0`
- **Pre-release**: `v1.0.0-beta.1`
- **Release Candidate**: `v1.0.0-rc.1`

### Branch Strategy

- **Main Branch**: `trunk` (production-ready code)
- **Development**: `develop` (integration branch)
- **Features**: `feature/feature-name`
- **Hotfixes**: `hotfix/issue-description`

---

## Example Release Scenarios

### Scenario 1: Bug Fix Release

**Current Version**: v1.0.0  
**Issue**: Authentication bug fixed  
**New Version**: v1.0.1 (PATCH)

```bash
# Fix the bug
git add .
git commit -m "fix: resolve authentication issue"

# Create patch release
yarn release:patch

# Push to trigger release
git push origin trunk --follow-tags
```

### Scenario 2: New Feature Release

**Current Version**: v1.0.1  
**Feature**: Add property filtering  
**New Version**: v1.1.0 (MINOR)

```bash
# Implement feature
git add .
git commit -m "feat: add property filtering feature"

# Create minor release
yarn release:minor

# Push to trigger release
git push origin trunk --follow-tags
```

### Scenario 3: Breaking Change Release

**Current Version**: v1.1.0  
**Change**: API restructure (breaking)  
**New Version**: v2.0.0 (MAJOR)

```bash
# Implement breaking changes
git add .
git commit -m "feat!: restructure API endpoints

BREAKING CHANGE: API endpoints restructured"

# Create major release
yarn release:major

# Push to trigger release
git push origin trunk --follow-tags
```

---

## Rollback Procedure

If a release has issues:

### 1. Revert to Previous Version

```bash
# List tags
git tag -l

# Checkout previous version
git checkout v1.0.0

# Create hotfix branch
git checkout -b hotfix/revert-issue
```

### 2. Deploy Previous Version

```bash
# Manually deploy previous version
vercel --prod --force
```

### 3. Create Hotfix Release

```bash
# Fix the issue
git add .
git commit -m "fix: resolve release issue"

# Merge to trunk
git checkout trunk
git merge hotfix/revert-issue

# Create new patch release
yarn release:patch
git push origin trunk --follow-tags
```

---

## Monitoring Releases

### Check Release Status

```bash
# View all releases
gh release list

# View specific release
gh release view v1.0.0

# View release assets
gh release view v1.0.0 --json assets
```

### Verify Deployment

1. **Vercel Dashboard**: Check deployment status
2. **Grafana**: http://localhost:3001 - Monitor metrics
3. **Application**: Verify features working
4. **Logs**: Check for errors

---

## CI/CD Integration

### GitHub Actions Workflows

1. **`ci-cd.yml`**: Runs on every push
   - Linting
   - Type checking
   - Unit tests
   - Build verification
   - Security audit

2. **`release.yml`**: Runs on version tag push
   - Changelog generation
   - GitHub release creation
   - Vercel deployment
   - Release notifications

### Required Secrets

Configure these in GitHub repository settings:

- `VERCEL_TOKEN`: Vercel authentication token
- `VERCEL_ORG_ID`: Vercel organization ID
- `VERCEL_PROJECT_ID`: Vercel project ID
- `GITHUB_TOKEN`: Automatically provided by GitHub

---

## Troubleshooting

### Issue: Release workflow not triggered

**Solution**: Ensure tag format is correct (`v*.*.*`)

```bash
# Correct format
git tag -a v1.0.0 -m "Release v1.0.0"

# Incorrect formats (won't trigger)
git tag -a 1.0.0 -m "Release 1.0.0"  # Missing 'v'
git tag -a release-1.0.0 -m "..."     # Wrong format
```

### Issue: Version bump not working

**Solution**: Check package.json permissions

```bash
# Ensure file is not locked
chmod 644 package.json

# Retry version bump
yarn version:patch
```

### Issue: Tag already exists

**Solution**: Delete and recreate tag

```bash
# Delete local tag
git tag -d v1.0.0

# Delete remote tag
git push origin :refs/tags/v1.0.0

# Create new tag
git tag -a v1.0.0 -m "Release v1.0.0"
git push origin v1.0.0
```

---

## Best Practices

1. **Always update CHANGELOG.md** before releasing
2. **Test thoroughly** before creating release
3. **Use meaningful commit messages** (conventional commits)
4. **Tag production releases** from `trunk` branch only
5. **Document breaking changes** in commit messages
6. **Monitor deployments** after release
7. **Keep version history** clean and organized

---

## References

- [Semantic Versioning](https://semver.org/)
- [Keep a Changelog](https://keepachangelog.com/)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [GitHub Releases](https://docs.github.com/en/repositories/releasing-projects-on-github)

---

**Last Updated**: October 23, 2025  
**Maintained By**: Development Team  
**Project**: Real Estate Hub
