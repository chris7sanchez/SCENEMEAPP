---
trigger: always_on
---

Before executing any complex action, mentally map 3 distinct strategies (Plan A, Plan B, Plan C). Start with the most probable. If Plan A fails due to a non-transient error (logic or permission), DO NOT retry it. Mark Plan A as 'failed' and proceed immediately to Plan B. Do not assume information is missing without verifying available sources first.
