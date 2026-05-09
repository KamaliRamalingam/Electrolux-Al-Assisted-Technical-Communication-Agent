# Internal Project Documentation: Connected Kitchen IoT Platform (CK-IoT)
**Project Code:** NEXUS-CK-2024
**Status:** Operational / Scaling
**Owner:** Digital Transformation & Connected Ecosystems (DTCE)

## 1. Project Overview
The Connected Kitchen IoT Platform (CK-IoT) is the backbone of our consumer-facing smart appliance strategy. It provides the persistent connectivity layer for our next-generation smart ovens, connected refrigerators, and modular kitchen suites. The primary objective of CK-IoT is to transform the kitchen from a collection of isolated hardware units into a synchronized, data-driven ecosystem. 

By leveraging real-time telemetry and cloud-native orchestration, CK-IoT enables features such as remote preheating, recipe synchronization, internal refrigerator camera feeds, and automated maintenance alerts. The platform currently supports over 4.2 million active devices globally, with a growth projection of 25% YoY.

## 2. Architecture Description
The architecture follows a hybrid edge-to-cloud model designed for high availability and sub-second latency for critical commands.

### 2.1 Edge Layer
Each appliance runs a custom Linux-based OS (ApplianceOS) with a dedicated IoT agent. Communication is handled via MQTT over TLS 1.3. Devices utilize a "Shadow State" pattern where the cloud maintains a virtual twin of the appliance state, allowing for asynchronous updates.

### 2.2 Ingestion & Messaging
- **Azure IoT Hub / AWS IoT Core:** Acts as the primary gateway for device authentication and message routing.
- **Apache Kafka:** Used for high-throughput message streaming. Telemetry data is partitioned by region and device type to ensure linear scalability.

### 2.3 Microservices Layer (Kubernetes)
The core logic resides in a multi-region Kubernetes (AKS/EKS) cluster. Key services include:
- **Device-Registry-Service:** Manages device metadata and ownership mapping.
- **Command-Proxy-Service:** Validates and routes remote control commands (e.g., "Start Oven") with strict safety checks.
- **Telemetry-Aggregator:** Processes raw sensor data (temperature, power consumption, door cycles).
- **User-Appliance-Linker:** Manages the mapping between mobile application users and their physical hardware.

## 3. Cloud Infrastructure Details
The platform is hosted primarily on **Azure**, utilizing a multi-region active-active setup (North Europe, East US, Southeast Asia).
- **Compute:** Azure Kubernetes Service (AKS) with auto-scaling node pools.
- **Storage:** CosmosDB for real-time state storage (low latency) and Azure Data Lake Storage (ADLS) for long-term telemetry archiving.
- **Networking:** Azure Front Door for global load balancing and API Gateway for rate limiting and JWT validation.

## 4. Operational Workflows
### 4.1 Device Onboarding (Pairing)
1. User initiates pairing via the mobile app.
2. Appliance generates a secure BLE (Bluetooth Low Energy) beacon.
3. Mobile app captures the beacon and transmits the local Wi-Fi credentials.
4. Appliance connects to the CK-IoT Gateway and performs mutual TLS (mTLS) handshake.
5. Cloud registers the device-user association.

### 4.2 Telemetry Pipeline
Sensors transmit data every 30 seconds (or immediately on state change). Data flows through IoT Hub -> Kafka -> Telemetry-Aggregator -> CosmosDB. High-priority events (e.g., "Critical Temperature Drop") trigger immediate push notifications via the Notification-Service.

## 5. Engineering Challenges
- **Network Flakiness:** Dealing with unstable home Wi-Fi networks requires robust retry logic and exponential backoff at the edge.
- **Security at Scale:** Managing millions of unique X.509 certificates and ensuring rotation without disrupting service.
- **Data Volume:** Processing 500k+ events per second during peak hours (dinner time in Europe/North America).

## 6. Deployment Pipeline (CI/CD)
We utilize **GitHub Actions** and **ArgoCD** for GitOps-based deployments.
- **Build Stage:** Docker images are built and scanned for vulnerabilities using Snyk.
- **Staging:** Automated integration tests run against a simulated device fleet (1,000 virtual appliances).
- **Production:** Canary deployments are performed using Istio service mesh, routing 5% of traffic to the new version and monitoring error rates before full rollout.

## 7. Monitoring and Analytics
- **Observability:** Prometheus and Grafana for infrastructure metrics.
- **Tracing:** Jaeger for distributed tracing across microservices.
- **Business Logic:** Custom dashboards track "Appliance Active Hours" and "Feature Engagement" (e.g., how many people actually use the 'Steam Bake' function).

## 8. Technical Incident Scenarios
### Incident A: Telemetry Ingestion Delay (P2)
- **Description:** A surge in telemetry data from a new firmware version caused a lag in the Kafka consumer group.
- **Symptom:** Users reported that their mobile apps showed "Oven Off" while the physical appliance was running.
- **Resolution:** Scaled the Telemetry-Aggregator pods by 3x and repartitioned the Kafka topics to allow higher concurrency.

### Incident B: Kubernetes Ingress Failure (P1)
- **Description:** An incorrect NGINX Ingress configuration update led to 404 errors for all API calls in the North Europe region.
- **Symptom:** Total loss of remote control functionality for 1.2M users.
- **Resolution:** ArgoCD automated rollback to the previous known-good state within 4 minutes of the alert firing.

## 9. Business Impact
CK-IoT is not just a technical platform; it is a revenue driver. It enables "Services as a Product," such as filter subscription renewals based on actual usage rather than time, and reduces warranty costs by 15% through proactive remote diagnostics. Failure of this platform results in significant brand damage and loss of consumer trust in our "Smart" value proposition.
