# GitHub Pages Setup for PR Previews

This repository uses **branch-based deployment** to support PR preview deployments alongside the main production site.

## ⚙️ Required GitHub Pages Settings

After merging these workflow changes, you **MUST** update your repository's GitHub Pages settings:

### Steps to Configure

1. **Go to Repository Settings**
   - Navigate to: `Settings` → `Pages`

2. **Change Source to "Deploy from a branch"**
   - Under **"Build and deployment"**
   - **Source:** Select `Deploy from a branch` (NOT "GitHub Actions")

3. **Select the gh-pages branch**
   - **Branch:** Select `gh-pages`
   - **Folder:** Select `/ (root)`

4. **Save the settings**

### Visual Reference

```
Settings → Pages
├── Build and deployment
│   ├── Source: Deploy from a branch ✓
│   └── Branch: gh-pages / (root) ✓
```

## 🔍 Why This Configuration?

### The Problem with "GitHub Actions" Source

- The newer "GitHub Actions" deployment source uses `actions/deploy-pages`
- This method is **incompatible** with PR preview actions
- PR previews push to the `gh-pages` branch, but GitHub Actions source doesn't read from it
- Result: PR preview deployments are created but never served (404 errors)

### Branch-Based Deployment Solution

- ✅ Main production deploys to `gh-pages` branch (root)
- ✅ PR previews deploy to `gh-pages/pr-preview/pr-{number}/`
- ✅ Main deployment uses `clean-exclude: pr-preview` to preserve PR previews
- ✅ All content served from single branch
- ✅ No conflicts between production and previews

## 📁 Deployment Structure

After setup, your `gh-pages` branch will contain:

```
gh-pages/
├── index.html              # Main production site
├── blog/                   # Production blog
├── r/                      # Production registry
│   └── notion-blog.json
├── _next/                  # Production assets
└── pr-preview/             # PR preview umbrella folder
    ├── pr-5/               # Preview for PR #5
    │   ├── index.html
    │   ├── blog/
    │   └── r/
    │       └── notion-blog.json
    └── pr-12/              # Preview for PR #12
        ├── index.html
        ├── blog/
        └── r/
            └── notion-blog.json
```

## 🌐 URLs After Setup

- **Production:** `https://notion-as-cms.github.io/`
- **PR #5 Preview:** `https://notion-as-cms.github.io/pr-preview/pr-5/`
- **PR #5 Registry:** `https://notion-as-cms.github.io/pr-preview/pr-5/r/notion-blog.json`

## ✅ Verification

After changing the settings:

1. **Push to main branch** - Should deploy to root of site
2. **Create a test PR** - Should get a preview at `/pr-preview/pr-{number}/`
3. **Check PR comment** - Should receive automated comment with preview URL
4. **Merge/Close PR** - Preview should be automatically removed

## 🚨 Important Notes

- **Don't skip this step!** The workflows will run but previews won't be accessible without this configuration
- **Existing GitHub Actions deployments** will continue to work until you change this setting
- **gh-pages branch** will be automatically created by the first deployment
- **CNAME files** are preserved automatically if you have a custom domain

## 🔄 Migration from GitHub Actions Source

If you're currently using "GitHub Actions" as your source:

1. Wait for one successful deployment to `main` after merging
2. This creates the `gh-pages` branch with your site
3. Change the Pages source to "Deploy from a branch"
4. Select `gh-pages` as the branch
5. Future deployments will use the branch-based method

## 🐛 Troubleshooting

**Preview shows 404:**
- ✅ Verify Pages source is set to "Deploy from a branch"
- ✅ Check `gh-pages` branch exists and has content
- ✅ Ensure branch is selected as `gh-pages / (root)`

**Production site broken:**
- ✅ Check that main deployment completed successfully
- ✅ Verify `gh-pages` branch has files at root level
- ✅ Check GitHub Actions logs for deployment errors

**PR previews overwritten:**
- ✅ Ensure `deploy.yml` has `clean-exclude: pr-preview`
- ✅ Verify `force: false` is set in main deployment

---

**Questions?** Open an issue in the repository.
