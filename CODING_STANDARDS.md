# Coding Standards & Best Practices

## Overview
This document outlines coding standards and best practices for the GOGOBUS project to prevent common issues and maintain code quality.

---

## 🔴 Critical Issues to Avoid

### 1. Security: Sensitive Data Storage
**Never store sensitive data in:**
- `localStorage`
- `sessionStorage`
- Client-side files
- Version control (even in test files for production)

**What to avoid:**
```javascript
// ❌ BAD
localStorage.setItem('password', password);
localStorage.setItem('secret_key', secretKey);

// ✅ GOOD
// Passwords are only used for API calls, never stored
const { data } = await signUp(email, password);
// Password is automatically cleared from memory after use
```

**For this project:**
- ✅ Already implemented: Passwords are kept in memory only, never in localStorage
- See `auth.js` for proper implementation

---

## ⚠️ Medium Priority: Code Organization

### 2. Duplicate JavaScript/TypeScript Files
**Issue:** Having both `.js` and `.ts` versions of the same file creates confusion about which is used.

**Examples of problematic patterns:**
- `apiClient.js` + `apiClient.ts`
- `useApi.js` + `useApi.ts`
- `useMetrics.js` + `useMetrics.ts`

**Resolution:**
1. **If using TypeScript:** Keep only `.ts` files, delete `.js` versions
2. **If using JavaScript:** Keep only `.js` files, delete `.ts` versions
3. **During migration:** Use a single extension and configure module resolution to prefer TypeScript

**Prevention:**
- Configure module resolution in `tsconfig.json` or `package.json` to prefer TypeScript
- Use ESLint rules to catch duplicate files
- Document migration strategy clearly

**For this project (currently JavaScript):**
- ✅ No TypeScript files exist
- If migrating to TypeScript in the future:
  1. Convert one file at a time
  2. Delete `.js` version after successful conversion
  3. Update imports immediately

---

### 3. React Hooks: useEffect Dependencies
**Issue:** Suppressing ESLint warnings for `useEffect` dependencies without clear documentation.

**Problem pattern:**
```javascript
// ❌ BAD - Suppressed without explanation
useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
}, []); // Why is this empty?
```

**Best practice:**
```javascript
// ✅ GOOD - Documented suppression
useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    // Empty deps intentional: Only run once on mount. 
    // api object is stable from useApi hook and doesn't need to be in deps.
}, []); 
```

**Documentation requirements:**
1. Always explain WHY the dependency is excluded
2. Document what makes the dependency stable (if applicable)
3. Consider if the effect should actually include the dependency

**For this project (currently vanilla JS):**
- Not applicable yet
- If adding React in the future, follow these guidelines

---

### 4. Mock Data in Production Code
**Issue:** Mock data generation code left in production files.

**Problem pattern:**
```typescript
// ❌ BAD - 200 lines of mock data in useMetrics.ts
export function useMetrics() {
    // ... actual code ...
    
    // Mock data generation (should be in separate file)
    const generateMockData = () => {
        // 200 lines of mock data logic
    };
}
```

**Best practice:**
```typescript
// ✅ GOOD - Mock data in separate file
// useMetrics.ts
import { generateMockMetrics } from './__mocks__/metrics.mock';

export function useMetrics() {
    // ... actual code ...
}

// __mocks__/metrics.mock.ts
export function generateMockMetrics() {
    // Mock data generation
}
```

**Organization:**
- `__mocks__/` folder for mock data
- `__tests__/` folder for test utilities
- Clear separation between production and test code

**For this project:**
- ✅ No mock data in production files currently
- If adding tests/mocks, use separate files

---

## 🟢 Low Priority: Configuration & Testing

### 5. CI/CD: Test Passwords and Secrets
**Acceptable practice for CI environments:**
```yaml
# .github/workflows/test.yml
env:
  TEST_SECRET_KEY: test_secret_key_for_ci
  TEST_PASSWORD: TestPassword123!
```

**Important distinctions:**
- ✅ **CI test values:** Acceptable (e.g., `test_secret_key_for_ci`, `TestPassword123!`)
- ❌ **Production secrets:** Never commit to version control
- ✅ **Test environment configs:** Can use obvious test values

**Best practices:**
1. Use obvious test values (e.g., `test_`, `TEST_` prefix)
2. Never use production-like secrets in tests
3. Document that these are test-only values
4. Use environment variable validation to ensure production uses real secrets

**For this project:**
- Currently no CI workflows
- If adding CI:
  ```yaml
  # Example: .github/workflows/test.yml
  env:
    # ✅ Test values - acceptable for CI
    SUPABASE_TEST_KEY: test_key_for_ci_only
    TEST_USER_PASSWORD: TestPassword123!
  ```

---

### 6. E2E Tests: Blocking vs Non-blocking
**Configuration:**
```yaml
# .github/workflows/e2e.yml
env:
  # Non-blocking by default (tests can fail without blocking merge)
  E2E_TESTS_BLOCKING: false
  
  # When stable, set to true
  # E2E_TESTS_BLOCKING: true
```

**Best practice:**
1. **Start non-blocking:** Allow E2E tests to be flaky during development
2. **Document the toggle:** Make it clear how to enable blocking mode
3. **Enable blocking when stable:** Once tests are reliable, set `E2E_TESTS_BLOCKING=true`

**For this project:**
- Currently no E2E tests
- If adding E2E tests:
  ```yaml
  # .github/workflows/e2e.yml
  name: E2E Tests
  on: [push, pull_request]
  
  jobs:
    e2e:
      env:
        # Start non-blocking, enable when stable
        E2E_TESTS_BLOCKING: ${E2E_TESTS_BLOCKING:-false}
      steps:
        - name: Run E2E tests
          run: |
            if [ "$E2E_TESTS_BLOCKING" = "true" ]; then
              npm run test:e2e -- --fail-on-error
            else
              npm run test:e2e || echo "E2E tests failed but not blocking"
            fi
  ```

---

## 📋 Checklist for Future Development

### When Adding New Features:
- [ ] No sensitive data in localStorage/sessionStorage
- [ ] No duplicate `.js`/`.ts` files
- [ ] All ESLint suppressions documented
- [ ] Mock data in separate files
- [ ] Test secrets are clearly test-only
- [ ] E2E tests configured appropriately

### When Migrating to TypeScript:
- [ ] Remove all `.js` duplicates
- [ ] Update module resolution config
- [ ] Update all imports
- [ ] Test module resolution order

### When Adding React:
- [ ] Document all `useEffect` dependency suppressions
- [ ] Separate mock data from production code
- [ ] Follow React hooks best practices

---

## 🔗 Related Documentation

- [PR_REVIEW.md](./PR_REVIEW.md) - PR review guidelines
- [APP_LAYOUT.md](./APP_LAYOUT.md) - Application architecture
- [MVP_SETUP.md](./MVP_SETUP.md) - Setup instructions

---

## 📝 Notes

**Current Project Status:**
- ✅ Vanilla JavaScript (no TypeScript)
- ✅ No React (no hooks issues)
- ✅ No duplicate file issues
- ✅ Security best practices implemented (passwords not in localStorage)
- ⚠️ No CI/CD workflows yet
- ⚠️ No E2E tests yet

**Future Considerations:**
- If migrating to TypeScript, follow duplicate file guidelines
- If adding React, follow hooks documentation guidelines
- If adding CI/CD, follow test secrets guidelines
