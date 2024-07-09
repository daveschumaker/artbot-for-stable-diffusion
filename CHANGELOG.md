# 2024.07.08

- I have been deep, deep in the weeds of the ArtBot v2 rewrite. Come visit the [ArtBot Discord channel](https://discord.com/channels/781145214752129095/1107628882783391744) on the AI Horde server -- I've been putting up some developer preview builds for feedback and help debugging!
- Fix: Hi-res fix now works with SDXL baseline models.
- Enhancement: PonyXL models generally require a CLIP of at least 2, otherwise things look like a mess. ArtBot now detects if you're using a CLIP that's too small with a PonyXL model and automatically adjusts it on submit.
- Speaking of PonyXL: You chould now be able to search PonyXL LoRAs in the Lora Search panel.
- Speaking of LoRAs: You should now be able to correctly use specific versions of LoRAs with ArtBot.
- Fix: Issue using specific versions of previously saved LoRAs (prior to anything saved before the previous bullet point). Thanks to Sidorok for helping debug this.

# 2024.07.05

- MILESTONE: 🎉🎉🎉 ‼️‼️‼️ **18,000,000 images** have been created with ArtBot!‼️‼️‼️ 🎉🎉🎉

# 2024.05.27

- Add support for [embedded QR codes on the AI Horde](https://dbzer0.com/blog/embedded-qr-codes-via-the-ai-horde/).
- Been a bit burnt out lately, so haven't been as diligent with coding as I'd like. Still around and still poking at my newer codebase, though! I feel like GRRM trying to finish the final book of the ASOIAF series.

# 2024.05.17

- MILESTONE: 🎉🎉🎉 ‼️‼️‼️ **17,000,000 images** have been created with ArtBot!‼️‼️‼️ 🎉🎉🎉

# 2024.04.08

- MILESTONE: 🎉🎉🎉 ‼️‼️‼️ **16,000,000 images** have been created with ArtBot!‼️‼️‼️ 🎉🎉🎉

# 2024.03.20

- Fix: Wrong dates on this here changelog. (Was writing 2023 instead of 2024)
- Fix (hopefully): LORAs were not sending to correct version in many cases.

# 2024.03.17

- Sorry for the crickets lately! Been busy with Real Life™️ and slowly (glacially, you might say) working on a larger refactor related to recent Horde developments and to just clean up things in general. Still no timeline for this, but work is ongoing.
- Fix: Issue where ArtBot crashes when searching for certain LoRAs and embeddings on CivitAI. Let me know if you still encounter this. Thanks to everyone for reportins this and helping to track it down. (Literally, tons of people reached out, thank you!)

# 2024.03.05

- MILESTONE: 🎉🎉🎉 ‼️‼️‼️ **15,000,000 images** have been created with ArtBot!‼️‼️‼️ 🎉🎉🎉

# 2024.02.13

- Life has been busy, leaving little time for side projects. That said, still slowly working on batch image support behind the scenes.
- Remove advertising unit as that relationship has run its course.

# 2024.01.27

- MILESTONE: 🎉🎉🎉 ‼️‼️‼️ **14,000,000 images** have been created with ArtBot!‼️‼️‼️ 🎉🎉🎉

# 2024.01.25

- I've been doing a bunch of work behind the scenes, getting ArtBot ready to support batched image jobs. Man, it is such a chore (and all my fault)!
- In the meantime, here are some helpful community improvements.
- [PR from Sparkz](https://github.com/daveschumaker/artbot-for-stable-diffusion/pull/214) that only converts an image blob if the mimetype has changed. 🎉
- [PR from Sparkz](https://github.com/daveschumaker/artbot-for-stable-diffusion/pull/215) to add an Apple touch icon and color theme to make this thing a better looking PWA! 🎉
- [PR from Efreak](https://github.com/daveschumaker/artbot-for-stable-diffusion/pull/223) that adds support for filtering LoRAs and TIs by basemodel. 🎉

# 2024.01.16

- Bug fixes and performance improvements. (Doh!)
- Really, just refactoring a few functions behind the scenes as I work on some implementing initial support for the AI Horde's new batching improvements.
- It'll be awhile before this is live, but there are some code optimizations I'd like to backport as I go along.
- Remove some console.log statements
- Improved photo gallery display on wider screens (more columns!)
- Photo gallery images now load as image blob, rather than long base64 strings which could contribute to browser out-of-memory errors.

# 2024.01.15

- Fix issue with incorrectly requesting versioned LoRA for previously used / favorites LoRAs in your list (that is, for any LoRAs favorited or in your recents list before 2024.01.14). (Thanks to Sidorok for reporting this)
- Add lora details to shared images

# 2024.01.14

- Add support for recently added AI Horde feature for displaying and picking from multiple LoRA versions. (I fully recognize, the LoRA search interface needs to be significantly improved. It's definitely on my mind!)

# 2024.01.11

- Add RealESRGAN_x2plus upscaler (Thanks to Sidorok for letting me know this was available)
- Silently handle [hires_fix issue](https://github.com/daveschumaker/artbot-for-stable-diffusion/issues/217) is enabled when making image requests with SDXL based models. (Thanks to R3H, Neron, and Efreak for the suggestion)
- Fix longstanding issue with models cache showing incorrect data on first load.
- Check out two new SDXL image models made by ResidentChiefNZ (welcome back!): [ICBINP XL](https://tinybots.net/artbot/create?model=ICBINP%20XL) and [Fustercluck](https://tinybots.net/artbot/create?model=Fustercluck)
- Fix: client-side fetch model methods were not storing time data was cached.
- Update style presets
- Fix: Removing all models from multi-model select crashes page (thanks to Cubox for reporting this)
- Fix: Issue with inflating model count when clicking "auto-append keywords to all models" (thanks to Cubox for reporting this)

# 2024.01.10

- Hello! Here is a gigantic update for you.
- On tablet / desktop devices, I've gotten rid of the permanently fixed menu sidebar. You can either click the menu button in the top left, or scroll down to the footer of the page to see all the various links.
- Refactored the UI on the create page! This was a lot of work. A lot. For desktop and tablet devices, things are a bit more compact (so you can see more options at once).
- Added a new "warning / issues" button next to the "create" button, that will appear if anything amiss comes up. This should fix previous behavior where a new error message would cause the whole UI to shift.
- Added ability to select a specific worker from the Create Image page. (See button with the computer on it)
- Updated info page to show worker info in a table format.
- Added a new "ArtBot tips" module that will randomly pop up with various hints, tips and community related info.

# 2024.01.03

- Lots and lots of reports over stalled / failed jobs and I think it has to do with a bunch of hacky logic I've written. This is my second attempt at fixing these stalled image issues. (I had a previous attempt yesterday that I ended up rolling back due to a number of issues). Let's see if this improves things!
- Another fix for stalled jobs (I believe it was related to an error with certain prompts: "The string to be encoded contains characters outside of the Latin1 range.")

# 2023.12.31

- Happy New Year's Eve!
- Fix: Hopefully fixed issue with ArtBot [not properly logging in some users when they first load the page](https://github.com/daveschumaker/artbot-for-stable-diffusion/issues/205). If you had this issue before, let me know if this still happens.
- Fix: Karras and Hires fix work for ControlNet and img2img requests. (Thanks to Sidorok for reporting this)

# 2023.12.30

- Happy almost New Year!
- A whole bunch of misc refactors, fixes, and improvements
- Rewrote HeaderNav to take advantage of some improvements from new UI library I've started to integrate (DaisyUI).
- Better management for your GPU workers (you can now update name, team, delete work)
- You can now target multiple preferred workers for the worker allow list. (Thanks to Sidorok for the suggestion and reminder)
- Worker allow and blocklists now utilize a dropdown search (no more copy and pasting pesky worker UUIDs)
- Added support for LCM sampler when using SDXL image requests (note: you should be using this with specific LoRAs -- I will have to write some better warning and tips for this in the future).
- Speaking of which: I added a new query parameter for quickly accessing style presets. For example, [here's how you can get started with SDXL Turbo](https://tinybots.net/artbot/create?preset=turbo) (just type in a prompt and hit create).

# 2023.12.26

- New SDXL image model available on the Horde! Check out AlbedoBaseXL.
- Fix: Issue downloading JPGs due to metadata encoding issues. (Thanks to Buford for reporting, thanks to Sparkz for the fix).
- Fix: ArtBot caching issue when loading available models from Horde API
- Fix: Remove warning about using LoRAs with SDXL image models

# 2023.12.24

- 🎅🏻 Merry Christmas! (If you do that that sort of thing)
- Merge PR from Sparkz with additional EXIF support for images. Amazing! Thank you for doing this.
- Updated NextJS to v14
- Fixed an issue with a sanitize library (used when displaying data from external sources such as CivitAI)
- I've gotten a number of reports where LoRA and embedding search from CivitAI is either super slow or just not working. Their site stability has always been a bit temperamental. I'm thinking of ways to possibly mitigate this (e.g., cache popular LoRA data on ArtBot server itself?)
- I've also been (slowly) working on a new UI update using an actual UI framework this time (instead of writing all my own hacky components). I'm trying to incorporate some feedback from Discord. Not sure when this will go live as there's still quite a bit of work to do!
- A post about ArtBot briefly made the front page of Hacker News last week!

# 2023.12.14

- MILESTONE: 🎉🎉🎉 ‼️‼️‼️ **13,000,000 images** have been created with ArtBot!‼️‼️‼️ 🎉🎉🎉
- Been quite busy with real life stuff lately, so I haven't had much time to dedicate to the ol' site. I apologize!

# 2023.11.09

- On the create page, cmd + enter or ctrl + enter will now send an image request (really helpful if you're testing out some different prompts).
- On create page, we now show a warning if there are no workers available for a given job's parameters.
- Updated style presets.

# 2023.11.07

- MILESTONE: 🎉🎉🎉 ‼️‼️‼️ **12,000,000 images** have been created with ArtBot!‼️‼️‼️ 🎉🎉🎉

# 2023.11.03

- Happy November! Been working on a large update this week that just totally rewrites all the inpainting logic (courtesy of ChatGPT -- I am in awe). ArtBot should behave much better when it comes to inpainting (i.e., no more downsampling images unless they are over 3072 pixels on a side).
- Fixed a number of bugs around switching between inpainting tab and advanced options tabs
- Also, outpainting is back! Check it out! (Hit the gear button from the "inpainting" toolbar and select "outpainting options" to expand the canvas.)
- Updated style presets based on latest changes from Efreak

# 2023.10.26

- Potentially fix issue with header nav bar disappearing on create page while scrolling on a mobile device. This was likely due to an issue with the fixed action bar for... desktop devices. (Thanks to Sparkz for reporting this on Discord!)
- Fix [live paint page](https://tinybots.net/artbot/live-paint) not sending job to AI Horde. (Thanks to Openmindedness on Discord for reporting this!)
- Better visibility into image status when viewing the pending image panel on the create page -- this happens on desktop devices. (Thanks to StillLearning for the suggestion)
- When importing an image for img-to-img or ControlNet, ArtBot will now center crop the image so that each side is divisible by 64 pixels. (Worst case, you lose ~32 pixels from the sides of an image). This better aligns images with Stable Diffusion's rule of multiples of 64 for image dimensions.

# 2023.10.25

- Created a [contributors page](https://tinybots.net/artbot/contributors) to give a special shout out and thanks to those who have helped to improve ArtBot. Thanks so much!
- Fixed a few broken links in the new universal footer.
- Fixed an issue with the footer displaying behind content on the pending items page.
- Merged pull request from Sparkz that adds support for png tEXt encoding metadata (thank you!)
- Show kudos in header nav for users logged in with an AI Horde API key (thanks to StillLearning on Discord for the suggestion).
- Update Switch component to better handle style updates and sizing issues. Removes previous "react-switch" package.
- Remove some zombie code (various components leftover from previous refactors)
- Fixed "active" marker for the mobile footer nav.
- Added support for multi-sampler select. Previously, you could choose "use all samplers". (thanks to StillLearning on Discord for the suggestion).
- Fix issue with retry button on pending page. (Thanks to EFreak on Discord for reporting this.)
- Fix issue with missing "close" button on pending items page. (Thanks to Kuren on Discord for reporting this).
- Initial work on building out X/Y plot feature (not active yet, but updating some data models to be able to support this)
- On laptops / desktops, when scrolling down the create page, the "create button" is fixed to the top of the page. Thanks to StillLearning for the suggestion.
- Fix: Issue with fixed create button cutting off prompt input box for really really long prompts. (Thanks to AzureDream on Discord for reporting this!)
- Temporarily changed the ArtBot logo to a robo-pumpkin for Halloween.
- Fix incorrect link on contributor's page. (Thanks for reporting this, Cubox!)
- Add number of queued jobs to model details page.
- Fix: A number of issues with the [ControlNet page](https://tinybots.net/artbot/controlnet). It just wasn't working after some recent model updates. Things should be back in business now.
- Feature: Restored the ability to overlay any source image over the final image on the image details view -- pretty neat to see how something like control net changes an image!

# 2023.10.23

- Some behind the scenes cleanup. (Creating some React providers that can better handle input and manage various error states).
- Add shorticons and adaptive app icons for PWA. (Thanks to Sparkz on Discord for submitting [their first pull request](https://github.com/daveschumaker/artbot-for-stable-diffusion/pull/195)!)
- Added a [privacy policy](/privacy).

# 2023.10.17

- Fix some annoying behavior with custom aspect ratios and the image orientation dropdown.
- Update style presets from the AI Horde to utilize SDXL 1.0 instead of the deprecated SDXL_beta.
- For those of you on laptops / desktops, I've added a info modal for pending images on the right side pending images panel. This should give you a bit more insight into the status of your image, any potential errors, etc, without having to pop over to the actual pending page.

# 2023.10.16

- Fix: Image model is forgotten when selecting SDXL and leaving create page. If you had SDXL selected, it should now remember it. Thanks to Neron on Discord and an anonymous user in feedback for reporting this issue!

# 2023.10.09

- ArtBot is 1 year old! Happy birthday! I should write up some stats at some point. It's been a pretty fun project.

# 2023.10.06

- Thansk to some AI Horde API updates, support for tiling is back! Now, you can start making those amazing wallpapers all over again.

# 2023.10.02

- Adjusted some validation logic ahead of the official SDXL release on the Horde.

# 2023.10.01

- Merge PR from Efreak that fixes megapixel calculations. Thank you!
- Fixed caching issue with community showcase page. You can now see fresh content!

# 2023.09.30

- Update showcase page with new popup modal.
- Added dropdown menu options to shared image modal / shared image page to easily recreate image or modify the settings.

# 2023.09.27

- No more silly "copy and paste URL from CivitAI" behavior. You can now search for LORAs, Lycoris, and Embeddings right within ArtBot!
- Start integrating my new, unified AwesomeModal component that should hopefully make managing popup modals across ArtBot much easier and more logical. It's now visible in LORA and Embedding search popups. (Would you believe, this is like the fourth unique modal component within the web app -- anyway, long term goal is to only have one.)
- Did you create something you're particularly proud of and want to show it off? You can now submit a request for consideration to the community showcase. It appears as an additional menu item under the share icon on each image details page.

# 2023.09.26

- Fix: Fix issue where my previous "fix issue with model details page not loading" didn't actually fix things.
- Fix: Pending image requests disappear when reloading the page.
- Fix: While fixing other things, I also broke img2img uploads. This has now been fixed.

# 2023.09.22

- Fix: Issue with model details page not loading.

# 2023.09.21

- MILESTONE: 🎉🎉🎉 ‼️‼️‼️ **11,000,000 images** have been created with ArtBot!‼️‼️‼️ 🎉🎉🎉

# 2023.09.20

- Update: No more SDXL beta on the Horde. SDXL is coming Soon™️ according to the powers that be. In the meantime, Stability.ai pulled their SDXL beta workers from the Horde. _Sad Trombone Noises_ It might have something to do with their new music feature that just launched. I'm just bitter because I had to make [@MrRossBot](https://botsin.space/@MrRossBot) switch back to Deliberate after using SDXL for awhile. The SDXL images were SO good.
- Finished an ongoing project where I consolidated a [ton of spaghetti code](https://github.com/daveschumaker/artbot-for-stable-diffusion/pull/186) into a more manageable file structure (444 files touched). Don't get me wrong, my code is still made of pasta, but it should now taste slightly better.
- Upgrade to NextJS v13.5. Allegedly uses 40% less memory. We'll see what happens.
- Updated the pagination component on the images page to behave like an actual pagination component. Also, now display the component at the top and bottom of the page.

# 2023.09.12

- Allow importing of LyCORIS models from CivitAI from the Lora import panel.
- Display final kudos cost of image from API on image details page.
- Add ability to copy image request parameters from image details page.

# 2023.09.09

- Merge PR from StuckState that automatically adds EXIF data to all images. Hot diggity! Thank you for doing this.
- Revert back to earlier version of NextJS, as the latest version seems to be causing memory issues and crashing the server. (I updated it in the 2023.09.06 update and have been encountering issues ever since.)

# 2023.09.06

- Fix: Models dropdown would sometimes be unavailable on initial page load.
- Fix: Image details modal and details page would hijack native browser commands (e.g., trying to reload a page with "CTRL + R" would trigger the "reroll" shortcut, which should just be "R".)
- For desktop / laptop users: on Create Page, added a new button to sort the pending image panel by newest images.

# 2023.09.01

- Fix: Show both LoRA strength and clip values on image modals and pages. Expose LoRA CLIP values in the advanced options panel.
- Fix: I broke the pending images modal. Whoops. It's now fixed! Thanks to Sidorok for reporting.

# 2023.08.31

- Add LoRA and embedding details to image modals and image pages. Thanks to Sidorok for the suggestion.

# 2023.08.30

- Fix: On mobile devices, the search embedding field was a numeric input. Thanks to TheUnamusedFox for reporting this on Discord.
- Fix: Reroll and copy image settings would not use LoRA settings, TIs, denoise values. I rewrote this whole module, so it should work now (and going forward as new properties are added). Thanks to Sidorok and Efreak for reporting this.

# 2023.08.29

- Adjust limits for LoRA strength to be a range from -5.0 to 5.0 (before, it was 0 to 1.0). Cautionary note: values greater than 1 may not actually work on the AI Horde worker side of things.
- Merged in a PR from Efreak that updates zip files to include seconds within filename timestamp.
- Added confirmation modal when clicking "reset all?" on the create page. Thanks to TheGlosser for the suggestion.
- Added initial support for AI Horde's implementation of Textual Inversions (Embeddings) from CivitAI. See [db0's blog post](https://dbzer0.com/blog/the-ai-horde-now-seamlessly-provides-all-civitai-textual-inversions/) for more information. In a future update, I'll modify things to let you add the embeddings anywhere in the prompt. For now, it will just be auto applied on the backend side of things.

# 2023.08.28

- Show warning if image dimensions are over 4,194,303 pixels (max supported size on the Horde). e.g, Maxing out each dimension would make a 3072 x 1344 image.
- Fix style for red notification dot that alerts you to new images in the header nav bar.

# 2023.08.27

- Fix: Denoise value and ControlNet values would be overwritten if you imported settings from an existing image.
- Fix: Opening source image on image details modal crashes ArtBot.
- Updated style presets based on the latest wizardry from Efreak.

# 2023.08.26

- Ensure that the prompt-replacement filter is working. If set to true (this is the default setting for all users), it will tell the Horde backend to automatically replace certain keywords (e.g., girl -> woman / boy -> man) when using NSFW models to ensure that you don't receive a ban from the AI Horde for potentially generating inappropriate content.
- However, the prompt replacement filter does not work for prompts greater than 1,000 characters. If the Horde receives a request like this, it will reject the job and return an error. ArtBot will now automatically disable the prompt replacement filter when more than 1,000 characters are used.
- Official SDXL support on the AI Horde is coming soon™! Very Soon™ in fact. I've updated some validation logic related to SDXL image requests ahead of the release.

# 2023.08.24

- Oh, boy. I've been trying to be more diligent about [documenting various issues on GitHub](https://github.com/daveschumaker/artbot-for-stable-diffusion/issues). Needless to say, there are a lot of minor (and not-so-minor) things to fix! Slowly (very slowly), but surely!
- Simple update this evening as I haven't had much time to work on the project as of late:
- Refactored some logic around the SDXL A/B test modal. It sounds like that once SDXL is officially supported on the Horde, Stability.ai may still want to utilize the power of the Horde to refine their image models using the A/B testing framework. I've cleaned up the presentation of the A/B test modal. You can now choose your favorite image and optionally trash the other result, save both, or delete both.
- Refactored some logic around the misbehaving ad component (you might have seen multiple ads stacked up in the sidebar under certain conditions).

# 2023.08.17

- Fix issue with creating shareable links when swiping between images in the image modal.
- Feature: Experimenting with adding a new pending panel on the create page for wider displays (anything over 1100px wide). I may try to adjust that. Regardless, I'd like to start getting feedback. I think this layout makes it nice to get immediate feedback on images while you're still messing around with new image settings. The old school pending page is still in place (besides, it still currently has more information and features -- plus it will need to remain for mobile devices).

# 2023.08.16

- Increase max image dimensions to 3072 x 3072 for users with API key (there probably aren't many workers that can support that)
- Bump up max size of supported LORAs to 220MB
- Add both images created from SDXL beta to your image gallery (previously, ArtBot would throw away one image after it was rated)

# 2023.08.15

- Add some logic that attempts to check for model mismatch between LORA and image model and warn user if an incompatibility is found.
- Additional PR from tijszwinkels on GitHub that adds negative prompt to JPEG metadata (thank you!)
- Fix: Styling issues with inpainting toolbar

# 2023.08.14

- Fix: Issue when adding images from a URL. Thanks to the aislingeach on Discord for reporting this.
- Fix: Issue when trying to select "use all samplers". Only one image was ever generated. Thanks to magic on Discord for reporting this.
- Not really user facing, but I've added a whole bunch of tests for verifying that certain aspects of job creation are working correctly. It's a bunch of complex code and I've often had to just rely on bug reports to find out if something it broken. That's bad. I need to be more proactive in testing the logic before it ever goes out.
- Fix: "Use slow worker" setting gets reset when leaving and coming back to creation page. Thanks to hmal for reporting this on Discord.
- Clean up some output related to the image request parameters. Thanks to Anonymous Derpling for the suggestion.
- Also, there's been a couple of really cool PRs that have been submitted!
- Adjust size of image inside image preview modal so the entire thing fits on your screen (you can obviously still download the full size image).
- Fix: issues with selecting wrong sampler when using img2img mode
- Added some logic to handle connection issues with multiple requests for model details to AI Horde from ArtBot's server (this was probably only an issue in a development environment)
- You can now run ArtBot using Docker. Thanks to pawkygame [for the PR](https://github.com/daveschumaker/artbot-for-stable-diffusion/pull/142).
- When exporting / downloading JPEG files, basic metadata will now be included in the EXIF details. Thanks to tijszwinkels on GitHub [for the PR](https://github.com/daveschumaker/artbot-for-stable-diffusion/pull/147)!

# 2023.08.09

- MILESTONE: 🎉🎉🎉🎉🎉🎉 ‼️‼️‼️ **10,000,000 images** have been created with ArtBot!!!!‼️‼️‼️ 🎉🎉🎉🎉🎉🎉
- I remember when I was surprised and amazed to have gotten our first 1,000 images generated. It took 2 days. And 998 of them were probably me testing things out. Now, we're pushing over 1,000 images _an hour_. It's an incredible pace and represents about 12.5% of all images ever generated using the AI Horde! Thank you so much for all the use and support. Here's to the next 10 million!

# 2023.08.08

- I've been traveling for work, so updates have been a bit slow.
- A bunch of new style tags have been added, thanks to Anonymous Derpling.
- Fix: display issue with "using single worker" warning.
- Fix: display issue with "fixed seed / multiple images" warning
- Fix (I think): retry button causing job to disappear.

# 2023.08.04

- Fix: Issue with multi-denoise still being active, even if you are no longer using img2img mode. Thanks to Sidorok for reporting on Discord.
- UI: Add a quick swap dimension button near the image settings drop down. Thanks to Anonymous Derpling for the suggestion.
- UI: You can now remove unavailable / re-named models from your favorites list using the model info popup on the create page.
- UI: Fix "server updated" modal being displayed behind some content (this will take affect after the next update).
- Feature: Brand new, swanky ["Community Showcase"](https://tinybots.net/artbot/showcase), featuring neat images that have been publicly shared by ArtBot users.

# 2023.08.03

- Fix: When using multiple values (e.g., multi-guidance), the same value would be passed multiple times. Thanks to OxOnWater for reporting this on the contact form.
- UI feature: Added a new adjustable step count button to some number fields (number of images and steps). Thanks to Anonymous Derpling for the suggestion.
- Fix: Unable to load details for some LoRAs. Thanks to Memetic for reporting this on Discord.
- Fix: Issue with sending incorrect parameter when trying to inpaint. Thanks to jskaall for reporting this on Discord.

# 2023.08.02

- Some growing pains naturally. One thing that seems to be fixed though are memory leaks in Node. Hopefully this means you'll only see the "ArtBot will be right back" page only when an actual update is being pushed live.
- Fix: I broke how prompt matrices work. This is now fixed. Thanks to DirtNub2K17 for reporting this on Discord and DisneyPrincess for reporting this via the contact form.
- Fix: Prompt replacement filter option would always revert back to true. Thanks to KD25 on Discord for reporting this.
- Fix: Fullscreen mode wasn't showing images at correct size when in full screen. Thanks to BOMBbejaan on Discord for reporting this.

# 2023.08.01

- WELCOME TO THE NEWISH ARTBOT!
- Tons of changes! Where to even start.
- Updated web-app to use new app router architecture in NextJS.
- Compact and re-organize advanced options panel.
- Moved various toggles and sliders into relevant options menus that now appear next to relevant components (e.g., clicking the options panel on the Samplers dropdown will show an option to "use all samplers")
- New filter for model selection list. Easily filter by SFW / NSFW / favorites.
- Add model to favorites right from the model details panel on the create page.
- Add new options to create images using multiple denoise values and multiple CLIP values.
- Do you have frequently used custom dimensions? You can now save and reuse them.
- Tons more stuff!
- Thanks to Efreak, magic, and hmal on Discord for helping to beta test this!

# 2023.07.26

- Fix: Inverted image masks when using inpainting. Now, you should only need to highlight the areas you want to change. This used to work correctly, but an update to worker GPUs broke how ArtBot sent image masks to the AI Horde. You should be able to use inpainting as normal, now! Thanks to Silvy, Efreak and others for reporting this.
- Fix: Live painting would hang when trying to return an image. Thanks to Francis! for reporting this on Discord.

# 2023.07.25

- Fix: The Horde supports up to 500 steps for logged in users. ArtBot had capped that at 200. Thanks to Efreak for reporting this on Discord.
- Fix: When generating square SDXL images greater than 1024 pixels, ArtBot would revert to 1024 pixels. Thanks to Efreak for reporting this on Discord.
- I've also seen a report related to Firefox having trouble initializing the browser database after a crash. I've added a special page to try and further debug this problem with some users on Discord.

# 2023.07.21

- Fix: Issue where checkboxes for post-processors and upscalers weren't displaying correct values. Thanks to PixelDelightAI and Hinaloth for reporting this on Discord.

# 2023.07.19

- Fix: Attempt to fix issue where pending jobs that 404 are not removed from the job queue and requests are still repeatedly sent to the AI Horde.

# 2023.07.18

- Fix: Super strange bug. Image size wasn't respected when hires fix was set to false. Thanks for reporting on Discord, Anonymous Derpling (and nice find)!

# 2023.07.16

- Updated shared images feature to utilize AWS (before... they were just saved locally and taking up space on my own server. Almost 4,000 shared images so far!) All existing shared images have been migrated and should continue to work.
- Fix: Issues with image orientation settings getting reset and just acting ridiculous every time you come back to the create image page. Thanks to Chief of Booty for reporting this on Discord.

# 2023.07.15

- Fix: Page crashes when attempting to download multiple images at once from image gallery. Thanks to ThereIsNoJustice on Discord for reporting this.

# 2023.07.14

- Fix: ArtBot was not properly working in the background. Thanks to ThereIsNoJustice and hmal on Discord for reporting this.

# 2023.07.13

- Fix: Dropdown menus for tags and style presets were un-scrollable due to a pesky z-index issue. Thanks to Noli and Anonymous Derpling on Discord for reporting this issue.

# 2023.07.12

- Temporarily (?) remove the "tiling" option in the Advanced Settings panel as it is not currently implemented on the updated GPU worker side of things. Hopefully it will be back soon!
- UI refactor: Moved model selection and model details toward top of Advanced Settings panel, since model selection seems to be one of the more important things that people choose when generating images.
- UI refactor: Image orientation settings will now slot in right next to the model selection panel. Also, the image dimension adjustments panel will now always display. Why? Because now, if you choose something like "Portrait (2 x 3)", you can automatically adjust the desired size while keeping dimensions the same. I think this is a much better user experience.
- UI fixes: SDXL A/B test issues on some mobile devices (iPhone / mobile Safari, ah hem) that I had mentioned in the 2023.07.10 update.

# 2023.07.11

- MILESTONE: 🎉🎉🎉 ‼️‼️‼️ **9,000,000 images** have been created with ArtBot!‼️‼️‼️ 🎉🎉🎉

# 2023.07.10

- Added support for SDXL beta! Stability.ai is kindly providing some computing power to the AI Horde in order to help fine tune and improve future image models. Once you've generated an image using SDXL, you'll be presented with two thumbnails. Choose which image you think looks best and the result will be sent back to Stability.ai. In return, AI Horde will reward you with kudos (currently 15 per rating). More information is available on [Db0's blog post announcing the partnership](https://dbzer0.com/blog/stable-diffusion-xl-beta-on-the-ai-horde/).
- Fix: Issue with page scroll being locked after closing shared image modal (Thanks for reporting, Anonymous Derpling!)
- UI Refactor: Mostly invisible to users. But the prompt input and associated drop-downs (prompt history, negative prompt history, tags, styles) have been cleaned up. (The old negative prompt modal was especially ugly. No more slider!)
  - This is based on some redesign work I've been doing on a development branch. I figure that I should start porting components over to my production build, otherwise, they'll never see the light of day at the pace I've been going at!
- Issues I'm currently investigating:
  - Once you've voted on an image for SDXL, you lose access to the previous image. I should probably save all images to the browser database, regardless.
  - Mobile display issues around SDXL image voting.

# 2023.07.07

- Work continues on the rewrite (and also attempting to fix a bunch of existing bugs on my development branch)
- Fix: Shareable links are back! [For example](https://tinybots.net/artbot?i=DWepe3nyFti). I apologize for breaking them. 🥴
- Fix: Viewing a shareable link no longer automatically overwrites all your existing preferences. You have to scroll down and click on "use image parameters", which will copy all the image settings onto the creation page.
- Feature: Display all parameters used to generate an image on the shared image modal.

# 2023.06.28

- A number of fixes related to server side rendering using styled-components, and enabling NextJS static page optimization. Hopefully, this should make the site (slightly?) more performant.
- I've been trying to figure out issues related to a pesky memory leak. This is why you may have seen the "ArtBot is down" page while the server reboots every few hours. We'll see if it still happens as frequently.
- A few PRs from some very kind contributors! [Add LoRA to meta-data output](https://github.com/daveschumaker/artbot-for-stable-diffusion/pull/113) (thanks, Efreak!), [change input mode for various inputs](https://github.com/daveschumaker/artbot-for-stable-diffusion/pull/112) (thanks, Efreak!), [set LoRA input mode to numeric](https://github.com/daveschumaker/artbot-for-stable-diffusion/pull/111) (thanks, Efreak!), and [Add missing import/export menu item](https://github.com/daveschumaker/artbot-for-stable-diffusion/pull/115) (thanks, Brimstone!).
- Fixed: Issue with trying to fetch remote images when using things like img2img, controlnet, or image interrogation. Previously, it would just error out. It should handle things a bit better now.

# 2023.06.19

- I'm still here! As I said in a previous update (2023.06.06), I've been rewriting a number of components to take advantage of some new updates with NextJS 13. Ideally, I'd like to release all the changes all at once, rather than roll out stuff a bit at a time. (There's just a ton of horribly written code I'd like to get rid of forever).
- That said, some small updates: You can now completely export and import that ArtBot database from the [import / export settings page](?panel=import-export). Thanks to Efreak on Discord for the feature request (and digging into some potential libraries to help out with this feature).
  - This allows you to export the raw IndexedDb database from your browser. This includes the all image generation details, base64 strings for all images, various favorites, etc. Looking at this data won't really do much for you, because it's meant to...
  - Import! You can take this same file and send it to another device (or, just use it to back things up) and import that database back into ArtBot.
  - For me, I'm using this to test out various table optimizations and updates and makes it easy to restore things should something go awry.
  - One important thing to note: There is currently no way to check deltas and merge two separate ArtBot databases. e.g., you export the database from your computer machine, import on your phone and create images on the go. Meanwhile, you come back home, and start creating images on your computer. Oh, wait! What about the phone? Well, now you have two divergent databases. I will have to figure this out at some point.
- Fix: Re-rolling an image (by clicking the refresh icon), would only work 1 time for some reason. I've fixed this. You can now mash on it to generate as many re-rolls as your heart desires! Thanks to Bwesh for reporting this on Discord.

# 2023.06.11

- MILESTONE: 🎉🎉🎉 ‼️‼️‼️ **8,000,000 images** have been created with ArtBot!‼️‼️‼️ 🎉🎉🎉

# 2023.06.06

- Been heads down lately rewriting a bunch of stuff using Next.JS server components (and also trying to figure out a memory leak issue with my Node server). Also, just a lot of general cleanup -- trying to make things easier to read and for people to contribute, because there is a lot of spaghetti.
- Change input field on LoRA modal to be numeric -- much easier for people on mobile devices to enter model number (but still allows pasting a URL). [Thanks to Efreak for the pull request on Github!](https://github.com/daveschumaker/artbot-for-stable-diffusion/commit/17c1ced34afd6ae6c2d62cc65a49ae249f3f8df7)
- Fix issue with image gallery page not respecting the image limit you set on the [ArtBot settings page](/settings?panel=prefs). You may need to re-select a number for this to properly take effect. Thanks to Efreak for reporting this on Discord.

# 2023.05.31

- It appears phantom jobs never went away. Interestingly, I can't recreate on my local machine in either development or production servers. But I do see it happen on my phone. I've added some more debugging logic so I can... err... test in production.
- Fix: 👻 jobs should no longer be an issue!

# 2023.05.30

- Still working through some issues related to stalled jobs on the pending items page. I've added some more logic to check for potential error conditions.
- LoRA weight slider and input should have a minimum of 0.05, not 0.5 (typo on my part). Thanks to Efreak for reporting this on Discord.
- Feature: Thanks to some backend changes on the AI Horde, you can now add any LoRA available on Civitai! All you need is the model ID or URL. (Check the LoRA panel in the advanced options area of the create page for more details).
- Fix: Added a "clear favorite models" button to the button of the favorite models page. Overtime, some models have been removed or renamed and it's created some problems for those of you who use this feature. This should get you back in business, at least until I come up with a more elegant solution. Special thanks to gunsalem for suggesting this feature.

# 2023.05.29

- Long time, no see! I am still alive, and chances are, if you're reading this, so are you!
- db0 and the team (Jug, Tazlin) have been workin on adding LoRA support to the AI Horde! I've been following the progress and have attempted to add support. I think it works! Maybe. Try it out and let me know. (Scroll down the advanced options panel to the LoRA selection -- currently the Horde backend only supports ~100 of the most popular models available on Civitai.)
- Fix: Empty LoRAs field was causing pending jobs to hang. Thanks to Atticus, dreamy, and gunsalem on Discord for investigating and reporting this.
- Attempting to fix: issues related to stalled job queue. I'm hearing a number of reports about this and trying to figure out what is happening.

# 2023.05.18

- Add some UX improvements to the [export data page](/settings?panel=import-export): when downloading a zip file, disable the rest of the links. This is because only one zip file can be downloaded at a time (for now... I need to implement more complex logic). Once one file is done, you can download the next one. Thanks to "I.B.B.A.F.L.C.S.S.H.K.T Committe" in Discord for bringing this up.
- Add some additional checks for valid image files when creating zip file (mainly related to some broken data received from API awhile back). Thanks again to "I.B.B.A.F.L.C.S.S.H.K.T Committe" for helping to debug this.

# 2023.05.17

- Fix: Ghost jobs that would reappear after canceling in-progress jobs. Thanks to dreamy on Discord for reporting this (multiple times!).
- Feature: Added a new setting: 'max images per page", so you can tweak the number of images viewable in the photo gallery. Helpful for lower powered devices.
- Added timestamps to downloaded zip files. Thanks to Efreak for the suggestion.
- Feature: Add support for prompt replacement filter.

# 2023.05.16

- Fix: Navigation keys and swipe behavior were backwards on image modal. Thanks to Litnine for reporting this on Discord.
- Behind the scenes: improvements to settings and displaying server messages (e.g., downtime alerts, etc)
- Fix: Unable to bulk clear images that had an error state on the pending page. Thanks to "I.B.B.A.F.L.C.S.S.H.K.T Committe" on Discord for reporting this.
- Fix: Update kudos costs based on latest research and advancements from the mad scientists over on the AI Horde (this time, weights no longer factor into kudos calculations)
- Hacky fix for bulk download of images on the [export data page](/settings?panel=import-export) (due to issues with attempting to stream a zip file).

# 2023.05.15

- db0 added official channels on Discord for various UIs on that integrate with the AI Horde. I've updated links across the web app. [You can find the discussion about ArtBot here](https://discord.com/channels/781145214752129095/1107628882783391744). Stop by and say hi, if you're into that sort of thing.
- Fix: Apparently, the "run in background" option on the [ArtBot settings page](/settings?panel=prefs) wasn't working correctly. I found myself queueing up a bunch of jobs, switching tabs to check on some other things, and come back later to find out nearly all the images are still pending. Oops! ArtBot should now be able to continue running. (Note: I'm not sure how this will work on a mobile device).
- Fix: Prevent some unnecessary re-renders within image details component (used in both modal and image detail page) that could impact performance.
- Fix: Interrogate page would sometimes become unresponsive if an error occurred while fetching image from an external source.
- Fix (hopefully): Issue with "ghost" generations that would sometimes happen when you canceled an image request. I'm like 93% sure I've solved it this time.
- Merged in an improvement from Efreak to fix a double encoding issue when downloading images. Thank you! 🙌

# 2023.05.14

- Happy Mother's Day to all you moms out there.
- Added a tooltip to the [image ratings page](/rate) that gives some more information about the CAPTCHA system. These are images you sometimes see that say "YOU MUST RATE THIS IMAGE A 7." When you see this, please do as the image says. 🙂

# 2023.05.13

- Oh, boy. I've been encountering a whole bunch of issues with my VPS this weekend. It sounds like there was an issue with a physical node that they've fixed. I'm really sorry if you've encountered any unexpected downtime.
- UX / fix: Viewing models served by specific workers has always been a bit ugly and some changes I made completely broke the display. This has now been fixed. Thanks to Efreak on Discord for reporting this.

# 2023.05.12

- For desktop / laptop users, I added a small tooltip on the image gallery page that show prompt, model, and sampler as you mouse over images.
- Fix: Using the left arrow key on the image gallery page did not work. Oops!
- Fix: Stretched images in image preview modal on iOS. Thanks to FiFoFree for reporting this on Discord.
- UX: Added a "allow NSFW generations" switch to the advanced options panel (previously, this was buried inside the settings page)
- Feature: Added an input filter to the style presets dropdown. You can now filter by style preset name and model (if available).

# 2023.05.11

- A whole lot of random fixes.
- Fix: Using block list would return invalid payload error from API. Thanks to dreamy for reporting this on Discord.
- Fix: Requesting multiple models with multiple image (e.g., Anything Diffusion and Deliberate with image count of 2, so you would expect 4 images) stopped working after a recent change. This now works again. Thanks to gunsalem for reporting this on Discord, as well as a number of anonymous users via the feedback form.
- Fix: Pending page would cause "ghost generations" after completing initial image run. Weird, strange, and I think I've fixed it. Thanks again to dreamy on Discord for reporting this.
- A whole bunch of behind the scenes changes -- I had some tightly coupled logic with regard to the image preview modals. I've tried to clean up and simplify this logic. In my testing, things seem to work much better (no more random images disappearing due to off-by-1 errors, swiping between pages should be faster). I think everything works, but if you encounter anything funky, let me know.

# 2023.05.09

- Added ability to sort workers by max resolution on the [worker details page](/info/workers). Thanks to Efreak for suggesting this on Discord.
- Fixed a typo on the worker block list field due to a copy / paste error on my part. ("update kudos" instead of "add worker ID"). Thanks to Litnine for reporting this on Discord.
- Fixed issue where long prompts with no spaces (e.g., "this_is_a_long_prompt,dramatic,epic,moody,etc,etc") would overflow various containers (prompt history and pending items). Thanks to Litnine for reporting this.
- Attempting to fix some race conditions on the (pending page)[/pending] (of course... where else?!) and stop hammering your browser's IndexedDb API so much when checking / updating pending image states.

# 2023.05.08

- Fix: Text was hard to see on prompt history modal. Thanks anonymous user for reporting this.
- Fix: Nav dropdown menu items were cut off at certain resolutions. Thanks to EFreak for reporting this on Discord.
- Added a markdown parser so that it's much easier to write this changelog (and potentially other things on the site in the future -- like a much more detailed FAQ).
  - Not so fun fact: Whenever I was editing the changelog, I was actually writing a bunch of html directly into the changelog page. Gross! One benefit is that the changelog is now an actual file that you can reference on things like [Github](https://github.com/daveschumaker/artbot-for-stable-diffusion/blob/main/CHANGELOG.md).
- Feature: Added additional support creating and editing shared API keys for the AI Horde. You can modify these settings on the [settings page](/settings).
- Feature: Added support for a new AI Horde feature: Worker block lists. Is there a worker consistently giving you junk output? Add their ID to the new worker block list and your image jobs will no longer be sent to them. This is also available on the [settings page](/settings). (Note: This incurs a 10% kudos penalty due to suboptimal use of Horde resources)
- Secret beta feature that no one is supposed to know about yet (work-in-progress): [Text generation via AI Horde and KoboldAI!](/chat)

# 2023.05.07

- Added support for AI Horde's new shareable keys feature. You can now login using a shared key, if available (I'll add the ability the create shared keys in a future update).
- Updated some styles on the image creation page and added some new functionality around the prompt text areas to help with future inspiration (pre-defined style tags, cleaned up some stuff related to style presets).

# 2023.05.06

- MILESTONE: 🎉🎉🎉 ‼️‼️‼️ **7,000,000 images** have been created with ArtBot!‼️‼️‼️ 🎉🎉🎉

# 2023.04.29

- Fix: When selecting "use all models" (or even "use favorite models"), in any instance where a model had multiple trigger words, ALL trigger words would be added to the prompt. This is not really ideal. Now, ArtBot will randomly pick a trigger work from the trigger words array. Thanks to Efreak for suggesting this on Discord.

# 2023.04.25

- Fix: When running prompt validation, ignore negative prompt added to positive field using "###". Thanks to dreamy on Discord for reporting this.
- Added DDIM to samplers list. Thanks to dreamy on Discord for reporting that this was missing.

# 2023.04.24

- Added support for new field from Stable Horde API: `is_possible` -- this lets us know whether or not there are workers available to complete a pending image request. If a particular image request is not possible, you will see a message on the pending items page. (This usually occurs if there are no workers that support the requested image dimensions or post processors.)
- Fix: Negative prompt field now supports prompt matrix. Thanks to Cubox on Discord for letting me know this was broken.

# 2023.04.20

- Debugging feature: On the [ArtBot settings panel](/settings?panel=prefs), I've added a button that clears out the pending items table. This is useful for an unknown race condition that primarily happens in Firefox where the pending items table gets corrupted. I need to do more investigation into why this happens in this first place.
- Feature: Disable new image notification toast on the [ArtBot settings panel](/settings?panel=prefs). (I've found it annoying on some occasions when trying to click various menu items right as the notification pops up.)

# 2023.04.19

- Fix: Issue where a blank modal would sometimes show on image gallery page. (Another issue with incorrect memoization. Oops!)
- Misc: more small fixes to the [live paint page](/live-paint).

# 2023.04.18

- UI update: I am moving a few things around on the image creation page as I prepare for a large UI refactor targeted toward desktop / laptop users. One thing I've heard from people -- they want the negative prompt text area closer to the normal prompt area.
- More improvements to the [live paint page](/live-paint). It should have better support for those of you using ArtBot on a mobile device.
- NEAT! I missed this awhile back (I should do a better job checking my referrer logs). ArtBot was listed in PC World as [one of best AI art generators](https://www.pcworld.com/article/1672975/the-best-ai-art-generators-for-you-midjourney-bing-and-more.html)!
- Quoting from the article: "Artbot uses a GUI that's somewhat navigable." Haha, that is being too generous! (I agree, things can be a lot better. This is one reason I have been trying to do some more UI refactoring.)

# 2023.04.14

- Feature: Live paint! You can now paint a canvas in ArtBot and see results pop in from the API as you work on an image. Check it out on the [live paint page](/live-paint)! (This may not work well with mobile devices. Also, make sure you are logged in using your Stable Horde API key, otherwise queue lengths might be a bit long.)

# 2023.04.10

- _tap, tap_ Is this thing on? Hey!
- MILESTONE: 🎉🎉🎉 ‼️‼️‼️ **6,000,000** images have been created with ArtBot!‼️‼️‼️ 🎉🎉🎉
- (Been pretty tied up with work and life lately, but finally getting back into the swing of things)

# 2023.04.04

- Been a bit quiet around here lately. Been busy with work and life obligations around these parts.
- Fix: Biggest fix right now -- there's been tons of issues cropping up in my error logs with images sometimes not showing up in the image details view. As it turns out, it was due to me incorrectly applying memoization to a particular lookup method. This should now be resolved!
- UX: Added a warning if you (are most likely on Safari) and running into issues with image generation. There are some very strict browser storage limits. I've added information to [the FAQ](/faq#kudos) as well.

# 2023.03.31

- Fix: I introduced a race condition where having multiple tabs open would create the same image multiple times in the photo gallery. This has been fixed using the handy BroadcastMessage browser API -- now ArtBot can figure out which tab should be the primary tab and make API calls from it. Thanks to Efreak for suggesting this and "The I.B.A.K.T Committe" for reporting this on Discord.
- Made the filter / clear text links on the pending page darker. Thanks to Litnine for the suggestion on Discord.
- Fix: I had added a menu dropdown option in the past to stay on the control net page, but it was rarely used. I've had a number of feedback items asking why the "stay on create" setting doesn't work for this page. It has been updated and now works as you would expect. I've removed the confusing dropdown from the control net page. Thanks to Vadi for reporting on Discord and Stable Horde user tom*tom* for the feedback.

# 2023.03.30

- Feature: Added ability to easily detach parent image jobs from the image details view. We also now show a parent image (if it exists) on both the create page and image details view for better visibility (and to hopefully alleviate those instances where you clone image details and forget to remove the parent job when you're making some significant changes). Thanks to Efreak on Discord for suggesting this.
- Added a new "server updated" message. No longer (or at least very rarely) are the days where you will be interrupted mid-session. We now show a helpful message informing you to reload the page when possible to pull down the latest changes.
- Add some additional error logging for a few remaining issues on the pending items page.
- Oh, wow. The additional error logging quickly highlighted some issues. This fix hopefully resolves them. Stay tuned...

# 2023.03.29

- It's been fairly quiet the last few days as I've been heads down with other obligations. That said...
- ResidentChiefNZ, the sole volunteer ML engineer working on adding new features to the Stable Horde API had to unexpectedly stop working on the project. Do you know anyone interested in helping out? More info.
- Fix: I swapped out the virtual windowing library used for the pending items page. Hopefully that helps with issues related scrolling behavior, especially on mobile devices. (You might be wondering why I've spent so much time working on the pending items page and how to efficiently render a list with hundreds of items. the official React docs recommend this as a performance optimization.)
- UI: On the pending items page, I moved a number of the text links (for stuff like completed items, errors, etc), into the dropdown menu to give the page a bit more space (especially relevant on mobile devices).
- UX: You can now swipe up or right on the new image notification to get it to go away.
- UI: Fix some UI lag on the create image page. Thanks to raider and Anon69 for reporting this on Discord.
- UI: Fixed issue with a stale cache when favoriting items from an image modal (sometimes, the value would persist). Thanks to Litnine for reporting this on Discord.
- Fix: Deleting completed images from pages other than pending didn't properly remove them from the pending page in some scenarios. Worse, when deleting from the pending items page, I would... err... sometimes use image IDs from the wrong table (pending vs completed), meaning that potentially the wrong image was deleted. I don't think this happened often, otherwise I would have heard about it sooner. But it is fixed now! Anyway, thanks to Efreak for providing a detailed bug report related to errors with the pending page on Discord.

# 2023.03.27

- Temporarily disabled outpainting due to some issues...
- Minor fixes related to improving experience around img2img, masks and inpainting. Hopefully this tightens up some of the functionality. I was hoping to bring back outpainting tonight but wasn't able to get it finished. It is in progress!

# 2023.03.25

- Fix: When selecting multiple-models, the select dropdown should stay open! Thanks to EFreak on Discord for reporting this!

# 2023.03.24

- Merged in another PR from Litnine -- essentially a unified theory of error handling and some additional UI fixes. The create image and control net pages now show all validation errors at once (if they exist), and it's located in a central place that is easy to update.
- Removed ugly navigation buttons from image details modal on mobile devices and added back the ability to swipe between images. (Thank you, Litnine!)
- Added back the ability to re-roll images. It' s located in the additional options dropdown (the 3 dots) of the image details view. (View? Yeah, we'll call it a view: modal + page = view.) Thanks to openco for reaching out via the feedback form to remind me about this!
- Fix: Dedicated re-roll button on mobile devices (download button moved to dropdown menu on image details view).
- Fix: Issue where re-rolling tiled image would lose the tiled parameter.
- UX: On mobile devices, you can swipe down from the very top of the image details view to close out the modal.
- Fun fact: Apparently, support for outpainting has existed within the Stable Horde API for ages and no one knew! Let's go ahead and add some simple support for it (for now). How do you use it? Go to the inpainting tab as you normally would, upload an image, and then either click the cursor icon or the ruler icon to resize your existing image. Key part: you need to paint over the checkerboard (and anything else you want changed). I will improve this in the future to make it easier. (This should be a FAQ item, probably)
- Fix: img2img source being forgotten as you navigate between pages (or reload the page). Thanks to Litnine for reporting this!
- Fix: Restore ability to press "delete" keyboard shortcut on image details view, as well as pressing "f" -- though not to pay respects -- this is to quickly favorite an image. While we're adding shortcuts, here is are two more: "d" to quickly download an image, "r" to quickly re-roll. Thanks to qwq and Efreak on Discord for the reminder and suggestions.
- Fix: Issue where Safari on iOS wasn't able to use the new copy image to clipboard feature.

# 2023.03.23

- Fix: Image ratings have been inconsistent and broken since some griefing countermeasures were implemented on the backend. Ratings should now work properly again. Pro tip: If you see an image that literally says something like "rate this image a 4", then please do that. It"s a form of captcha to verify ratings. Thanks to ƊαякƊ, R3H and others for reporting issues with this on Discord.
- Feature: Swanky new image details page and modal. (And modal?). Yes! They are now basically the same thing. Same info available on both. Easier to update. Buttons with dropdown options, if needed. Can now view tile-able images on the image details page. Can now view tile-able images fullscreen! Will there be bugs? Probably! But that's what makes things fun. (But seriously, if you see any, you know what to do.)
- Oh, yeah. With the new image page / modal, you can now copy images directly to your clipboard. That's kind of neat for things like Discord, text messages, etc.

# 2023.03.22

- Fix: "Show tiles" button was broken on the image model. Thanks to Stable Horde user Demons for reporting this via the contact form.

# 2023.03.21

- Refactor the pending page... again. No front end changes as of yet, but tried to rewrite a whooooole bunch of stuff to make fetching requests more reliable and performant. Also implemented a virtualized window for lists (as dynamically rendering a list of hundred of changing items frequently caused memory errors and crashes in people's browsers). Still work to do. Thanks to Litnine for reporting some bugs with this page.

# 2023.03.20

- Feature: Absolutely amazing update from Litnine. You can now lock the aspect ratio when creating an image and resize to your heart's content! The new component will automatically calculate the proper corresponding size to the nearest 64 pixels. This has been on the to-do list for a long time and I'm happy to see it done so well.
- Fix: Deviation value on aspect ratio calculation reset to zero if dimensions were swapped. Thanks to Litnine for both the bug report and quick fix!
- Fix: Source image for img2img requests disappeared after leaving the page. Thanks to Litnine for the bug report.
- Feature: Added support for prompt as a query parameter. It doesn't do much at the moment. Mainly, you can now upload an image into the interrogation tool, get a caption and then immediately create a new image request using the caption. (I was frustrated with some posts on the Stable Diffusion sub-Reddit page, where people posted awesome images but never included captions)
- Two new upscalers added to the Horde: 4x_AnimeSharp and NMKD_Siax
- Fix: Issue with upscaler not able to be unselected. Thanks to TheGlosser for reporting this on Discord.
- Fix: Issue where sometimes broken images were returned from API (ArtBot now properly shows an error and gives you an option to retry). Thanks to AzureBlue for reporting this on Discord and then working with me to fix the issue.

# 2023.03.19

- Feature: Add support for new Horde parameter to disable the use of slower performing workers. (Note: disabling incurs an additional kudos cost).
- Adjusted kudos calculations based on latest updates to the Stable Horde API.

# 2023.03.18

- Feature: Add support for new control net options (return control map and use control map).
- Add support for new "strip background" post processor
- Fix: Page broke when removing all selected models. Thanks to R3H for reporting this on Discord.
- Fix: Image count would reset when going back and forth between pending page and create page. Thanks for letting me know on Discord, FiFoFree.
- Add image id to filenames for easier downloading and merging of files from multiple zips. Thanks to Efreak for the feedback.

# 2023.03.17

- Big thanks again to Litnine, who put up another pull request, helping to refactor and simplify some of the logic on the ControlNet page. 🙌🏻
- Fix: Should now be able to use models with a baseline of stable_diffusion_2 for ControlNet. Thanks to Efreak for suggesting this on Discord.
- Fix: Copy image prompt data would end up copying the number of images to generate. This was always supposed to be set at 1, since it copies the original seed as well. Thanks to Gigachad on Discord for reporting this.

# 2023.03.16

- Hah! You thought a day was going to go by without and update, did't you?! I am going to get this in just under the wire, California time.
- A lot of code refactoring under the hood that will be invisible to people using the site right now, but will pay huge dividends down the road! Thanks again to Litnine, who put up another pull request-- this time refactoring some more of my spaghetti code to create some easily reusable components (specifically, the number input and slider components you see everywhere). I am in awe. Thank you! Also, they added a helpful UX feature that hides the face-fixer slider if you're not using any of those post processors.
- Inspired by Litnine's PR, I added some similar improvements to the toggle switches and tooltip components. Again, nothing immediately obvious, but makes it easy to re-use these UI components in other places.
- ResidentChiefNZ has been hard at work making a ton of improvements on the Stable Horde backend (face-fixer from yesterday) and now support for Stable Diffusion v2.1 inpainting and ControlNet.
- Another upcoming update from ResidentChiefNZ will add more inpainting specific models! I've added support to help future-proof this feature, so once it's live, it should just work™️ (hopefully).
- Speaking of inpainting -- previously, you had to jump through a bunch of annoying steps. They inpainting model wasn't visible in the models dropdown unless you first: uploaded an image, and then painted something. Only then could you select "stable_diffusion_inpainting". You should now be able to select that (and any inpainting model) from the go. We make software that should be smart, so it should know if you need to add a source mask and warn you before continuing. Well... now it does!

# 2023.03.15

- UI: A few UI improvements today courtesy of Litnine. Better spacing on the NavBar (thank you!) and more information on the worker details page (thank you!!).
- If interested, you can view what's on deck for ArtBot on the Github kanban board
- Added 'RealESRGAN_x4plus_anime_6B' upscaler to post processing section. Note: You cannot pick both at the same time.
- Stable Horde now support denoise strength (or init strength, as some UIs call it) for ControlNet!
- Fix: Issue with "stuck" attached job ID. Should now be resolved. Thanks to Hinaloth and TheGlosser for reporting this on Discord!
- Support for face fixer strength! Slider from 0.05 to 1, where 1 is the strongest effect.

# 2023.03.14

- MILESTONE: 🎉🎉🎉 ‼️‼️‼️ 5,000,000 images have been created with ArtBot!‼️‼️‼️ 🎉🎉🎉
- Fix: Kudos cost calculation update. Thanks to Litnine for the pull request.
- Fix: Issue where previous / next buttons were reversed if you had a filter applied. Also fix for navigation issues with the image popup window due to incorrectly parsing an image id. Thanks again to Litnine for the pull request. I love to see people contribute to ArtBot. Thank you!

# 2023.03.13

- Two steps forward, four steps back lately...
- Fix: Shortlinks were broken. Thanks to ResidentChiefNZ on Discord for letting me know.
- Fix: Errors creating an image using ControlNet due to invalid sampler setting. Thanks to voodoocode for reporting this.
- Fix: use for img2img button not working on image details page. Thanks to voodoocode for reporting this.

# 2023.03.12

- Fix: Kudos calculations should now be spot on. Thanks to Litnine on Discord for doing a bunch of legwork to get this correct.
- Fix: Properly saving input state and restoring it (where appropriate) should now work correctly. As well as copying images, making changes to input, etc. Thanks to Litnine, Hinaloth, and dreamy on Discord for the bug reports.
- Fix: Broken link on fly out menu for model updates. Thanks to TheGlosser on Discord for reporting this.

# 2023.03.10

- Refactored some logic around the favorite icon on the image modal. Should work much better now. Bonus: if you're on a desktop or laptop, you can now press "F" to quickly favorite or unfavorite an image (this also works on the image details page as well.)
- Fix: Issue where copying image params, modifying one settings, clicking generate and then going back restored settings from your initial request, rather than your most recent. Thanks to Litnine for finding this and the steps to reproduce.

# 2023.03.09

- Minor: Added an exclusion check for certain words used to trigger NSFW models.
- Fix: Favorite button appeared to be broken on image details page due to recent memoization change. Now properly busting the cache! Thanks to Litnine on Discord for reporting this.
- Added some additional logging around errors that occur when generating an image.
- Disabling favoriting an image from the popup modal for a bit. It is BUGGY.
- Fixed issue related to sharing image generation parameters for images that have been upscaled.
- Add a copy prompt button right from the pending items page. Thanks to "The I.B.A.K.T Committe" on Discord for suggesting this.

# 2023.03.08

- A few minor updates at the moment:
- Added debugging logic to capture some issues around kudos cost calculations.Thanks to Hinaloth and lili on Discord for their patience and continuing to work with me on this.
- Added some error logging around image ratings.
- Various performance improvements: memoize some expensive calls to image database, memoize API calls to Stable Horde, and lazy load items on the Pending Items page (fun fact -- I was working on another performance issue where someone has 56K images they've generated with ArtBot! So, I queued up something like 2,000 images and boy was the pending page slow. It crashed the tab in Chrome! Hopefully, it will work much better for you now!)
- A few more improvements related the pending items page. Remove some memoization that was incorrectly applied to an API call, which was resulting in some funky image requests. Things should now be stable.

# 2023.03.07

- UI: Remove persistent red dot for offline workers. Thanks to Gigachad on Discord for the suggestion.

# 2023.03.06

- I really, really, really fucked up image ratings. Awhile back (# 2023.01.28), I implemented a handy carousel component that slides in new images as you rate them. In my infinite wisdom, I forgot to update the image id that was sent to the rating API. Thus, as you rated images, your ratings were actually only being sent for whatever the first image that loaded on the rating page. db0, the Stable Horde creator, will have to delete nearly 338K suspect ratings from ArtBot. Ugggh. 😫
- Fix: Ratings are now submitted for the correct image.
- Feature: Select your preferred image download type (jpg, png, or webp) in the ArtBot settings panel.
- Feature: New Stable Horde performance dropdown so you can see current load on the Horde, as well as a quick status of any running worker.
- Automatically generate and process thumbnails for all new images. This will keep the image gallery much more performant, especially on mobile devices. Thanks to Litnine on Discord for raising awareness about this issue! There is also a setting on the ArtBot settings panel to manually process thumbnails for all previously created images.
- Thumbnail logic isn't working in certain instances. Added some debugging logic to investigate. (Of course, it works fine on my local machine, but the moment I push it live...)
- I setup a way to post global messages to ArtBot without having to push server updates. Going forward, I should be able to easily do things like post notifications if there are network issues or warn everyone about incoming server updates and give you a chance to save your work.

# 2023.03.04

- Fix: ArtBot was unable to fetch images from temporary backend storage after a recent update to the location of that service. Back in business!

# 2023.03.03

- Image rating is back!. db0 has been doing some work restoring the database and getting things back in order. It should mostly be online now. If you encounter any broken images (essentially, something has't been upload to the server yet), just reload the page for now. Note: rating your own images is temporarily disabled. It will be online soon™!
- Fix: Okay, NOW image rating is back for real. I forgot to update the hostname for the API when rating an image. Thanks to the mighty db0 on Discord for reporting this.
- Feature: Oh, boy. I built out a custom short link microservice for sharing image prompts. Now, the shareable URL is rather reasonable. Before, it encoded the entire image parameters object, which would result in URLs that were like 1000 characters long. Note: These shareable links will only works for text2img requests. Thanks to Gigachad on Discord for the suggestion.
- By fixing ratings, I broke them even more. Thanks to Litnine on Discord for letting me know!
- Argh! Sorry for all the sudden updates. Had a few hot fixes for things I had broke. This should be it for today!

# 2023.03.02

- Fix: Issue with invalid control\*type setting resulting in invalid payload validation errors. Thanks to Breaker for reporting this on Discord.
- Fix: inpainting and img2img masks would sometimes not utilize the existing mask. Thanks to dreamy for the detailed bug report related to this on Discord.
- I \_think\* I've fixed some issues related to stale a input cache, which was related to previous prompts not saving or being used correctly, incorrect kudos calculations, and a few other things. Do let me know if you still encounter issues!
- Various improvements to the worker details page, along with easier way to select a specific worker to send jobs to.

# 2023.03.01

- Updates are a bit slow because I am feeling under the weather. 😵‍💫
- Fix: Model details page pulling data from an invalid GitHub repo.
- I had to disable to ratings page due to some issues outside of ArtBot's control. hlky, who has generously helped to setup and run the image rating system for Stable Horde has taken the whole thing down for... reasons. (I am not exactly sure what, myself) Hopefully it will be back soon.

# 2023.02.27

- Fix: I broke the ControlNet page. Back in business, now! Thanks to Eleiber on Discord for reporting this.
- Due to a Stable Horde API change related to processing power, I've update kudos costs for images with weights. Each weight added to a prompt now adds an additional one kudo cost. e.g., "a (zombie:1.5) (clown:1.2) dancing a jig" would cost an additional 2 kudos. This also includes weights added to the negative prompt.
- Show error message for unsupported browser (specifically, Firefox in private browsing mode, as it does not support the IndexedDb browser API)
- Feature: Handy user profile page if you're logged in with your Stable Horde API key.

# 2023.02.26

- Only minor updates today...
- Discrete route for contact / feedback (since the modal was buried away on the about page and up above).
- Added an error boundary and automated error logging to better capture some pesky errors that people have encountered.

# 2023.02.25

- UX: Pressing "enter" within the prompt text area no longer automatically submits the request. This made sense when prompt length was limited to around 77 tokens, but no that those restrictions have been loosened, you can go wild! Thanks for suggesting this on Discord, ban kai!
- Fix: Stale values for control_type resulted in wildly incorrect kudos calculations when using text2img mode. Thanks to Hinaloth and lili for reporting this on Discord.
- When creating a new drawing canvas, attempt to pin the narrow margin to a max value of 512 pixels (due to worker processing constraints). Thanks to ResidentChiefNZ for the suggestion on Discord.
- Fix: Payload validation error due to stale control_type value. Thanks to etchebeast for reporting this on Discord.
- Feature: Upload an image to the drawing canvas. Thanks to DethInHFIL for the suggestion on Discord.

# 2023.02.24

- Fix: Incorrect kudos cost. Thanks for letting me know on Discord, "Bottom create button gang"!
- Feature: Add ability to favorite image from image modal.
- Fix: When filtering images on the /images page, the resulting image modal when end up showing all images (if you tried to navigate left or right), instead of just the filtered images. This was less than ideal.
- Fix: On image modal, navigating left and right with arrow keys did not match behavior or click left and right button on sides of image. Thanks for reporting this on Github, LastZolex!
- UX: Add better instructions that worker ID is required when trying to use a specific worker. Thanks for reporting on Github, vadi2!

# 2023.02.23

- Fix: Issue where sometimes the wrong image would be deleted when using this option from the image modal. Thanks for reporting this on Discord, gunsalem!
- Feature: DRAW MODE! Get your scribbles on. I had implemented a paint tool waaaaaay back on October 28, 2022. Then I ended up removing it only a few days later because I wasn't happy with how it turned out. It has returned! Check out the draw page. It's perfect for ControlNet.
- Fix: A few quality of life improvements when using the ControlNet page: added a dropdown menu with an option to stay on the page after clicking "create". Also added more robust logic for persisting settings between image generations (or if you navigate away from the ControlNet page). You can also remove an existing image while preserving the rest of the ControlNet settings.
- UI: On desktop devices, I added a dropdown caret to the NavBar to quickly access various features related to create mode (e.g., ControlNet and Draw)
- Fix: Kudos cost calculations should be much more accurate (though not exact and I am still working on that).
- My apologies for minor UI consistencies around the site as I go and update various parts of the interface at different times.
- Fix: Boy, this is awkward. I broke the image details page. But it is now fixed! Thanks to ANK95 on Discord for reporting.

# 2023.02.22

- Feature: ControlNet is ridiculously cool to play with! The backend Stable Horde volunteers are still debugging some issues related to it, so if you' re having trouble, hang tight! I've added a new page specifically for ControlNet, which simplifies getting started and removes options that are't currently available. Check it out!
- UX: Added some better tips and notes related to disabled parameters when using ControlNet (e.g., no hires_fix, no karras).
- Fix: Issue with multi-model select. Thanks for reporting on Discord, FORTTE!
- Fix: I broke the sampler select dropdown. It is now fixed! Thanks to Hinaloth on Discord for reporting this!
- Fixed: Incorrect background color for negative prompt library. Thanks to gunsalem on Discord for reporting this!
- Looks like the Stable Horde backend is choking right now. Put up a global server message.

# 2023.02.21

- Feature: Thanks to the hard work of hlky and ResidentChiefNZ, ControlNET is now available for img2img requests on the Stable Horde! Select any model from the models dropdown then select a relevant control type.

- Fix: Sending wrong value to API in control_type field.

# 2023.02.20

- MILESTONE: 🎉🎉🎉 4,000,000 images have been created with ArtBot! 🎉🎉🎉

# 2023.02.18

- Fix: Dropdown menu on image page was missing background, allowing underlying content to bleed through.
- Feature: On any image details page, you can click the img2img source picture (if it exists) and now view the original image provided to Stable Diffusion. If the image used inpainting or a mask, you can also toggle the mask on / off, as well as clone the mask and modify it as part of a new image request.

# 2023.02.17

- It's been quiet around these parts. Too quiet...
- Been heads down with real work lately, but fear not! I've also working on a bunch of under-the-hood / tech debt related to ArtBot.
- Not a lot of obvious user-facing stuff today. Updated a number of UI components to use NextJS built-in support for CSS modules instead of Styled Components. All of this work is ahead of some bigger UX improvements that I'd like to soon roll out for the desktop experience.

# 2023.02.14

- Fix: More pesky z-index issues. (This time, with the negative prompt modal being hidden).
- Disabled the fixed prompt area. It was causing too many issues. Back to the drawing board. Thank you for the feedback, everyone!
- Removed the character counter. Thanks to some recent improvements, Stable Horde can now accept prompts with more than 77 tokens! So get your Shakespeare on and submit those ridiculously huge prompts!
- Fix: Model trigger drop down was hidden. Thanks to TheGlosser for reporting on Discord.
- Refactor: Changed some behind-the-scenes logic on how the navbar and slide out menu work. In theory, it shouldn't affect things -- just getting some architecture ready for future UI improvements.
- Feature: Hi-res fix can now work on multiple images at a time. Thanks to ResidentChiefNZ on Discord for letting me know this is now possible on the Horde!

# 2023.02.13

- Some UI refactoring in today's update: For non-mobile devices, the navbar you see at the top of the screen has been modified and folded into the header itself (rather than as a separate row).
- On the image creation page, for non-mobile devices, I've changed the text area for the prompt to be fixed to the top of the screen as you scroll down. Is this okay? Is this annoying? Should it be a personal setting? Let me know! (FYI, I have disabled it on the inpainting panel, so you have max screen real estate for that mode)
- Below the advanced options panel, I removed the create image button. It sounds like this was an unpopular opinion. So, it's back! Thanks to Saw Dagon on Discord for letting me know how important they found it.

# 2023.02.12

- Added a helpful automated error message that shows up on every page if ArtBot is unable to connect to the Stable Horde backend API (...like this exact moment as I am deploying this).
- Fix: Issue with canvas settings being preserved between image generation requests, depending on settings. Thanks to FlameMind and Gigachad on Discord for reporting this and providing some video examples of what was happening.

# 2023.02.11

- Feature: Enable support for CLIP skip, a new feature available on the Stable Horde. What is it? It controls how early to stop processing a prompt. The higher the value (max of 12), the earlier the CLIP network will stop processing a prompt before being sent to a Stable Diffusion model.
- Feature: In the ArtBot settings panel, there is now an option that will preserve canvas / mask settings between image generations. Thanks to FlameMind on Discord for the suggestion.

# 2023.02.09

- Fix: In some situations, when ArtBot received an error response from the Stable Horde API, the error would cascade down and affect all pending jobs. I've added some new logic that should prevent this from occurring in certain scenarios.
- Feature: The fix is in! (The hires fix, that is, courtesy of some recent additions to the Stable Horde API). This allows you to create images at higher resolutions without inadvertently making multi-headed monstrosities. How does it work? It partially renders image at a lower resolution before upscaling it and adding more detail.

# 2023.02.08

- Minor fix: delete button not working on inpainting tab.
- Minor fix: change brush size slider not working on inpainting tab.
- Renamed "Stable Diffusion v.2.0 Inpainting" model because it was incorrect. It's actually "Stable Diffusion v.1.- 5 Inpainting". (Thanks to FlameMind on Discord for reporting this).
- Added a border to the mask and erase brushes in inpainting mode. This should make it a bit easier to see where you're painting if the background is white or red. Thanks to "💫." on Discord for suggesting this.

# 2023.02.07

- Fix: More work attempting to fix some issues with fixed header on mobile devices. If you're having issues where some UI elements get stuck underneath the fixed header and you cannot access them, please let me know! (Also, please send along what device / browser this is happening with.)
- Removed the "NoSleep" option for mobile devices, because it did not work.
- Attempting to fix an issue with inpainting / img2img masks not being properly set. Thanks to FlameMind on Discord for reporting this.
- FIXED! Content appearing under the header on mobile devices. To the beautiful, brave, anonymous soul who wrote in to tell me what device you were using when you encountered this issue, THANK YOU! (A 7th-gen iPod touch, effective screen width of 320px. Wow!) A quick test using XCode's handy iOS simulator verified what was happening. I had no idea. Thank you! For those following along at home, this is what they were dealing with.

# 2023.02.06

- UX: Change some behavior related to swiping between pages / images on mobile devices. Previously, it was way too sensitive. It should be a bit more forgiving now.
- Feature: Added some very simple performance stats fetched from the Stable Horde API to the general info page.
- On mobile devices, fix some issues with header (and content appearing within safe area on iOS).
- Fix a number of z-index issues with various parts of the UI after the recent fixed header update.
- Fix: A few more pesky z-index issues like unable to select dropdown menu on settings page (thanks for reporting, anonymous user!) and being unable to use model triggers on the create image page (thanks to Ano for reporting this via Discord).

# 2023.02.04

- Fix: On mobile devices, ad unit would show above delete confirmation modal. Thanks to gunsalem on Discord for reporting.
- Fix: Shareable links did not load proper model. Thanks to Gigachad on Discord for reporting.
- Non-user facing: Split up some code related to the FAQ in order to better show specific content around various parts of ArtBot (not implemented yet).

# 2023.02.03

- Fix: Update links to view detailed model info on image creation page. Thanks to voodoocode on Discord for reporting this.
- UX: Add scrollbar to prompt input text area to better help with accessibility. Thanks to kindagami on Discord for suggesting this.
- UX: Make negative prompt field a text area instead of input, giving a bit more visibility into what you have typed.
- Added some (hopefully unobtrusive) ads from Carbon. It's a network geared toward creators and developers. I am hoping it doesn't cheapen ArtBot and the little bit of potential income from it will be used to support the site (server costs ~$15 / mo) and donate some extra dollars to Stable Horde for their awesome service. If it really affects your experience with ArtBot, please let me know!
- Fix: Entering text in number field and then clicking plus or minus appended 1 to the value instead of adding it, similar to the issue on 2023.01.31. Thanks to Stable Horde user goxryX-mipja for reporting this.

# 2023.02.02

- Feature: Add an option to view image generation parameters from the pending items page. I often see people on Discord report receiving some sort of ambiguous error from Stable Horde. This should help with debugging what went wrong.
- Fix: Use trusted workers was always set to true, regardless of your preferences. This might help speed up image requests!
- When using a style preset, negative prompts were all sorts of screwed up (thanks to me). I have fixed behavior around this (as well as some more robust prompt validation logic).
- Feature: Warnings for excessive prompt lengths. Stable Diffusion only parses prompts that are ~77 tokens in length (about 300 characters). Anything exceeding this will be ignored. ArtBot now shows a warning if you hit this limit. (You can still submit an image request -- but the prompt exceeding this may not affect your image).

# 2023.02.01

- Pix2Pix incoming! Soon. It's currently in testing from one worker on the Stable Horde. Give it a try! I loves high step counts. And you can also add an image mask to specifically target an area of the image. (e.g., I highlight my dog's face and say "put sunglasses on it")
- UX: Hide kudos cost for image generation from non-logged in users. It's unintuitive at first and might turn some people off from creating anything. Props to ResidentChiefNZ on Discord for the suggestion.

# 2023.01.31

- Fix: When adjusting the a slider on the image creation page and then trying to type something into the number field, the value would be appended to whatever existed in the number field. Thanks to Hinaloth on Discord for reporting this.
- Fix: Use favorite models button was disabled. Thanks to Anon69 on Discord for reporting this.
- Fix: Plus and minus buttons appended a value, rather than added a value to any number input. (e.g., 10 + 1 = 101 instead of 11). Thanks to Hinaloth on Discord for reporting this.
- Update: CFG Strength / Guidance scale minimum steps changed from 1.0 to 0.5

# 2023.01.30

- Biggest and most obvious change -- getting rid of the imported Google font and defaulting to Helvetica. I was using Roboto (hah!), and thought it made things look more fun. But I did't really like relying on Google for the font, plus the slight performance hit was a turn off (which Chrome's own Lighthouse utility called out). So, we're going to try this Helvetica thing.
- Fixed some lazy loading issues from the main image creation page. Things should be snappier! Also, I was able to get a Lighthouse score of 100 on my local machine after this. It'll be interesting to see how that shakes out on production.
- Would you believe I am still working on issues related to the Pending Items page? I think I have them fixed finally. Really. Hopefully.
- Updated the README.md file in the ArtBot project's Github page. This should better help people who are curious about the project (or even want to contribute) get it up and running on their own machines.

# 2023.01.29

- Update styles dropdown on the create image page.
- Fix: Remove reverse sort order for completed items page. It caused items to jump around, which was problematic if you were trying to click on something to rate or delete. Thanks to "💫." on Discord for reporting this.
- UX: Add option to disable swiping between pages on image gallery page for mobile devices. Thanks to "Black Drapion" on Discord for the suggestion.
- Minor updates to the contact form, as well as HTML metadata. (Sadly, this has nothing to do with embedding data within images, which has been a popular request. If you happen to know of a way client-side way to do this within the context of a web browser, please let me know!)

# 2023.01.28

- UX: Queue up an additional image in background of rating tab -- this makes rating images seem faster!
- Fix: Clean up some logic related to the pending items page. It was a bit messy, prone to errors, sometimes the image preview you clicked on showed a different image in the popup modal. Just a sucky experience overall. Hopefully, things will work better now.
- Feature: Support for newly implemented "k_dpmpp_sde" sampler (commonly known as "DPM++ SDE or DPM++ SDE Karras" in other UIs)
- Feature: On mobile devices, the image modal will now have an additional share button that uses your device's native share panel -- for those instances where you want to share / post an image somewhere.

# 2023.01.27

- MILESTONE: 🎉🎉🎉 3,000,000 images have been created with ArtBot! You are all amazing. 🎉🎉🎉
- It's bug fixes all the way down!
- Fix: Star count was incorrect when rating your own recently created images. (It was 5, should be 6. Hey, I didn't make the rules! Just using what the API provides). Thanks to "💫." on Discord for reporting this.
- Fix: When a model has multiple trigger words, the trigger words run together on the model details page. Thanks to voodoocode on Discord for reporting this.
- Fix: On the image creation page, the trigger word dropdown would only show a single trigger if there were multiple trigger words. Thanks to Airic on Discord for reporting this.
- Feature: Add a link to delete all pending jobs. Useful when you (accidentally... ah hem, I am guilty) queue up about 700 images thanks to prompt matrices, multi-guidance, etc. Thanks to "💫." on Discord for suggesting this.
- Fix: After uploading an image to the inpainting tool, the web app would get stuck in an infinite loop, which prevented you from clicking on links in the bottom navbar (if on mobile devices). Thanks to Stable Horde user Underwater_Silver for the feedback on this!

# 2023.01.26

- Been pretty heads down lately and have been working on various things in the background. Among them:
- Better inpainting: Inpainting on ArtBot has always kind of... sucked. And it's been missing a feature added to Stable Horde awhile back: img2img masking, which was released way back at the beginning of November. I made some improvements around this experience and tried to give the interface a slightly updated coat of paint.
  - Inpainting and img2img masking aren't exactly the same thing, though from an end-user perspective, they both work in a very similar fashion -- you paint a part of an image that you want changed, type in a description and voila! With inpainting, you are limited to a very specific model (stable_diffusion_inpainting, based on SD v2). With img2img mask, you can use any model. Also, due to how resource intensive inpainting is, there are not many workers currently running the stable_diffusion_inpainting model, which has resulted in a ton of issues on ArtBot (error messages saying: "No workers available, try again later."). Things should work much better now! Head on over to the inpainting panel and try it out!
- UX: On mobile devices, replace interrogation icon / link with rating icon / link. The ratings page is used more (at least on desktop) and arguably more important. You can still find the interrogation page in the menu. (Thanks to Stable Horde user, Underwater_Silver, for the suggestion)
- Feature: Stable Horde recently added support for attempting to create tiled images. This is handy for creating fun backgrounds. Check it out, in the advanced options tab. (Note: It does not work for img2img or inpainting requests.)
- Fix: Copy prompt from the image details page forgot image orientation and resolution settings. (Thanks for reporting on Discord, Saw Dagon)

# 2023.01.21

- Feature: Artifact and image quality ratings added to recently created images.
- Feature: Anonymous users can now rate images (but you will need to log in to receive kudos)

# 2023.01.20

- Small improvements to how new images are loaded after rating a new image (trying to cut down on perceived delays while waiting for new image to load).
- Added an optional contact field to the feedback form. Some of you have really interesting suggestions... or bugs, and I would love to be able to reach out to know more.

# 2023.01.19

- Fix: Issue where typing anything in denoising strength field would result in a value of "NaN". (Thanks for reporting on Discord , voodoocode!)
- Fix: Settings page fetches latest kudos count when loaded. This should fix the issue where it appeared you did't receive kudos after rating an image (but you actually did, the user info cache was just stale).
- Feature: Now request multiple images using multiple guidance strengths. It works similar to the multi-step request feature added on 2022.12.20.
- Feature: Implement Stable Horde's artifact / image quality rating endpoint. Now, rate images for presence of artifacts, in addition to aesthetic taste.

# 2023.01.18

- Fix: Image creation page would sometimes forget various parameters under certain scenarios. I believe this is now fixed. (Thanks to "💫." on Discord for reporting this.)
- On the settings page, I've added more granular options for preserving both prompt and seed after creating an image. (All other options should be remembered and automatically saved as you change them).

# 2023.01.17

- Feature: New model updates page. Keep track of the latest models added to Stable Horde (and ArtBot), as well as any version bumps (or models being removed... ::sad trombone::). Thanks for the suggestion, anonymous user!
- Added some additional telemetry in order to track down a pesky issue related to kudos not updating after rating images.
- Minor fix: Changed how API calls were made to the rating endpoint. Hopefully this slightly speeds up your ability to rate images.

# 2023.01.14

- Save model version on image create and show in image details. Github #29
  - This is something I hadn't been doing before now. There are a lot of models now available on the Stable Horde (100 at the time of this writing!). And many of the models are being updated by their maintainers. Some models can drastically change output between differing versions, meaning that the same parameters and seed given to a different version of a particular model will result in a completely different image. In an effort to give more transparency into how your images have been created, ArtBot will now save the version of the model that was created with your image.

# 2023.01.13

- Fix: When using multi-models or all-models option, automatically add trigger word to beginning of the prompt.
  (Should this be optional? This should probably optional, eh?)
- UX: Reverse order of image direction. Most recent image should be left, right? (e.g., if you hit left arrow or swipe from the left side, you should be going toward more recent images?) See Github #24.

# 2023.01.12

- Fix: Swiping or using arrow keys when viewing modal from image gallery made the underlying gallery page change.
- Updated ratings API endpoint

# 2023.01.11

- Feature: You can now rate your recently created images and automatically send the results to LAION, via the Stable Horde. Provided you've created the image within the past 20 minutes and you have sharing enabled on the settings page, you'll be able to rate your image based on your aesthetic preferences. How do you rate an image? You use the...
- Feature: ...newly created image modal! This will pop up in various places around the site (pending page, images page, image details page when looking at related images). It allows you to quickly navigate between tons of images. On a mobile device, swipe on the picture. On a computer, hit the arrow keys. For those who like the bevy of options provided on the image details page, fear not: you can still access them (though it is one additional click) from the modal.
- Feature: Just kidding... sort of. Images should still detect middle clicks, so for those of you who like to visit the images page and middle click / open a bunch of images in new tabs, this should still work!
- UX: Drastically speed up image lookups from IndexedDb. I was using a fairly un-optimized query, which would cause lots of spinners when loading image details pages. NO MORE! (Hopefully)
- UX: Helpful warning if you're trying to create a new batch of images but have a fixed seed.
- Show rate image button on pending items page.
- When clicking on the image finished toast popup in the corner of the screen, load the image modal so you can instantly rate your image (if applicable).
- Fix: I had added a fixed seed warning when generating multiple images with a fixed seed, but forgot to take into account the scenario where you WANT a fixed seed (multiple models, multiple steps). Now, I just show a warning, but do not block you. (Thanks for the feedback, anonymous user!)

# 2023.01.10

- Fix: My refactoring of the star rating component broke... the star rating component. 😩

# 2023.01.09

- Fix: Better error handling if the aesthetic rating server goes offline.
- Split star rating component out so that is more reusable. (Will help an upcoming feature where you can rate your own images and send the result to LAION)

# 2023.01.08

- UX: Add number below stars on rating page.
- Fix: Copy prompt on image details page now copies the key as well.
- Minor fix: Persist image2text interrogation options.
- Added a link to Google Colab that allows you to easily setup a Stable Horde worker. Help out the community, earn kudos and learn a bit of Python while you're at it!
- Feature: Add option to send an existing image from your library to the image2text interrogation feature. (Thanks for the suggestion, anonymous user!)

# 2023.01.07

- Feature: Help improve future versions of Stable Diffusion by rating images. Each image you rate currently gives a reward of 5 kudos. For those of you who aren't able to run a Stable Horde instance on your local machine, this could be a great way to earn kudos.

# 2023.01.06

- A lot of cool improvements today, thanks to the power of feedback. Thank you!
- Fix: Recently created img2img images do not show a denoise value on the image details page. Looks like I broke this due to my model refactor waaaaaay back on 2022.12.22. (Thanks for reporting, anonymous user!)
- UX: On mobile devices, swap out icon on mobile footer for the interrogate page, as it is a more useful link. (Thanks for the feedback, anonymous user!)
- Feature: Ability to bulk delete related images from the image details page. (Thanks for the suggestion, anonymous user!)

# 2023.01.05

- Feature: More improvements to image interrogation. You can now upload images directly from your own device. Go ahead, I know you want to see how the API describes your face or your kid's most recent drawing! Also, you can now select multiple types of interrogations to run at once (caption, tags, nsfw).
- Neat: ArtBot was mentioned in an article about the Stable Horde in a recent post in PC World magazine. 😎

# 2023.01.04

- Feature: Support for Stable Horde CLIP interrogation. Send an existing image to the Stable Horde API and get a predicted caption generated by the API, NSFW status, or tags related to the image. Read db0's blog post about it. For now, it only works on images submitted via URL. (Direct image uploading coming soon)
- Feature: Proper kudos cost and image generation numbers on the create page.
  - When you create a new image request using combinations of various settings (like a prompt matrix, multiple steps, all samplers, etc), image counts can inflate pretty quickly. You now have more visibility into how many images you are requesting from the Stable Horde API, as well as updated kudos costs (total and per image).
- Feature: Added a new slide out menu system that's available across the app on both mobile and desktop devices. ArtBot is starting to get a lot of options, so this is a nice way to list everything available on the site.

# 2023.01.03

- Fix: Resolve issue with image sizes resetting to 512x512 after encountering an API error.
- Fix: Ensure old inpainting canvas has been removed prior to importing / uploading a brand new image.

# 2023.01.02

- Fix: Issue with importing image for use with inpainting when image width is smaller than canvas width.
- Fix: After yesterday's fix related to automatically adding image dimensions, we now automatically set custom dimensions for images imported via inpainting to nearest integer divisible by 64 -- this is something that Stable Diffusion requires. (You can override this, should you want to.)
- Fix: In some instances, image settings and requests were not reset if option to preserve settings was disabled.
- Attempt to fix inpainting scaling issues when importing via a mobile device.

# 2023.01.01

- Happy New Year!
- Fix: When importing an image for use with inpainting, automatically set custom dimensions of image request based on size of your painted image. (You can still change the size, but I find that this helps with preventing squashed images when inpainting if you forget to change the size).

# 2022.12.29

- Feature: Option to use a specific worker on the settings page. Useful for debugging purposes, testing your own worker, or testing new features.
- Minor fix: Loading spinner on workers page, typo on drop down.

# 2022.12.28

- MILESTONE: 🎉🎉🎉 2,000,000 images have been created with ArtBot! 🎉🎉🎉
- Minor fix: Typo on FAQ page.
- UX: After selecting text trigger from dropdown, automatically focus text area so you can keep typing your prompt.

# 2022.12.27

- Minor fix: Issues with showing correct dimensions for upscaled images in some situations.
- Minor fix: Correct hostname when copying links while running project in local environment (e.g., localhost vs tinybots.net)
- Minor fix: CSS alignment issues with popup modal that handles things like feedback and prompt history. I'd like to use this for some additional features in the future, so this better prepares things in advance.
- Change model trigger behavior to default always adding trigger to front of prompt.
- Thoughts behind this: Stable Diffusion tends to place more emphasis on words at the beginning of a prompt. If you're using a custom model, you probably want to trigger its special behavior, so placing prompt at front seems to make the most sense. Should this actually be a personal preference / configuration option? Let me know.

# 2022.12.26

- Feature: Removed the ability to automatically add trigger words to select models... because you can now manually choose where and which trigger words to add. If you select a model that requires the use of trigger words, you'll now see a dropdown button above the prompt field to choose various options.
- Removed snowflakes... until next year!
- Show model version on info page.
- Hitting ESC should now close popup modals and drop down menus.

# 2022.12.24

- Happy holidays and Merry Christmas! (If you're into that sort of thing.) For those of us inhabiting the upper half of our planet, it's winter time. ⛄️ I've added some festive snowflakes to celebrate. ❄️ (For those on the bottom half of the planet, what sort of thing signifies the holiday season for you? It definitely can't be snowflakes, right?)
- Feature: Added support for CodeFormers post-processing utility.
- Feature: Fine! Add ability to disable snowflakes on the settings page.

# 2022.12.23

- Refactor: Made some changes in model selection. Now, you can select any model available within the Stable Horde models database, even if 0 workers are available. In theory (hopefully, maybe), this means that a worker running dynamic models will eventually load your requested model. I am not entirely convinced that this works yet.
- Small UX improvements: Links to specific model details from advanced options panel. Links to view all favorite models. Display a warning for models with limited or no worker availability.
- Fix: In my model refactor last night, I broke the counter for checking if there are any workers supporting inpainting. This has now been fixed.

# 2022.12.22

- Fix: Restore ability for favorite models and multi-model select to generate multiple images at a time. I thought I was fixing an inadvertent bug I had introduced a long time ago. It turns out, it was a useful feature. (Thanks for the feedback on Discord, Black Drapion!)

# 2022.12.20

- Fixed: Better handling of situations where someone may have selected multiple images, then chose an option such as use all models. This would create a ton of image requests (e.g., 8 images x 68 models = 544 images!)
- Feature: Request multiple images by step count.
- Want to see how changing the number of steps affects image output? You can now pass in a comma separated list of values on the create image page and ArtBot will request multiple images. For example, requesting an image with steps of "2,4,16,24" will generate 4 images, each with a step associated with a specific value found within that list.
- Typo fixed in above text ☝️. (Thanks, anonymous user!)

# 2022.12.19

- Fix issue where selecting "useAllModels" after having stable_diffusion_2 selected would try to request an incorrect sampler for all remaining models.

# 2022.12.16

- Fix: Issue with denoise strength number input overflowing outside panel on mobile devices. (Thanks for reporting on Discord , voodoocode!)!)
- Fix: Negative prompts not showing up. (Thanks for reporting, anonymous user!)

# 2022.12.15

- UX: Can now select favorite prompts from prompt history and filter by favorite prompts.
- UX: Played around with slider arrangements and added plus / minus buttons to any number input field.
- Limit slider for logged in users to 150 steps (officially, you can still go up to 500, but trying to select a lower value using the slider was a pain). Thanks for the suggestion, anonymous user!

# 2022.12.14

- Fix: Settings page option for allowing NSFW images to be generated wasn't being respected.
- UX: Refactored some stuff related to drop down menus. For the most part, you won't see any changes, but you can now click outside the dropdown menu to make it automatically close.
- Feature: Prompt history! Click the handy clock icon at the top of the create image page and you'll see a running list of all prompts that you've used (starting as of today).

# 2022.12.13

- MILESTONE: 1,500,000 images have been created with ArtBot!
- UX improvement: Added sliders to the various inputs on the advanced options panel. This is especially helpful for mobile users. (Thanks for the suggestion on Discord, bigdawg!)
- Added a pseudo-realtime counter for total number of images generated with ArtBot on the about page

# 2022.12.12

- UX improvement: Added an additional "create" button below the advanced options panel. (Thanks for the suggestion on Discord , voodoocode!)
- Feature: Bulk download of PNGs. The Stable Horde API has long served images in WebP to save bandwidth. Now, when you request a bulk download of image data, they are automatically converted to PNGs inside your browser. Note that this process may take some time depending on your device and the number of images you've selected. (Thanks for the suggestion on Discord, honeypony!)
- Feature: You can now export all image data at once from the settings page. On my local machine, I was able to export 2100 images and the archive file was 1.4GB in size. An corresponding import feature will come soon, allowing you to import your data to a different device.

# 2022.12.09

- Sounds like DNS propagation has taken awhile, but ArtBot seems to be coming back online to various people around the world. I apologize for any delays. I wish DNS updates would happen faster.
- Fix: Issue where adding multiple models to an image request already using stable_diffusion_2 would cause API payload validation errors due to incorrect samplers. (Thanks honeypony on Discord!)
- UX: There have been few workers offering inpainting services lately due to memory leaks and crashing issues when running an inpainting model. Now, when no workers are available, the inpainting panel will actually tell you this. No more mysterious wait times (hopefully).

# 2022.12.08

- Fun fact: ArtBot had been hosted on a Raspberry Pi running in our hallway closet this whole time. I decided to do some server updates... and broke everything. My apologies for the site being down awhile today. However, ArtBot is now on a legit hosting service. No more Raspberry Pi!
- Enable fetching images from Cloudflare R2 by default.

# 2022.12.07

- Fix: Pesky bug that duplicated all image requests if "use all samplers" was selected and the image job had encountered an error. (Thanks, anonymous user!)
  Refactor: Split up some components for better reusability. In addition to you being able to manage your own worker, you can also see a list of all workers currently available on Stable Horde, as well as their performance stats.

# 2022.12.06

- Fix: Issue with attempting to use non-trusted workers. (Thanks voodoocode!)
- Added option to search model and sampler drop downs. (Thanks voodoocode!)
- Update style presets.
- Feature: Select favorite models and then generate images against them. You can select your favorite Stable Diffusion models here.
- Feature: Generate a series of images using all available samplers. Works best if you fix the seed ahead of time.

# 2022.12.05

- Fix: "Save input on create" option wasn't working. (Thanks for reporting, bigdawg on Discord)
- Feature: Support for using a prompt matrix. For example: "Beautiful forest full of trees by {Bob Ross|Thomas Kinkade}" will create two images, one with the Bob Ross parameter and another with the Thomas Kinkade parameter. This mode works best if you fix the seed ahead of time.
- Add kudos cost calculation when modifying image parameters.
- Added experimental option to get images from Cloudflare R2 service (this will be default behavior in the future). For end users, this means the potential for generating real lossless images.
- Added an option to stay on create page after requesting a new image.

# 2022.12.04

- Experimental feature: Added a "no sleep" option to the settings page which uses background audio APIs to keep your mobile device screen awake.
  - This is useful in instances where you may have queued up a large number of images on your mobile device and want the process to continue running. This is an experimental feature. Leave me feedback if anything looks amiss.

# 2022.12.02

- Shareable model information. Do you want to know more about Clazy? Or maybe share the details about this particular model with a friend? Easy! Hit the link icon next to the model name.
- Updated inputs in advanced options tab to be number fields (and make it easier to step between values). Thanks voodoocode!

# 2022.12.01

- Refactored the pending items page. Previously, if you queued up a whole bunch of images, things would jump around, disappear, etc. It was just an annoying experience for everyone.
- Refactored the settings page. The layout is more logical now. There is also a simplified tool for managing workers (if you happen to be contributing your GPU power to The Horde).
- Feature: Automatically restore prompts after server is updated.
  - If you have been bitten by the issue where I push an update to ArtBot while you're in the middle of writing a prompt and then lose everything because the page reloads... I'm really sorry! This should no longer happen! Your prompts (and associated image generation settings) will be automatically restored after future server updates.
- Add some additional telemetry to better log requests created using the beta option for better error handling and performance monitoring.

# 2022.11.29

- Fix: Finally fixed the pesky bug where everything would disappear from pending items page when you clicked retry or delete.
- Feature: Styles! Are you having a hard time coming up with a prompt to give you good looking images? Over on the Stable Horde Discord channel, Db0 has implemented a bot that can make it easier to emulate a number of different art styles. There is now a styles dropdown below the prompt text box where you can choose one of these style presets. You can see prompt details related to various styles on Github.

# 2022.11.28

- Refactor: More work on caching model data from Stable Horde API so that it is immediately available on page load.
- Fix: Clicking the "upscale image" link from any image details page should now work properly. (I broke this while trying to create some new classes for handling image requests, re-roll requests, and upscale requests.)

# 2022.11.27

- Fix: Resolve issue where sampler field would be empty when switching from stable_diffusion_2.0 model to something else. This would cause API errors when submitting a new image request. (Thanks for reporting this, anonymous user!)
- Fix: Resolve issue with "use all models" option not actually using all models. (Also, thanks for reporting this, anonymous user!)
- Fix: Number of images calculation was wrong. (Thanks for reporting, KyuubiYoru). I also added multi-images per model when using multi-model select. (e.g., if you choose 3 different models and want to generate 4 images, you will get 4 images per each model)
- Fix: Upscaling an image that had been created with the "useAllModels" option created a new batch of images using every single model available, instead of just one.
- Minor feature: Created a micro-service to better push relevant updates to ArtBot front page without having to redeploy. This handles the "API is currently under high load..." warning you might have seen as of late.

# 2022.11.26

- MILESTONE: 🎉🎉🎉 1,000,000 images have been created with ArtBot! 🎉🎉🎉
  - Absolutely amazing. Thanks to everyone for suggestions, feedback, and using the site. This has been a fun side project and I'm very grateful to Db0 and the rest of the Stable Horde community for creating such an awesome project! Here's to the next million. 😎
- Feature: Shareable links. This is something I've wanted to do for awhile and StableUI (the other big Stable Horde web UI), recently implemented it. Now you can share your ArtBot image generations with others. For example: Smiling aristocrats holding slices of ham.

# 2022.11.25

- Stability.Ai released their Stable Diffusion 2.0 model yesterday. The model was quickly added to Stable Horde and due to increased demand, the cluster has been under a pretty heavy load (all Stable Horde UIs seem to be slow lately). Things seem to be getting a bit better, but requests are still a bit slow. You can try out the new model here.
- Fix: Implemented better caching of model details and model availability on my own server. Various API calls to the Stable Horde API were encountering response times of up to 10 seconds. This made the whole ArtBot experience... not very pleasant.
- Fix: Finally remember selected model when navigating between pages!
- Fix: Multi-model select dropdown stays open after selecting an initial model.
- Fix: When choosing to generate multiple images, only 1 image was ever generated.
- Fix: Fix issue where pending items page showed there were active pending jobs, but nothing appeared on the page.

# 2022.11.23

- MILESTONE: 900,000 images have been created with ArtBot!
- Refactored some things related to fetching model details to better cache data and hopefully make the info page snappier.
- Minor: Update various packages.

# 2022.11.22

- Feature: New info tab with stats and information about all models currently available via Stable Horde. See which models are in high demand, how many workers are currently serving the model and how many images you've generated with each model.

# 2022.11.21

- MILESTONE: 800,000 images have been created with ArtBot!

# 2022.11.20

- Fix: If a pending image job encounters an error state (e.g., max concurrent requests, invalid params, anon user limits, flagged prompt, horde offline, etc), all related pending jobs will automatically have the same error state applied. This will prevent us from unnecessarily slamming the Horde API and potentially having requests from your IP address throttled.
- Because of the above fix, we can now update max images per job. Lets bump it up to... 100!
- Initial support for new showcases field in the Stable Horde API that highlights example images for each model.
- Added optional setting to allow web app to run in background tab.

# 2022.11.19

- Fix: Resolve issue with allowing the generation of NSFW images and which workers a job was sent to.
- Feature: Added option on settings page to preserve image generation parameters after creating a new image.
- Feature: Show kudos associated with your StableHorde account. (Thanks to Florian for the PR)
- Fix: Trusted worker option on settings page would not remember value after leaving tab.

# 2022.11.18

- MILESTONE: 700,000 images have been created with ArtBot!

# 2022.11.17

- Fix: useAllModels option was broken after the refactor I did yesterday. It's now fixed.
- Fix: Sort by number of available models in model select dropdown on the create page.
- Feature: The Horde now supports upscalers like RealESRGAN_x4plus and face correction tools such as GFPGAN. These have now been added into ArtBot (see both the advanced parameters on the image generation page, as well as the advanced options below any image).

# 2022.11.16

- MILESTONE: 600,000 images have been created with ArtBot!
- Tackling some personal tech debt -- refactored how models are fetched and cached from backend API
- Refactored some telemetry tooling for determining which features are used, what things break, etc.
- Support for multi-trigger select for available models (currently only 1 available). You can mix and match potential triggers to change the style of a supported model.

# 2022.11.14

- MILESTONE: 🎉🎉🎉 **500,000** 🎉🎉🎉 images have been created with ArtBot!!! The pace has definitely picked up. That is awesome to see.
- Replaced document.hasFocus() with document.visibilityState so that images can still be requested and fetched if ArtBot is visible in another tab or monitor. Big thanks to "headhunterjack" on Discord.
- Feature: Negative prompt library on the create page. Rather than having to remember to repeatedly paste in a negative prompt, you can now optionally save the prompt as load it by default. You can also save multiple negative prompts!

# 2022.11.13

- Feature: Preserve input settings when navigating around ArtBot.
  - It's frustrating to have added all sorts of input for an image and then you click some other link on ArtBot to check something and then all the data is lost when you return. No more! Data is preserved if you move away from the create page. This state gets reset when you create a new image.

# 2022.11.12

- Fix (hopefully): When re-rolling existing images or retrying pending images, sometimes ArtBot would forget what model you had originally selected and revert to the default model ("stable diffusion").
- Fix: Selecting random in the models dropdown never actually selected a random model.

# 2022.11.11

- MILESTONE: That was fast. 400,000 images have been created with ArtBot!

# 2022.11.10

- Fix: When using the "use all available models" option, do not send a request to "stable_diffusion_inpainting".
- Added number of currently available models to "use all available models" option.
- Feature: Navigate between multiple pages on images page using arrow keys on a computer or swiping on a mobile device.
- Fix: Adjusted max steps (down) for various samplers for anonymous users -- this contributed to a number of frustrating error messages from the Stable Horde API when trying to create images.
- Fix: I think I found the issue with the pesky "90 per 1 minute" rate limiting error. A number of people open images up in new tabs. Each one of those tabs is firing off API calls to Stable Horde (especially if you are generating and checking a number of image requests). This makes it easy to inadvertently hit a rate limit and get unexplained errors. Now, API calls will only happen in the active browser tab. Things should be much smoother now. Thanks to "webhead" on Discord for helping me to track this down.

# 2022.11.09

- MILESTONE: 300,000 images have been created with ArtBot! (33,000 in the last 24 hours)
- Made a number of improvements to pending items page, such as filters and options to edit or retry image requests when an error is detected from the Stable Horde API.
- Thanks to some refactored logic with the pending items queue, I've upped limit of images that can be requested at once.
- Fix: issue where clicking "re-roll" on an image created with the "use all models" options resulted in re-running the job again... the whole thing (this meant 20+ new images, when you probably only wanted one).
- For those so inclined, I added a buy me a coffee link to the about page.

# 2022.11.08

- Feature: Bulk download images from the images page. Hit the select button in the top right, pick the images you want and then click the download link. A zip file will be created with your images, as well as a json file that lists all the relevant image generation details (handy if you need to recreate or reference the image details later).
- Feature: Generate an image using all models at once! In the advanced options panel on the create page, scroll down and select "use all available models". You will get an image back for each model currently available on Stable Horde.

# 2022.11.07

- Fix denoising strength not showing up on advanced options panel when creating a new img2img request. (Note: due to limitations with the Stable Horde API, denoise is only available for img2img and not inpainting)
- Updated max steps to 500 for logged in users, providing you have enough kudos (add your Stable Horde API key to the settings page to log in).
- Fix: You can now choose random models again.
- Model descriptions now added below dropdown on advanced options panel. If a custom model requires the use of a trigger to activate, it is now automatically added to the beginning of your prompt when sent to the API.
- Added advanced option to use the karras scheduler, which should help improve image generation at lower step counts.
- Feature: You can now use the left and right arrow keys (on desktop), or swipe left and right (on mobile) to navigate between related images on each image page... providing they exist, of course. Additionally, on desktop, if you tap "F", you can quickly favorite or unfavorite an image.

# 2022.11.06

- Feature: Mark images as favorites, and filter images on the main gallery page (by favorited / non-favorited, image generation type and more to come soon).

# 2022.11.05

- Feature: Bulk delete images from the images page. Just hit the select / checkmark button in the top right to start choosing. I will bring this to the image details page in the near future.

# 2022.11.04

- MILESTONE: 200,000 images have been created with ArtBot!
- Add dropdown menu button to images page to change sort order of images and layout
- Better limits and validation for advanced parameters on the create image page, this is especially helpful for logged out or anonymous users.
- Make ID of the worker that generated an image visible on image details page. This is useful in case you need to report an unsavory worker that is running within the cluster. You can report these sorts of images on the [Stable Horde Discord channel](https://discord.com/channels/781145214752129095/1027506429139095562).

# 2022.11.03

- FEATURE: Big changes! Inpainting is now live. Upload a photo from a URL, from your device or even use an existing image that you've created.
- FEATURE: Custom image orientations (you are no longer limited to the few aspect ratios I provided for you). Image dimensions must be divisible by 64, but I handle that for you after you've entered your desired dimensions.
- In my endless tinkering, the advanced options panel on the create page is now open by default.
- Added some validation to various input fields inside advanced options, as well as subtext defining the required parameters.
- Temporarily removed painter page while I refactor a few things to make it more mobile friendly (and to tie into the existing img2img and inpainting system)
- Add ability to sort images page by newest or oldest images, as well as the ability to jump to the beginning or end of your image collection.

# 2022.10.30

- Add some debugging logic to attempt to capture some pesky "server did not respond to the image request" errors that some people are encountering. Pretty sure it's something on my end and not with the Stable Horde cluster.
- Small design change to paint page to make toolbar and overall theme more consistent across dark / light mode.
- Fix: Hide inpainting model from models dropdown in non inpainting contexts. (e.g., selecting a model from the dropdown menu when doing a simple text2img prompt)
- Small feature: Support for uploading images into the painter page

# 2022.10.28

- NEW FEATURE: 🎨 Painting! You can now paint your own images and then send them to the img2img feature.
  - Turn your cheesy drawings into awesome AI generated art. This is somewhat in beta as I'm working out some kinks with the painting library (Fabric.js). This should also lay the groundwork for inpainting support once the Stable Horde cluster supports it.
- Show source image on details page if an image was generated via img2img. Also added an upload icon in the top right corner of this source image, so you can quickly create / modify a new prompt using the original image.

# 2022.10.27

- Add light / dark theme options
- Currently locked to system settings, but I will add an option for user preference in the future.
- Refactored "advanced options panel" on [main create page](/).
  - The thinking here is to simplify the front page as much as possible. If someone has no experience with generative AI art, let them quickly create something.
- Refactored pending item component (background color, text spacing issues)
- Fixed: issue when attempting to choose a random sampler.
- Fixed: issue where choosing a model (e.g., stable_diffusion) would get saved as a variable for samplers, resulting in payload validation errors from the API. This is why testing your code is important. Ah hem.
- Track initial estimated wait time returned from API
  - Relates to future feature that will attempt to detect if job has gone stale and attempt to retry / resubmit
- Add new contact form accessible from the [about page](/about). Questions, comments, or bug reports? Send me a message.

# 2022.10.24

- MILESTONE: 100,000 images have been created with ArtBot!
- You can now import images directly from a URL in order to use the img2img feature with stable diffusion.
- In the models dropdown list, you can now see the number of workers running each model
  - More workers generally means quicker generation times. This is helpful if you want to crank through a number of images.

# 2022.10.20

- img2img support is now live for **ALL** users!

# 2022.10.18

- PURE CHAOS MODE: Add random option to orientation, sampler and models. Try a random selection on one... or all three if you're crazy.

# 2022.10.17

- img2img support is live for trusted users (generally those who are contributing back to the Stable Horde with GPU cycles).
- Initial work on getting ArtBot setup as a proper Progressive Web App (PWA)
- Add it to your mobile device home screen for a more app like experience
- Add simple pagination buttons for [images page](/images) (things were getting slow if you had a lot of images stored in the browser cache).

# 2022.10.14

- MILESTONE: 10,000 images have been created using ArtBot!
- Add option to download PNG of your image
  - Due to bandwidth constraints, the Stable Horde sends images as a WEBP file. This isn't always optimal for downloading to your local device. On each image details page, you will see a download button (down arrow).

# 2022.10.11

- MILESTONE: 1,000 images have been created using ArtBot!

# 2022.10.09

- ARTBOT IS OFFICIALLY LAUNCHED! 🎉🎉🎉
- Quick fix: You can now generate more than 1 image at a time.
