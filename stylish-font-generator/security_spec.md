# Firestore Hardened Security Specification

## 1. Data Invariants
- **Authentication Constraint**: Only authenticated users with verified emails (if checked) can manipulate their user documents.
- **Relational Ownership**: A user profile path must strictly match their authenticated UID: `match /users/{userId}` where `userId === request.auth.uid`. No user can read, list, update, or delete another user's profile.
- **Strict Keys**: No additional fields are permitted on the UserProfile document. Allowed keys are `userId`, `favorites`, `history`, and `updatedAt`.
- **Identity Invariant**: The `userId` property within the profile payload must strictly match the owner's `request.auth.uid` and remain immutable once created.
- **Bounds Enforcements**:
  - `favorites` must be a list of strings with `size` <= 100.
  - `history` must be a list of custom history structures with `size` <= 20.
  - Input text within `history` must have a length limit (e.g., `originalText.size() <= 1000`).

---

## 2. The "Dirty Dozen" Malicious Payloads

The following payloads and operations must be explicitly rejected by the Firestore security rules.

### Operation 1: Unauthenticated Read
- **Request**: Unauthenticated API call to fetch `users/user_alice`.
- **Expected Outcome**: `PERMISSION_DENIED`

### Operation 2: Unauthenticated Write
- **Request**: Unauthenticated API call to write `users/user_alice`.
- **Expected Outcome**: `PERMISSION_DENIED`

### Operation 3: Identity Spoofing (Foreign Document Access)
- **Actor/Auth**: `uid: "user_bob"`
- **Request**: Read `users/user_alice`
- **Expected Outcome**: `PERMISSION_DENIED`

### Operation 4: Identity Spoofing (Foreign Document Creation)
- **Actor/Auth**: `uid: "user_bob"`
- **Request**: Create `users/user_alice` with payload:
  ```json
  {
    "userId": "user_bob",
    "favorites": [],
    "history": []
  }
  ```
- **Expected Outcome**: `PERMISSION_DENIED`

### Operation 5: Path Variable Poisoning
- **Actor/Auth**: `uid: "user_alice"`
- **Request**: Create `users/invalid-id-@#%$-poisoning-attempt`
- **Expected Outcome**: `PERMISSION_DENIED` (fails `isValidId()` guard on document ID).

### Operation 6: Payload Injection / Key Spoofing (Shadow Fields)
- **Actor/Auth**: `uid: "user_alice"`
- **Request**: Create `users/user_alice` with:
  ```json
  {
    "userId": "user_alice",
    "favorites": [],
    "history": [],
    "isAdmin": true,
    "role": "god_mode"
  }
  ```
- **Expected Outcome**: `PERMISSION_DENIED` (Fails key size or strict key matching).

### Operation 7: Internal Relational Spoofing
- **Actor/Auth**: `uid: "user_alice"`
- **Request**: Create `users/user_alice` specifying a mismatched `userId` inside the JSON data:
  ```json
  {
    "userId": "user_bob",
    "favorites": [],
    "history": []
  }
  ```
- **Expected Outcome**: `PERMISSION_DENIED` (fails `userId == request.auth.uid`).

### Operation 8: Denial of Wallet (Size Abuse - Favorites bloat)
- **Actor/Auth**: `uid: "user_alice"`
- **Request**: Create profile updating `favorites` to an array containing 10,000 strings.
- **Expected Outcome**: `PERMISSION_DENIED`

### Operation 9: Denial of Wallet (Size Abuse - History bloat)
- **Actor/Auth**: `uid: "user_alice"`
- **Request**: Create profile updating `history` to an array containing 1,000 history objects.
- **Expected Outcome**: `PERMISSION_DENIED`

### Operation 10: Structural Type Pollution
- **Actor/Auth**: `uid: "user_alice"`
- **Request**: Update profile sending a string to `favorites` instead of an array:
  ```json
  {
    "userId": "user_alice",
    "favorites": "not-an-array-but-long-text",
    "history": []
  }
  ```
- **Expected Outcome**: `PERMISSION_DENIED`

### Operation 11: Invalid Timestamp Spoofing
- **Actor/Auth**: `uid: "user_alice"`
- **Request**: Update profile specifying `updatedAt` as a static client-side date rather than matching `request.time`.
- **Expected Outcome**: `PERMISSION_DENIED`

### Operation 12: Immutable Attribute Mutation
- **Actor/Auth**: `uid: "user_alice"`
- **Request**: Update profile to change `userId` value to `"user_eve"`.
- **Expected Outcome**: `PERMISSION_DENIED`

---

## 3. The Unit Test Specification

```typescript
// Test suites describing mock assertions
import { initializeTestEnvironment, RulesTestEnvironment } from "@firebase/rules-unit-testing";
import { readFileSync } from "fs";

describe("Firestore Security Rules Tests", () => {
  let testEnv: RulesTestEnvironment;

  before(async () => {
    testEnv = await initializeTestEnvironment({
      projectId: "stunning-range-rrwfn",
      firestore: {
        rules: readFileSync("firestore.rules", "utf8")
      }
    });
  });

  after(async () => {
    await testEnv.cleanup();
  });

  it("should prevent unauthenticated access", async () => {
    const unauthDb = testEnv.unauthenticatedContext().firestore();
    // assertions checking unauthenticated read/write blocks
  });

  it("should force relational ownership matching request.auth.uid", async () => {
    const aliceDb = testEnv.authenticatedContext("alice").firestore();
    // Alice can read/write users/alice but not users/bob
  });
});
```
