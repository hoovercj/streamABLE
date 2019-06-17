# StreamABLE

People are increasingly spending their time watching streamers play video games on platforms like YouTube and Twitch. Games like Minecraft, League of Legends, and Fortnite are even more popular than shows like Game of Thrones. Both online and in-person communities are built around these games. However, this provides unique challenges for those with visual impairments who wish to participate in these communities.

![LCS SummerL 100 Thieves vs Clutch Gaming. 106,538 current viewers. 1,145,616,789 total viewers.](/docs/images/lol-viewer-count.png)

Take the official League of Legends stream on Twitch, for example: It often has over 100,000 concurrent viewers and over a billion views in total. While the commentary on its own is entertaining, there is a lot of visual information on the screen that is not available to people who can't see it. The goal of this project is to make it easy for anyone (game companies, streamers, sighted allies, etc.) to tag this information and empower visually impaired viewers to more fully participate in streaming communities.

## Proof-of-Concept

The current proof-of-concept works on Twitch and Youtube with any stream that uses the League of Legends tournament overlay shown below:

![Leage of Legends tournament overlay with information highlighted.](/docs/images/lol-tournament-hud.png)

The extension analyzes the stream and renders hidden text to the DOM that the user can then find with a screenreader:

```html
<div id="streamable-screenreader-content" class="screenreader">
  <div id="streamable-screenreader-content-Time">Time. 06:53</div>
  <div id="streamable-screenreader-content-Kills-Blue-team">
    Kills: Blue team. 0
  </div>
  <div id="streamable-screenreader-content-Kills-Red-team">
    Kills: Red team. 1
  </div>
  <div id="streamable-screenreader-content-Gold-Blue-team">
    Gold: Blue team. 9.7k
  </div>
  <div id="streamable-screenreader-content-Gold-Red-team">
    Gold: Red team. 11.2k
  </div>
  <div id="streamable-screenreader-content-Name-Blue-team">
    Name: Blue team. 100
  </div>
  <div id="streamable-screenreader-content-Name-Red-team">
    Name: Red team. CG
  </div>
</div>
```

## Roadmap

The immediate focus of this project is to tackle the low-hanging fruit of statically-placed, textual information in game UIs. Things such as kill counts, timers, and scores. This project aims to make it as easy as possible to add immediate value without needing to gather large data sets or write any code. This means that more advanced techniques relying on template matching or machine learning are out of the scope of this project in the short term. However, as the streaming audience grows and more viewers are empowered to participate by this technology, there will be more incentive to invest in specialized solutions catered to individual games.

### Template Creator
The extension will allow sighted users to create and edit templates by highlighting regions of the screen, labeling them, and classifying them as text, numbers, timers, etc.

### Settings and Customization
Users should be able to fully customize their experience:
* Easily import templates
* Disable, rename, or set a new type for each region
* Configure the refresh rate, or disable auto-update entirely
* Mark important fields to be read automatically when they change

### No AND Low Vision
Users of all abilities should be able to enjoy video game streams
* Make text available to screenreaders
* "Zoom" in on small text for low-vision users

## Get Started


### Usage
- Run `$ npm install`
- Run `$ gulp --watch`
- Load the `dist`-directory into chrome.
- Open a League of Legends stream with the tournament overlay
- Open the chrome devtools and switch to the "StreamABLE" console context
- Analyze the video feed:
    - Run: `analyzeAndRender()` to analyze it once
    - Run: `startAnalyzeLoop()` to analyze the video every few seconds
- View the output:
    - Use `document.getElementById('streamable-screenreader-content')` to manually inspect values in the DOM
    - Use screenreader shortcuts to search for the hidden content

## Contributing

See [CONTRIBUTING](/docs/CONTRIBUTING.md) for more info.
