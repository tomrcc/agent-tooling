# Config Generation Eval

Run Phase 2 of the CloudCannon migration skill against this template.

Generate a baseline `cloudcannon.config.yml` and `.cloudcannon/initial-site-settings.json` using the Gadget CLI, then customize based on the site's content structure.

Specifically:

1. Run `gadget generate --auto --init-settings` from the template root
2. Review the generated config against the site's actual content collections
3. Customize: define `_inputs`, `_structures`, `collection_groups`, and any other relevant config keys based on the site's content model
4. Ensure the build command and output path are correct

Do not proceed to other migration phases. Stop after config generation is complete.
