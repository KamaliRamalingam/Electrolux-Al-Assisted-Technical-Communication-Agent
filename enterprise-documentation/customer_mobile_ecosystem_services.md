# Internal Project Documentation: Customer Mobile Ecosystem & Services (CMES)
**Project Code:** VIBE-MOBILE-2024
**Status:** Production / Scaling
**Owner:** Consumer Experience & Mobile (CXM)

## 1. Project Overview
The Customer Mobile Ecosystem & Services (CMES) is the primary touchpoint for our digital consumers. It encompasses the "MyAppliance" mobile application (iOS/Android), the cloud-based user profile system, and the "Command & Control" infrastructure that bridges the gap between a user's smartphone and their physical kitchen appliances. 

CMES is designed to deliver a premium, intuitive experience that goes beyond simple remote control. It includes curated recipe content, energy-saving insights, consumable replenishment (e.g., auto-ordering dishwasher tabs), and direct-to-technician service scheduling.

## 2. Architecture Description
The CMES follows a "Mobile-Backend-as-a-Service" (MBaaS) architecture pattern, optimized for low latency and high concurrency.

### 2.1 Mobile Application (Frontend)
- **Framework:** React Native for cross-platform development, allowing for a single codebase for iOS and Android.
- **Local State:** Redux with persistence for offline access to manual and saved recipes.
- **Real-time:** WebSockets for receiving live updates from appliances (e.g., "Oven preheat complete").

### 2.2 Backend Services (Azure)
- **Auth-Service:** Leverages Azure AD B2C for secure user authentication, supporting Social Login (Google, Apple) and Multi-Factor Authentication (MFA).
- **Pairing-Service:** Coordinates the secure handshake between the app and the appliance (via the CK-IoT platform).
- **Sync-Service:** Manages the "User Profile"—preferences, saved settings, and appliance nicknames—ensuring they are consistent across multiple mobile devices.
- **Notification-Service:** Integrates with Firebase Cloud Messaging (FCM) and Apple Push Notification service (APNs).

### 2.3 Engagement Engine
- **Analytics-Service:** Collects anonymized usage data to understand which app features are most popular.
- **Personalization-Service:** Suggests recipes or maintenance tips based on the specific models owned by the user.

## 3. Operational Workflows
### 3.1 Remote Control Safety Loop
To prevent accidents (e.g., starting an oven with something inside), the system implements a "Remote Start Enable" (RSE) safety check:
1. User must physically press an "Enable Remote" button on the appliance.
2. The appliance sends a "Safety Armed" signal to the cloud.
3. The mobile app UI unlocks the "Start" button.
4. If the appliance door is opened, the "Safety Armed" state is revoked, and the mobile app is immediately notified to re-lock the controls.

### 3.2 Push Notification Pipeline
Events from the IoT platform (e.g., "Fridge Door Open") are picked up by the **Notification-Service**, which checks the user's "Do Not Disturb" settings and regional language preferences before dispatching the message to the appropriate mobile platform.

## 4. Cloud Infrastructure Details
- **App Hosting:** Azure App Service for APIs.
- **Database:** Azure SQL Database for user profiles and CosmosDB for high-speed session data.
- **Cache:** Redis Cache to reduce database load for frequently accessed data like recipe libraries.
- **CDN:** Azure CDN for delivering high-resolution recipe images and videos.

## 5. Engineering Challenges
- **Authentication Token Management:** Ensuring users stay logged in across app updates while maintaining high security.
- **Device Fragmentation:** Supporting thousands of different Android device models with varying screen sizes and OS versions.
- **Sync Reliability:** What happens if a user renames their oven on their iPad while their iPhone is offline? Implementing robust CRDT (Conflict-free Replicated Data Type) logic is essential.

## 6. Deployment Pipelines (CI/CD)
- **Mobile:** Automated builds using **Fastlane** and **App Center**, with internal distribution to "Beta" testers before App Store submission.
- **Backend:** Azure DevOps pipelines with automated Blue/Green deployments to ensure zero downtime during service updates.

## 7. Technical Incident Scenarios
### Incident A: Authentication Token Expiry Wave (P1)
- **Description:** A misconfiguration in the JWT (JSON Web Token) refresh logic caused 500k users to be logged out simultaneously on a Friday evening.
- **Symptom:** Mass user frustration; social media backlash; Customer Service lines overwhelmed by "Login Failed" reports.
- **Resolution:** Emergency hotfix to the Auth-Service to extend token lifetimes temporarily; implemented a "Phased Re-login" strategy to prevent a DDOS effect on the Auth servers.

### Incident B: Remote Control Sync Instability (P2)
- **Description:** A latency spike in the Global Redis cluster led to a "Race Condition" where the mobile app showed an appliance as "Offline" even when it was connected.
- **Symptom:** Users could not send commands to their appliances; the app state was inconsistent with the physical hardware.
- **Resolution:** Implemented a "Fallback Polling" mechanism in the mobile app; moved to a multi-region Redis configuration with better synchronization guarantees.

## 8. Integration Systems
- **Zendesk:** For in-app customer support chat.
- **Braze:** For managing marketing campaigns and personalized user journeys.
- **Stripe:** For handling "Consumable" subscriptions and service part purchases.

## 9. Business Impact
The CMES is the key to "Customer Lifetime Value" (CLV). By providing a seamless digital experience, we increase brand loyalty and create a direct communication channel with the consumer. This platform allows us to transition from a "Hardware Seller" to a "Service Provider," enabling new business models like recipe-based grocery delivery and predictive maintenance contracts.
