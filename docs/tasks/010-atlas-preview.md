# Task 010: Real-geography atlas preview (local only)

Claude Code, 11 October 2026. The work is on branch `tech/010-atlas-preview`, in the worktree `C:\Users\evanr\IsaacIshmael-atlas-010`. It starts from public `main` (`3c17b89`), so no unpublished research is in its history. **Not pushed or deployed.** The live interface demo is unchanged.

## Geographic source

| Item | Value |
| --- | --- |
| Provider | [Natural Earth](https://www.naturalearthdata.com/), a public-domain map dataset built by volunteer cartographers and supported by NACIS |
| Licence | **Public domain.** The [terms of use](https://www.naturalearthdata.com/about/terms-of-use/) say: "All versions of Natural Earth raster + vector map data … are in the public domain." No permission or credit is required. We still credit it using the suggested wording: "Made with Natural Earth." |
| Third-party parts | The terms list separately licensed contributions: European rivers and lakes (JRC), North American roads, time zones, and Washington Post data. **None is used here.** The European supplements are separate files outside our area. |
| Scale | 1:10m, the most detailed of the three Natural Earth scales ([features](https://www.naturalearthdata.com/features/)). Adequate for a regional reading map, not for local or legal precision. |
| Coordinate system | WGS84 longitude/latitude (from each layer's `.prj`) |
| Distribution | Official shapefile zips from `https://naciscdn.org/naturalearth/10m/physical/`, as linked from the [1:10m physical vectors page](https://www.naturalearthdata.com/downloads/10m-physical-vectors/) |
| Accessed | 11 October 2026 |

Layers used, with the version from each zip's `VERSION.txt`:

| Layer | Version | SHA-256 of the downloaded zip |
| --- | --- | --- |
| `ne_10m_land` | 5.1.1 | `e547d749445eaa0964aba76738090ec88f5e63c4585122170f98c67a7ea922dc` |
| `ne_10m_lakes` | 5.0.0 | `0803a06f9c3cb4671d89b68c48b142aad9366ba40f665245e12a913fbc61722a` |
| `ne_10m_rivers_lake_centerlines` | 5.0.0 | `ded71b01870855ccfe19b51f2ec14c9bb48fae23c0e9f3c11974d426433b5c38` |
| `ne_10m_geography_marine_polys` | 5.1.0 | `a2d3395904c41e718e02c3ec5bc988712164c524c236fad32d95d282ca303b2a` |

No terrain layer is included. Natural Earth's shaded-relief rasters are also public domain, but cropping them needs raster tooling and would add tens of kilobytes or more per view. It can be added later if wanted.

## What the preview shows

- **Pages.** `/en/atlas/` and `/es/atlas/`. They are generated only by `npm run build:preview` and never by the production build.
- **Area.** 31.0–37.4° E and 28.5–34.0° N, which covers the Mediterranean coast, Sinai, the Jordan valley and both gulfs.
- **Features.** Land and coastline, lakes (Sea of Galilee, Dead Sea, Great Bitter Lake), rivers and canals (Jordan, Nile and its delta branches, Suez and Ismailiya canals), and the names of seas and gulfs. All names come from Natural Earth's own English and Spanish fields.
- **Display-name rules.** A bare name that could be misread gets its feature type: "Jordan" becomes "Jordan River" / "río Jordán", so it cannot be read as the state. "Great Bitter" becomes "Great Bitter Lake". A Spanish sea name gains "mar" ("mar Mediterráneo").
- **Deliberately absent.** No political boundaries, settlements, country names, or historical shapes. The Gulf of Aqaba is drawn but **left unlabelled**, because it has more than one name in use (Gulf of Aqaba, Gulf of Eilat); the table says so.
- **Statements on the page.** A notice explains that this is a modern geographic base, not a historical reconstruction, and that coastlines, lake levels and river courses have changed. A Natural Earth credit with its versions and access date is shown, along with a note on how the base was prepared.
- **Interaction.**
  - Zoom with buttons, the mouse wheel, or + and −; pan by dragging or with the arrow keys; reset with the button or 0.
  - Map features can be selected by keyboard and show their names, type, Natural Earth layer and version, and feature IDs.
  - A table lists every named feature, with "Show on map" buttons that zoom to it. This is the text alternative to the map.
  - The scale bar and label sizes adjust to the current zoom and screen width. The page works in light and dark mode and on narrow screens.
- **Style.** A muted atlas style: parchment land, grey-blue water, a soft coastal halo, italic serif water labels, a dashed graticule with degree labels, and a double-line frame.

## Map library (D-09)

No library is used. The base is projected at build time to inline SVG, using an equirectangular projection scaled by cos(31.25°); over this extent the distortion is a few percent. Pan and zoom are a short script that changes the SVG `viewBox`. The total page is about 48 KB with no extra requests, which suits a single regional base. A library such as MapLibre or Leaflet would become worthwhile with tiled data, many layers, or projection at runtime. D-09 is updated to say this.

## Reproducing the geographic base

Downloads are untrusted input, so keep them in their own folder outside the repository:

```sh
mkdir -p ~/IsaacIshmael-geo-raw/natural-earth-10m && cd ~/IsaacIshmael-geo-raw/natural-earth-10m
for f in ne_10m_land ne_10m_lakes ne_10m_rivers_lake_centerlines ne_10m_geography_marine_polys; do
  curl -sSfO "https://naciscdn.org/naturalearth/10m/physical/$f.zip"
  mkdir -p "$f" && unzip -qo "$f.zip" -d "$f"
done
cd <repository>
npm run geo:atlas-base -- --raw ~/IsaacIshmael-geo-raw/natural-earth-10m
```

How the script works:

1. `scripts/geo/build-atlas-base.ts` refuses any zip whose SHA-256 differs from the pinned value.
2. It reads the shapefiles with a small dependency-free reader (`scripts/geo/shapefile.ts`).
3. It clips the data to the study area (Sutherland–Hodgman for polygons, Liang–Barsky for lines).
4. It simplifies the shapes (Douglas–Peucker, 0.0015–0.003°) and rounds coordinates to 4 decimals.
5. It writes `src/data/geo/east-med-base.json` (34 KB). The file records the source, versions, hashes and processing settings.

QGIS was not needed. A rebuild from the same downloads produces a byte-identical file (SHA-256 `3f6246bd…f11d`).

## Preview locally

```sh
cd C:\Users\evanr\IsaacIshmael-atlas-010
npm run build:preview
npm run serve
```

Then open http://localhost:4321/Isaac_Ishmael/en/atlas/ or http://localhost:4321/Isaac_Ishmael/es/atlas/. Rebuild with `npm run build` afterwards, so `dist/` holds the production build again.

## Checks (`npm run ci`, all passing)

**Unit tests (98, of which 11 are new):**

- The geometry helpers clip and simplify correctly.
- The data records a public-domain source, versions and pinned hashes.
- It contains physical layers only: no boundary, administrative, country or settlement content.
- Every coordinate is inside the study area, and the file is under 60 KB.
- The expected features are present in both languages.
- The Gulf of Aqaba label is omitted and the reason is stated.
- The "Jordan River" display rule works, and the projection is correct.

**Preview end-to-end tests (18, desktop and mobile, all new):**

- The notice, the "local only" label and the attribution appear in both languages.
- The expected labels appear, the Gulf of Aqaba label does not, and there are no boundary elements.
- The zoom buttons, the mouse wheel and reset work.
- Keyboard pan and zoom work.
- Map features can be selected by keyboard, and the details panel shows the alternate name and the Natural Earth layer.
- The table has 12 named features, and "Show on map" zooms to the chosen feature.
- The language switch works.
- axe reports no serious or critical violations, and there is no horizontal overflow.

**Production exclusion:**

- Production end-to-end tests (52) assert that `/en/atlas/` and `/es/atlas/` return 404.
- The production output is **byte-identical** to the deployed release build (`diff -r` against the `3c17b89` build).
- No Natural Earth data or atlas text appears in `dist/`.
- **Caught during the task:** Astro had been emitting the atlas stylesheet into production even though it builds no atlas page. The stylesheet is now inlined from a raw import and carries a `preview-only` marker. The production scan fails on that marker; a scan of a preview build confirms it fails as it should.

**Processing:** the rebuild is reproducible, and a tampered zip is rejected with a SHA-256 mismatch, writing nothing.

**Synchronization:** no OneDrive conflict copies (`*-Ale*`) were found. Both the worktree and the downloaded data sit outside OneDrive.

## Screenshots

Saved in `C:\Users\evanr\IsaacIshmael-atlas-010-screenshots\`:

- the full page in English and Spanish, on desktop and mobile;
- the map alone on mobile;
- English desktop in dark mode;
- the Spanish page zoomed to the Dead Sea.

## Not done and remaining decisions

- No terrain (see above). No historical layers, events or polygons, by design.
- Publication would need owner approval and a decision on whether the atlas joins the public interface demo. Natural Earth's licence permits it.
