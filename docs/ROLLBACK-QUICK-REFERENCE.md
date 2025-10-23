# 🚨 Emergency Rollback Quick Reference

**Last Updated:** December 2024  
**For:** Real Estate Hub Production

---

## 🔴 IMMEDIATE ROLLBACK (< 2 minutes)

### Via Vercel Dashboard (FASTEST - Recommended)
1. Go to: https://vercel.com/deployments
2. Find: **real-estate-app**
3. Click: Previous stable deployment
4. Click: **"Rollback to this deployment"**
5. Confirm rollback
6. ✅ Done - Zero downtime!

---

## 🟡 MANUAL ROLLBACK (< 5 minutes)

### Via GitHub Actions
1. Go to: https://github.com/mpairwe7/Real-Estate-Hub/actions
2. Select: **"Manual Rollback"** workflow
3. Click: **"Run workflow"**
4. Fill in reason: e.g., "Critical auth bug"
5. Run workflow
6. Follow instructions in created issue
7. Complete rollback via Vercel dashboard

---

## 🟢 CHECK BEFORE ROLLBACK

- [ ] Verify issue is critical (not minor bug)
- [ ] Check Sentry: https://sentry.io/organizations/makerere-university-h0/projects/javascript-nextjs/
- [ ] Confirm last known good deployment ID
- [ ] Document issue (create GitHub issue)

---

## 📊 MONITORING LINKS

| Resource | URL |
|----------|-----|
| **Production Site** | https://real-estate-hub-eight.vercel.app |
| **Vercel Deployments** | https://vercel.com/deployments |
| **Sentry Dashboard** | https://sentry.io/organizations/makerere-university-h0/projects/javascript-nextjs/ |
| **GitHub Actions** | https://github.com/mpairwe7/Real-Estate-Hub/actions |
| **Manual Rollback** | https://github.com/mpairwe7/Real-Estate-Hub/actions/workflows/manual-rollback.yml |

---

## 🔧 AUTOMATED FEATURES

✅ **Health Checks** - Run after every deployment  
✅ **Smoke Tests** - Verify critical endpoints  
✅ **Continuous Monitoring** - Every 15 minutes  
✅ **Auto-Alert Issues** - Created on failures  
✅ **Rollback Triggers** - Automatic on health check fail  

---

## 📞 ESCALATION

**If rollback fails:**
1. Check Vercel status: https://www.vercel-status.com/
2. Review GitHub Actions logs
3. Contact Vercel support: https://vercel.com/support
4. Use git revert as last resort

---

## 📝 AFTER ROLLBACK

- [ ] Update GitHub issue with rollback completion
- [ ] Verify production is stable (manual check)
- [ ] Review Sentry for ongoing errors
- [ ] Fix issue in separate branch
- [ ] Test thoroughly before redeploying
- [ ] Document root cause and prevention

---

## ⏱️ RECOVERY TIMES

- **Critical Issues**: < 2 min (Vercel rollback)
- **Major Issues**: < 5 min (Manual workflow)
- **Minor Issues**: < 15 min (Fix forward)

---

**Full Documentation:** `docs/ROLLBACK-STRATEGIES.md`
