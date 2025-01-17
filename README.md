# MIDIsplainer Chord Dictionary
A simple web app to produce a chord dictionary, part of a repo for music-related code.
## Inspirations
The most direct inspiration for this specific web app is [Claude AI’s artefact feature](https://www.anthropic.com/news/artifacts). The code started as a very simple experiment, while exploring options for LLM-enhanced coding. It already grew a bit.

While working on chord progressions in [PdLua](https://agraef.github.io/pd-lua/tutorial/pd-lua-intro.html), a need emerged for chord information in a machine-readable format, digestible by Lua and transmittable by [Plugdata](https://plugdata.org). Searched online, thinking there was a JSON file with everything needed. Not quite so simple. So, from a simple need came a set of ideas which converge into this simple webapp.

The longterm inspiration came from [Set Theory](https://en.wikipedia.org/wiki/Set_theory_(music)) as applied to music, in large part because a number of notions from a broad approaches to Music Theory afford explanations in combinatorics and a variety of mathematical operations.

There are sites out there which provide extensive [Pitch Class Set](https://en.wikipedia.org/wiki/List_of_set_classes) information about diverse collections of notes, particularly [scales](https://allthescales.org). However, chord dictionaries tend to focus on other approaches (mainly, [guitar playing](https://tabs.ultimate-guitar.com/tab/lessons-guitar/all-the-chords-chords-99108)). At least [one site](https://ianring.com/musictheory/scales/traditions/chord_names) provides all the necessary information about chords… in a structure which isn’t directly amenable to treatment as a chord dictionary. And there’s [code available](https://github.com/tonaljs/tonal/blob/main/packages/chord-type/data.ts) which does work for chord dictionaries… which does require a bit more processing to be immediately useful.

In other words, this branch is a subproject with multiple origins.

## Approach
So far, with initial commits to this branch, all the code has been generated through interactions with LLMs, mainly Claude AI and ChatGPT. Most of those interactions consist of requesting new features, applying patches suggested by the LLM… and correcting the bugs and code regressions which ensue.

There's also a decent bit of planning as to which features would make sense and checking on the outputs from the app’s simple processing. Yet it’s mainly been about getting interesting results quickly and having to backtrack based on the awkwardness of LLM-based coding.
