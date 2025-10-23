# 2015 CD Dependency Diagram

This is the diagram Bryan Finster created to decompose the CD problem for the original pilot.

```mermaid
flowchart TD
%% ========= Nodes =========
%% Top practices
CDD["Contract Driven Development"]:::behavior
BDD["Behavior Driven Development"]:::behavior
SA["Static Analysis"]:::automation
EDBC["Evolutionary Database Change"]:::automation

%% Testing path
CT["Contract Testing"]:::behavior_enabled
FT["Functional Testing"]:::behavior_enabled
DT["Deterministic Tests"]:::behavior_enabled
TBD["Trunk Based Development"]:::behavior

%% Team/backlog path
UTB["Unified Team Backlog"]:::behavior
PF["Prioritized Features"]:::behavior
ED["Evolutionary Development"]:::behavior
DCI["Daily Code Integration"]:::behavior
VD["Versioned Database"]:::automation

%% Build/CI/CD core
BoC["Build on Commit"]:::automation
ABD["automationmated Build & Deploy"]:::automation
CI["Continuous Integration"]:::behavior_enabled
CD["Continuous Delivery"]:::core

%% CD capability areas
AAV["automationmated Artifact Versioning"]:::automation
AEV["automationmated Environment Versioning"]:::automation
ADP["automationmated Database Provisioning"]:::automation
CTG["Continuous Testing"]:::behavior_enabled
MS["Modular System"]:::behavior_enabled
SHS["Self-healing Services"]:::behavior_enabled

%% Testing specializations
PT["Performance Testing"]:::behavior_enabled
IT["Integration Testing"]:::behavior_enabled
ST["Security Testing"]:::behavior_enabled
CTC["Compliance Testing"]:::behavior_enabled

%% Ops/ownership/catalog
AMA["automationmated Monitoring & Alerting"]:::automation
DDO["Developer Driven Operations"]:::behavior
CO["Component Ownership"]:::behavior
SCAT["Service Catalog"]:::behavior

%% ========= Edges =========
%% Foundations -> Tests
CDD --> CT
BDD --> FT
CT --> TBD
FT --> TBD

%% Testing -> Trunk -> CI
DT --> TBD
TBD --> CI

%% Team/backlog/development -> CI
UTB --> PF
PF --> CI
EDBC --> ED
ED --> DCI
DCI --> CI
VD --> CI

%% Build path -> CI
BoC --> ABD --> CI
SA --> CI

%% CI -> CD
CI --> CD

%% Capabilities now point INTO CD
AAV --> CD
AEV --> CD
ADP --> CD
CTG --> CD
MS --> CD
DDO --> CD

%% Capability fan-ins (still make sense hierarchically)
PT --> CTG
IT --> CTG
ST --> CTG
CTC --> CTG

CO --> MS
SCAT --> MS

AMA --> SHS
SHS --> DDO

%% ========= Styling =========
classDef automation fill:#f9d5d3,stroke:#333,stroke-width:1px,color:#111;
classDef behavior_enabled fill:#d7f8d7,stroke:#333,stroke-width:1px,color:#111;
classDef behavior fill:#d7e6ff,stroke:#333,stroke-width:1px,color:#111;
classDef core fill:#ffe66a,stroke:#333,stroke-width:1px,color:#111;
```
