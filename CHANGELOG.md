Older entries: [2024](changelog/2024.md), [2023](changelog/2023.md), [2022](changelog/2022.md).

# 2026.11.11

- A big round of housekeeping! ArtBot has been running on years-old foundations, so this update brings everything up to date: Next.js 16, React 19 and a newer version of the database library that stores your images. Your existing images, favorites and settings carry over as they are, and older backups still import.
- Removed: Shareable links and shortlinks. Links shared before this update no longer open.
- Removed: Shared image pages (`/artbot?i=...`) and the community Showcase.
- Removed: The "Use all models" option. It only ever created one image.
- Removed: The unfinished upscale page and the old SDXL beta image rating.
- Fix: Restoring backups with large saved input settings no longer needs two copies of those settings in browser localStorage. Interrupted preference activation recovers before the library opens.
- Fix: Legacy backup imports finish verifying each read before loading more data, preventing image verification work from accumulating across the whole archive.
- Fix: A failed image save could be marked complete without storing the image. The acknowledged request is now retained so saving can recover without a new generation.
- Fix: Uploaded drawing backgrounds disappeared after navigating away and returning.
- Fix: Switching back to a recently used account could leave another account's details on screen.
- Fix: Compatibility backups made after restoring a library now use the database name expected by older ArtBot versions.
- Fix: Switching browser tabs while images were queued could send, or save, the same image twice.
- Fix: Reloading the page while an image request was being sent left it stuck on "Image requested", or quietly deleted it later. It's now marked as failed, with a note to retry it if the image doesn't appear.
- Fix: Exporting your database (Settings → Import / Export) now reads one image at a time, so large libraries are less likely to run out of memory, especially on phones. If an export fails, you now see an error instead of a stuck button.
- Fix: Changing the image filter while on a later page of your library could show an empty page.
- Fix: Prompts with non-English characters were garbled in the metadata of downloaded images. Older images are repaired when you download them.
- Fix: Prompts containing characters like `<` or `&` produced invalid XMP metadata in downloads.
- Fix: Downloading or copying an image with no saved prompt failed without telling you.
- Fix: Copying a PNG to the clipboard in Safari said it worked, but copied nothing.
- Fix: Some older images crashed the image details page.
- Fix: Drawings sent to img2img or ControlNet were overwritten by saved settings.
- Fix: Upscale jobs were never sent, and a malformed job could block the rest of your queue.
- Fix: The feedback form said your message was sent even when it wasn't.
- Fix: Pausing a worker from the header menu or the worker settings page could get stuck on "loading", including when the request to the AI Horde failed or when two workers were paused at once.
- Fix: The worker settings page lost each worker's description and its inpainting, NSFW, LoRA and post-processing details after about a minute.
- Fix: With more than one shared API key, only the last key's name and kudos were shown.
- Fix: Editing a shared API key's kudos also renamed the key to "TestFlight1".
- Fix: After logging in, your kudos and workers didn't refresh until you reloaded the page.
- Fix: LoRA and embedding searches only ever showed the first 20 results from CivitAI. A "Load more" button now fetches the rest.
- Fix: Typing a new LoRA or embedding search while another was loading could leave the old results on screen.
- Fix: The base model filters (SDXL, Pony, Flux and so on) in the embedding search were ignored. They now filter results, as they do for LoRAs.
- Fix: Searches containing `&` or `#`, empty searches and CivitAI errors now show the right results or messages. Repeat searches load instantly from a cache.
- Security fixes for the server and its dependencies. Login failures are limited per client without locking everyone out, and URL image imports now enforce dimension, request-rate and concurrency limits.

# 2025.08.18

- Woooooow. It's been nearly a year since I've posted a meaningful update to ArtBot. I'm sorry! That said, it's good to see it's alive and kicking. Over 30 million images have been generated with it so far!
- Most development work these days has been focused on ArtBot v2, which is an official client of the AI Horde! Check it out: [https://artbot.site](https://artbot.site)
- Disabled rating images functionality due to backend changes to the Horde API. Added a message explaining the situation.
- Refactor: Improved CivitAI query building and caching for LORA searches. Added proper URL encoding for spaces in base model filters and implemented cache key generation that includes filter states.
