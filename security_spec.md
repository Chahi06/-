# Security Specification & Threat Model

## 1. Data Invariants
- **Identity Invariant**: A user document at `/users/{userId}` can only be created or modified if `request.auth.uid == userId` or the caller is a verified admin (`azc1744@gmail.com` or in `/admins/{uid}`).
- **Role Escalation Protection**: Regular users cannot elevate their role to `admin` or change `subscriptionStatus` to `premium` arbitrarily without administrative authorization.
- **Admin Invariant**: Only verified administrators can create, update, or delete curriculum data (Subjects, Lessons, Summaries).
- **Public Educational Access**: Curriculum data (Subjects, Lessons, Summaries) can be read by all users (or authenticated users).
- **Progress Isolation**: Student progress at `/progress/{userId}` can only be accessed and mutated by the owning user (`request.auth.uid == userId`).

## 2. The "Dirty Dozen" Threat Payloads
1. **Unauthenticated Write to Subjects**: Anonymous user attempting to mutate `/subjects/sub-01`. (Must FAIL)
2. **Unauthenticated Write to Lessons**: Anonymous user attempting to create or delete `/lessons/les-01`. (Must FAIL)
3. **Student Modifying Lesson**: Standard student attempting to edit lesson content. (Must FAIL)
4. **Role Escalation in User Profile**: User attempting to set their role to `admin` during profile update. (Must FAIL)
5. **Subscription Status Spoofing**: User attempting to set `subscriptionStatus` to `premium` directly. (Must FAIL)
6. **Reading Other Student's Progress**: User A attempting to get `/progress/userB`. (Must FAIL)
7. **Mutating Other Student's Progress**: User A attempting to write `/progress/userB`. (Must FAIL)
8. **Malicious Long Strings (Denial of Wallet)**: Injection of 2MB payload into `lesson.title`. (Must FAIL)
9. **Admin Directory Self-Registration**: Regular user writing their UID into `/admins/{uid}`. (Must FAIL)
10. **ID Poisoning Attack**: Attempting to write document with 2000 character ID. (Must FAIL)
11. **Shadow Fields Injection**: Writing undeclared attributes like `__isAdmin: true` or `backdoor: true`. (Must FAIL)
12. **Unverified Email Impersonation**: Attempting admin operations with unverified email token. (Must FAIL)
