# Pull Request Template - SliqPay

---

### **PR Title:** `[type]: Brief description`

*Example: `feat: Add user authentication module` or `fix: Resolve infinite loop in data processing`*

**Branch:** `[your-branch]` → `main`

---

## **Description**

### **What does this PR do?**

*Provide a clear and concise explanation of the changes introduced in this pull request.*

*Explain the problem it solves, the new feature it adds, or the improvements it brings.*

### **Why is this change necessary?**

*Contextualize the changes. Is it a bug fix for a reported issue? A new feature requested by stakeholders? An optimization for performance?*

*Reference any relevant issues (e.g., `Closes #123`, `Fixes #456`, `Resolves #789`).*

### **How has this been tested?**

*Describe the testing methodology (e.g., unit tests, integration tests, manual testing steps, end-to-end tests).*

*Provide clear instructions or steps for reviewers to verify the changes if manual testing is required.*

**Testing Steps:**
```
1. Step one
2. Step two
3. Step three
```

**Test Results:**
- [ ] All tests pass
- [ ] Manual testing completed
- [ ] No console errors

---

## **Type of change**

*Mark the relevant option(s) with an `x` in the brackets:*

- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update
- [ ] Refactor (code improvement without changing external behavior)
- [ ] Chore (maintenance tasks, e.g., dependency updates, build process changes)

---

## **Checklist**

*Please ensure the following points are addressed before requesting a review:*

- [ ] My code follows the project's coding style guidelines (Prettier, ESLint)
- [ ] I have performed a self-review of my own code
- [ ] I have commented my code, particularly in hard-to-understand areas
- [ ] I have made corresponding changes to the documentation (if applicable)
- [ ] My changes generate no new warnings
- [ ] I have added tests that prove my fix is effective or that my feature works
- [ ] New and existing unit tests pass locally with my changes
- [ ] Any dependent changes have been merged and published in downstream modules
- [ ] I have run `npm run lint` and fixed any issues
- [ ] I have run `npm run build` successfully
- [ ] Database migrations have been created and tested (if applicable)
- [ ] Environment variables documented (if applicable)

---

## **Detailed Changes**

### **Files Changed:**
*List the main files that were created, modified, or deleted*

**Created:**
- `path/to/new/file.ts`

**Modified:**
- `path/to/modified/file.ts`

**Deleted:**
- `path/to/deleted/file.ts`

### **Key Changes:**
*Describe the most important changes in detail*

1. **Change 1:** Description
2. **Change 2:** Description
3. **Change 3:** Description

---

## **Breaking Changes**

*If this PR introduces breaking changes, describe them here and provide migration instructions*

**Breaking:**
- What breaks
- Why it breaks
- How to migrate

**Migration Path:**
```bash
# Steps to migrate
```

---

## **Database Changes**

*If this PR includes database migrations, describe them here*

**Migration Name:** `YYYYMMDDHHMMSS_migration_name`

**Changes:**
- Added columns: `column_name` to `table_name`
- Modified columns: `column_name` in `table_name`
- Removed columns: `column_name` from `table_name`

**Migration Command:**
```bash
npx prisma migrate dev --name migration_name
```

---

## **Environment Variables**

*If this PR requires new environment variables, document them here*

**Added to `.env.local`:**
```bash
NEW_VAR_NAME=value_description
ANOTHER_VAR=description
```

---

## **Screenshots/GIFs (if applicable)**

*Add screenshots or GIFs here to visually demonstrate the changes, especially for UI-related updates*

### Before:
*Screenshot before changes*

### After:
*Screenshot after changes*

---

## **Performance Impact**

*Describe any performance implications of this PR*

**Positive Impacts:**
- Improvement 1
- Improvement 2

**Neutral/Negative Impacts:**
- Impact 1
- Impact 2

---

## **Security Considerations**

*Highlight any security-related changes or considerations*

- Security change 1
- Security change 2

---

## **Known Limitations & Future Improvements**

### **Current Limitations:**
- Limitation 1
- Limitation 2

### **Planned Improvements (Future):**
- [ ] Improvement 1
- [ ] Improvement 2

---

## **Reviewer Notes**

### **Areas to Focus On:**
*Highlight specific areas where you want reviewers to pay special attention*

1. Area 1
2. Area 2
3. Area 3

### **Testing Recommendations:**
*Suggest specific tests reviewers should run*

1. Test scenario 1
2. Test scenario 2

---

## **Additional Notes (Optional)**

*Any other information that might be helpful for the reviewer, such as potential future improvements, known limitations, or specific areas to focus on during review.*

---

## **Related Links**

- **Issue:** #issue-number
- **Documentation:** Link to docs
- **Design:** Link to design files
- **Previous PR:** #pr-number

---

**Prepared by:** Your Name
**Date:** YYYY-MM-DD
**Status:** Ready for Review / WIP / Draft
