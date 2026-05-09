# Internal Project Documentation: Global Supply Chain Visibility & Logistics (GSCV)
**Project Code:** LOGIC-TRANSIT-2024
**Status:** Operational / Optimizing
**Owner:** Global Supply Chain & Logistics (GSCL)

## 1. Project Overview
The Global Supply Chain Visibility (GSCV) platform is the nervous system of our logistics operations. It provides an end-to-end view of the journey an appliance takes—from a component arriving at a factory to a finished product being delivered to a customer's doorstep. GSCV integrates hundreds of disparate systems, including SAP ERP, third-party logistics (3PL) providers, shipping line APIs, and warehouse management systems (WMS).

The primary objective is to eliminate "black holes" in the supply chain, allowing for accurate delivery forecasting, inventory optimization, and rapid response to global disruptions (e.g., port strikes or canal blockages).

## 2. Architecture Description
GSCV is built on a **Message-Driven Architecture** to handle the highly asynchronous nature of global logistics.

### 2.1 Integration Layer (The Connector)
- **SAP Gateway:** Extracts real-time purchase orders, production schedules, and inventory levels.
- **Carrier-API-Hub:** A set of microservices that normalize data from 50+ different shipping companies and 3PLs into a standard "Logistics Event" format.
- **EDI-Adapter:** Handles legacy Electronic Data Interchange (EDI) transmissions still common in the shipping industry.

### 2.2 Intelligence Layer (Kubernetes)
- **Forecasting-Service:** Uses historical lead times and current transit data to provide "Estimated Time of Arrival" (ETA) with confidence intervals.
- **Inventory-Sync-Service:** Ensures that the "Available to Promise" (ATP) quantity in our web-shop matches the physical reality in our regional distribution centers.
- **Exception-Manager:** Identifies "Stalled Shipments"—units that haven't moved in X days—and flags them for human intervention.

### 2.3 Presentation Layer
- **Control-Tower:** A sophisticated React-based map interface for logistics managers to track global flows.
- **External-Portal:** Allows retail partners (e.g., Best Buy, IKEA) to track their incoming orders.

## 3. Cloud Infrastructure Details
The platform is hosted on **AWS**, leveraging its robust networking and integration tools.
- **Messaging:** Amazon SQS for task queuing and Amazon SNS for event broadcasting.
- **Storage:** Amazon Aurora (PostgreSQL) for transactional data and Amazon Redshift for logistics analytics and historical reporting.
- **Compute:** AWS Fargate for serverless container execution of periodic "Sync Jobs."
- **Security:** AWS Secrets Manager for managing API keys and certificates for hundreds of external partners.

## 4. Operational Workflows
### 4.1 Order-to-Delivery Tracking
1. SAP generates an "Outbound Delivery" when a pallet leaves the factory.
2. GSCV captures this event and initiates a "Transit Object."
3. As the pallet is scanned at a warehouse, onto a truck, and into a shipping container, "Scan Events" are pushed to GSCV via Webhooks or EDI.
4. The **Forecasting-Service** updates the ETA at each step.
5. Upon final delivery to the customer, the "Transit Object" is closed and archived.

## 5. Engineering Challenges
- **Data Fragmentation:** Every logistics partner uses different formats (XML, JSON, CSV, EDIFACT). Normalizing this data without losing context is a major engineering effort.
- **Scalability of "Sync":** During peak season (Black Friday), the number of inventory updates per second increases by 10x.
- **API Throttling:** Many legacy 3PL systems cannot handle high-frequency polling. We must implement sophisticated rate-limiting and backoff strategies to avoid being blacklisted.

## 6. Technical Incident Scenarios
### Incident A: Inventory Synchronization Lag (P2)
- **Description:** A failure in the SAP-to-GSCV connector caused a 6-hour delay in inventory updates for the North American region.
- **Symptom:** Customers were able to purchase "In-Stock" refrigerators that were actually sold out, leading to 1,500 cancelled orders and customer dissatisfaction.
- **Resolution:** Re-architected the connector to use a "Delta-Push" model instead of a "Full-Pull" model; implemented an "Inventory Buffer" in the web-shop to prevent overselling during sync delays.

### Incident B: Warehouse Integration Outage (P1)
- **Description:** A global DNS failure prevented our regional distribution centers from reaching the GSCV API.
- **Symptom:** Trucks were backed up at warehouse gates because the systems could not "Check-In" the shipments.
- **Resolution:** Implemented "Offline-First" capabilities at the warehouse gateways; scan data is now cached locally and automatically synced once connectivity is restored.

## 7. Business Impact
GSCV has reduced "Inventory In Transit" by 8%, freeing up millions in working capital. By providing accurate ETAs, we have reduced customer service calls related to "Where is my order?" by 20%. The system also allows the company to be agile; if a port is closed, GSCV can automatically identify all affected shipments and suggest alternative routing or prioritize the most critical orders for air-freight.

## 8. Monitoring & Analytics
- **CloudWatch:** Monitoring API latency and error rates.
- **Logz.io:** Centralized logging for troubleshooting complex multi-step integration failures.
- **Custom "Logistics Health" Dashboard:** Tracks the "Age of Data" for every major carrier (e.g., "Maersk data is 4 hours old").
