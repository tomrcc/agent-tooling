---
description: Describes the overall mission of this project.
alwaysApply: true
---

We are working on developing tooling for agents that will assist in making a site suitable for editing on CloudCannon - a git based CMS for SSGs. 

In particular we are wanting to develop a set of skills files, which we can give to prospective customers. In future if they are being received well, we may also incorporate an AI agent in the CMS itself, which would be armed with these skills. 

I will be starting with templates that have no knowledge of CloudCannon, using an agent to modify them so they are suitable for CloudCannon, and updating our skills and rules along the way. These are active, living documents which agents should modify as they see fit.

We will keep each template we work on so that we can accumulate a bunch of CloudCannon-ready templates, as well as fulfilling our main goal of developing files that help AI agents help users onto CloudCannon.

We should write scripts for any parts of these migrations to CloudCannon that can be done programmatically and deterministically. This way we can save them for future use in order to save tokens, and make the whole process more consistent. There will be many parts of these migrations that are only suitable for AI agents, but we want to minimise those to as few places as possible, and lean on scripts where we can.