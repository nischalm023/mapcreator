# Playwright Test Suite for nischalm023/mapcreator

Senior QA Engineer Test Automation Suite. All testing code is isolated in the `qa-studio/playwright-setup-e9f1db8c` branch.

## QA Workflow & Guidelines
1. **Branch Isolation**: All testing activities run on `qa-studio/playwright-setup-e9f1db8c`. Never modify the default/main branch or application production code.
2. **Execute Test Suite**: Run and validate test cases against the selected repository.
3. **Failure Analysis & Root Cause Diagnosis**: Determine exact root causes for any failing test cases.
4. **Fix Test Cases**: Repair broken or incorrect test cases without changing production code.
5. **Re-Run & Verification**: Re-run tests to verify fixes until green.
6. **Final QA Report**: Summarize passed tests, failed tests, fixes made, and recommendations.

## Running Tests Locally

```bash
# Install dependencies
npm install

# Run all tests
npx playwright test

# Run tests in UI mode
npx playwright test --ui

# Run specific tag (e.g. @smoke, @critical)
npx playwright test --grep @smoke
```
