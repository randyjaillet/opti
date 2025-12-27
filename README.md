# Opti

Opti replaces native `<select>` elements with an accessible, searchable UI that stays in sync with the underlying form control. It ships with multiple visual themes, light/dark schemes, and a demo playground showcasing mutation observers and keyboard support.

## What it does
- Mirrors the state of the original select (disabled, multiple, preselected options, optgroups) and writes changes back to it.
- Provides full keyboard navigation, search-as-you-type, clear-all, and tag-style chips for multi-selects.
- Reacts to DOM mutations on the source `<select>`: toggling attributes, enabling/disabling options, and adding/removing options or optgroups.
- Exposes each instance on `window.optis` and offers a small method surface for programmatic control.

## Quick start
1) Include assets (and jQuery 3.7+):
```html
<link rel="stylesheet" href="styles/main.css">
<link rel="stylesheet" href="styles/theme.css"> <!-- theme tokens -->
<script src="https://code.jquery.com/jquery-3.7.1.slim.min.js"></script>
<script src="scripts/main.js"></script>
```

2) Add a select (optionally mark it up for auto-init and theming):
```html
<select id="flavors"
        data-opti
        data-theme="glossy"
        data-scheme="dark"
        data-opti-options='{"useFirstOptionAsPlaceholder": true}'>
  <option value="">Choose a flavor</option>
  <option value="vanilla">Vanilla</option>
  <optgroup label="Berry">
    <option value="strawberry">Strawberry</option>
    <option value="blueberry">Blueberry</option>
  </optgroup>
</select>
```

3) Instantiate (pick one):
```js
// jQuery plugin
$('#flavors').opti({ classes: 'my-custom-class' });

// or constructor
new Opti($('#flavors'), { showClearAll: false });

// or rely on data-opti (auto-instantiates on DOM ready)
```

## Options
- `shortModeThreshold` (number, default 7): Hide the search UI when there are fewer than this many options (typing still reveals search).
- `useFirstOptionAsPlaceholder` (bool|string, default false): Move the first option into a non-selectable placeholder; string form matches on value.
- `classes` (string): Space-separated classes appended to the Opti root.
- `showClearAll` (bool, default true): Show or hide the surface “clear” control.
- `firstOptDefault` (bool, default true): In single-select mode, start with the first option selected when there is no placeholder and nothing preselected.

Options can be supplied in three ways, highest priority first: jQuery plugin argument → `data-opti-options` JSON → defaults. Multiple sources are merged.

## API surface
Instances live at `window.optis[index]` and the root element carries `data-opti-index`.
- `destroy(preserveSlot?)`: Tear down and restore the original select. If `preserveSlot` is true, keep the same index slot.
- `showMenu(focusOnSearch?)`: Open the dropdown (defaults to focusing the search unless in short mode).
- `hideMenu(focusOnSurface?)`: Close the dropdown (defaults to refocusing the surface).
- `chooseOption(vals [, setFocus, noFade])`: Select by value/string array or list-item jQuery object; respects multi/single behavior.
- `unchooseOption(vals [, callback, callbackArgs, focusTarget, dontUpdateSelect, noFade])`: Remove selected values; handles animations and select syncing.
- Getters: `isZeroState`, `isBlank`, `isPlaceholder`.

## Keyboard navigation
- Surface: `Space`/`Enter` opens; `Up`/`Down` cycles options without opening; `Backspace` removes last choice.
- Open dropdown: `Up`/`Down`/`Home`/`End` moves fake focus; `Enter` selects; `Tab` selects (single mode) and blurs; `Esc` closes.
- Search input: typing filters; `Backspace` on empty input removes last choice; arrow keys mirror the open dropdown behavior.

## Mutation observation
Opti listens to the source select for:
- Attribute changes: `disabled`, `multiple`, option `disabled`.
- Node changes: adding/removing options or optgroups (including nested edits).
Updates apply to the Opti UI without needing to target the custom element directly.

## Theming
- Set `data-theme` to any of: `glossy`, `gradated`, `standard`, `outline`, `compact`, `minimal`.
- Set `data-scheme` to `light` or `dark` (theme files provide scheme-specific tokens).
- CSS variables drive spacing, colors, and radii; see `src/styles/abstracts/_variables.scss` and theme files for reference.

## Development
- Source lives in `src/` (Pug, Sass, and JS). Built/demo assets are in `build/`.
- The project is set up for CodeKit (see `config.codekit3`); it compiles `src/index.pug` → `build/index.html`, `src/styles/*` → `build/styles/*`, and concatenates JS via `src/scripts/main.js` (which prepends `_opti.js`).
- If you are not using CodeKit, compile Sass yourself (e.g., `sass src/styles/main.scss build/styles/main.css` and `sass src/styles/theme.scss build/styles/theme.css`), then bundle `src/scripts/_opti.js` into `build/scripts/main.js` in front of any demo code you add.
- Open `build/index.html` to exercise the demo, mutation sandbox, and theme switcher.

## Notes
- Demo-specific assets (`build/styles/demo.css`, `build/scripts/demo.js`) are only for the playground.
- jQuery is the sole runtime dependency; everything else is vanilla JS and CSS.
