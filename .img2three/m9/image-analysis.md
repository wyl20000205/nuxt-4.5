# M9-style bayonet reference analysis

## Suitability

- Verdict: conditional pass for real-time procedural reconstruction.
- Source: `public/images/m9.jpg`, 2560 x 1440, one clear side view on a white background.
- Scope: M9-style bayonet based on the visible side. Exact game-item identity, reverse-side engraving, underside geometry, and exact skin metadata are not established by this reference.

## Observed form

- Primary domain: hard-surface object.
- Bounding form: a 17.5 unit longitudinal assembly using the blade centreline as Y = 0.
- Major assemblies: pommel, segmented cylindrical grip, longitudinal guard with ring, blade body, sawback teeth, cutting edge, and blade aperture.
- The grip occupies approximately X = -8.6 to -0.25. The guard centres around X = 0.0. The blade extends to X = 7.9.
- The blade is a pointed asymmetric wedge, broad at the ricasso and tapering to a right-facing point. Its visible cutting edge has a shallow concave sweep.

## Component hierarchy

- `m9-root`
  - `pommel`: dark end cap and collar.
  - `grip-core`: tapered cylindrical rubber core.
    - `grip-ridges`: seven raised, separated barrel bands.
  - `guard`: vertical steel plate crossing the blade and grip.
    - `guard-ring`: thick oval ring above the blade.
  - `blade`: variable-thickness loft with a strong spine and a zero-thickness cutting edge.
    - `sawback`: ten concave tooth cutouts following the upper edge.
    - `blade-hole`: rounded rectangular through-opening close to the tip.
    - `blade-projection`: reference image crop on the front broad face.

## Spatial relationships

- The grip overlaps the guard by 0.16 units at the proximal blade junction.
- The blade overlaps the guard by 0.18 units at the ricasso.
- Each grip ridge embeds 0.025 units into the core.
- The guard ring is socketed into the upper guard and has a closed continuous cross-section.

## Materials

- Grip: worn dark composite, base RGB approximately 44, 48, 56, roughness 0.83, metalness 0.02. Mottled roughness and low-amplitude bump simulate rubber pitting.
- Guard and pommel: dark bluish steel, base RGB approximately 40, 36, 70, metalness 0.85, roughness 0.24, clearcoat 0.2.
- Blade: opaque gem-metal finish with visible violet, electric-blue, indigo, and cyan zones. The supplied image is the front-face colour evidence. Base metalness 0.8, roughness 0.15, clearcoat 0.55.

## Detail inventory

1. Raised grip band 1 through 7. Kind: ridge. Maps to `grip-ridges`. Confidence 0.96.
2. Narrow dark gaps between grip bands. Kind: groove. Maps to `grip-ridges`. Confidence 0.96.
3. Worn pitting across grip segments. Kind: stain and normal relief. Maps to `grip-material`. Confidence 0.71.
4. Small glossy strip along the guard edge. Kind: gloss. Maps to `guard-material`. Confidence 0.78.
5. Large oval ring opening. Kind: hole. Maps to `guard-ring`. Confidence 0.99.
6. Ten rounded sawback scallops. Kind: contour and groove. Maps to `sawback`. Confidence 0.97.
7. Cutting edge taper. Kind: bevel and contour. Maps to `blade`. Confidence 0.95.
8. Clip-point false edge near the tip. Kind: bevel. Maps to `blade`. Confidence 0.82.
9. Rounded rectangular blade aperture. Kind: hole. Maps to `blade-hole`. Confidence 0.99.
10. Blue to violet marbled blade coating. Kind: decal/projection with gloss. Maps to `blade-projection`. Confidence 0.93.
11. Dark spine rail above the projected blade face. Kind: ridge. Maps to `blade-spine`. Confidence 0.86.
12. Light edge wear at the blade base and sawback. Kind: chip. Maps to `blade-material`. Confidence 0.61.

## Single-view limits

- The rear blade face, guard thickness, grip back profile, ring interior depth, and exact distal taper are inferred.
- The front-view projection is suitable for the visible blade face. Reverse-side material uses the same palette without claiming reference accuracy.
- Expected procedural fidelity from this view: approximately 0.72 to 0.78 for the supplied camera angle.
