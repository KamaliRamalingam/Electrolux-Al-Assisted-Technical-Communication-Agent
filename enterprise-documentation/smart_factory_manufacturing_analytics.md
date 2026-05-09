# Internal Project Documentation: Smart Factory Manufacturing Analytics (SF-MA)
**Project Code:** INDUSTRIAL-IQ-2024
**Status:** Rollout (Phase 3)
**Owner:** Global Manufacturing Excellence (GME)

## 1. Project Overview
Smart Factory Manufacturing Analytics (SF-MA) is our flagship Industry 4.0 initiative. It aims to digitize the shop floor across our 25+ global manufacturing facilities. By integrating IoT sensors into robotic assembly lines, plastic injection molding machines, and automated testing stations, SF-MA provides a real-time "Digital Twin" of our production environment.

The primary goals are to increase OEE (Overall Equipment Effectiveness), reduce unplanned downtime via predictive maintenance, and ensure 100% quality traceability for every serial number produced.

## 2. Architecture Description
The architecture is based on the **ISA-95** standard but modernized with cloud-native technologies.

### 2.1 Factory Edge
Each factory hosts a local **Edge Gateway** (running Ubuntu with K3s). This gateway performs:
- **Protocol Translation:** Converting OPC-UA, Modbus, and Profinet data from legacy PLCs (Programmable Logic Controllers) into JSON/MQTT.
- **Local Analytics:** Running lightweight anomaly detection models to catch immediate failures without waiting for cloud latency.
- **Data Buffering:** Ensuring no data loss during WAN outages.

### 2.2 Cloud Ingestion (Azure)
- **Azure IoT Edge:** Manages the deployment of containerized modules to the factory floor.
- **Stream Analytics:** Filters and aggregates the massive influx of sensor data (vibration, temperature, cycle time).
- **Time-Series Insights:** Provides a high-performance store for historical sensor data, allowing engineers to "rewind" the assembly line state during a quality post-mortem.

### 2.3 Analytics & Visualization
- **Predictive-Maintenance-Engine:** A microservice that analyzes vibration signatures from robotic arms to predict bearing failures.
- **Operational-Dashboards:** High-visibility screens placed throughout the factory showing real-time KPIs vs. targets.

## 3. Operational Workflows
### 3.1 Anomaly Detection & Alerting
1. A sensor on a motor detects a vibration spike exceeding the 3-sigma threshold.
2. The Edge Gateway flags this as a "Potential Failure."
3. The event is pushed to the cloud.
4. The **Incident-Service** triggers a "Maintenance Request" in the local CMMS (Computerized Maintenance Management System).
5. A technician receives a notification on their ruggedized tablet with the exact part location and failure probability.

### 3.2 Quality Traceability
Every appliance serial number is linked to its "Birth Certificate"—a dataset containing the exact torque applied to every screw, the ambient temperature during the paint process, and the results of the final electrical safety test.

## 4. Engineering Challenges
- **Legacy Integration:** Connecting to 20-year-old machines that lack modern networking capabilities (often requiring retrofitting with external sensors).
- **Network Reliability:** Factories are "Faraday cages" with significant EMI (Electromagnetic Interference). Ensuring stable Wi-Fi/LTE connectivity is a constant battle.
- **Data Gravity:** A single factory can generate several terabytes of data per day. We must intelligently decide what stays local and what goes to the cloud.

## 5. Deployment Pipelines (CI/CD)
The SF-MA platform uses a "Hybrid CI/CD" approach.
- **Cloud Services:** Standard GitHub Actions to Azure AKS.
- **Edge Modules:** Docker images are pushed to a private registry and then synchronized to factory gateways via **Azure IoT Edge manifests**. This allows for "Zero-Touch" updates to factory floor logic from our central HQ.

## 6. Technical Incident Scenarios
### Incident A: Sensor Synchronization Failure (P2)
- **Description:** A firmware update on the vibration sensors caused them to lose time-sync with the master factory clock.
- **Symptom:** Analytics data showed robotic movements happening *before* the trigger signals, making predictive models useless.
- **Resolution:** Re-implemented PTP (Precision Time Protocol) across the factory VLAN and forced a hard reset on all edge gateways.

### Incident B: Analytics Ingestion Bottleneck (P1)
- **Description:** During a production ramp-up for a new oven model, the volume of "Torque-Check" data exceeded the provisioned throughput of the Azure Stream Analytics job.
- **Symptom:** Real-time dashboards were lagging by 45 minutes; quality alerts were firing long after the units had left the station.
- **Resolution:** Dynamically scaled the Stream Analytics Streaming Units (SUs) and implemented a "Critical Data Path" to bypass non-essential telemetry during peaks.

## 7. Business Impact
SF-MA has already demonstrated a 12% reduction in unplanned downtime in our pilot plant. By predicting a motor failure 48 hours in advance, we can schedule repairs during a planned shift change rather than stopping the line during peak production. Furthermore, if a quality defect is found in the field, we can use SF-MA to identify the exact batch of affected units, reducing recall scope from "All units made in June" to "Specific units made on June 12th between 2 PM and 4 PM."

## 8. Monitoring & Analytics Tools
- **Datadog:** For monitoring the health of the Edge Gateways and Cloud microservices.
- **PowerBI:** For executive-level reporting on global production efficiency.
- **Grafana:** For real-time "War Room" views of the factory floor.
