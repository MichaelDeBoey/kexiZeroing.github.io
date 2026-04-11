---
title: "Building a shimmer skeleton that matches your UI"
description: ""
added: "Apr 5 2026"
tags: [react]
---

Most shimmer skeletons are hand-crafted rectangles that vaguely approximate what your UI might look like — a wide bar for a title, a few narrow bars for text, a circle for an avatar. Every time your component changes, you update the skeleton separately. They drift apart.

There's a better approach: measure the real component, then shimmer exactly what's there. The core idea is that you render your component with hidden text, measure where every element actually is using the browser's layout engine, and overlay shimmer blocks at those exact positions. The skeleton is always accurate because it's derived from the real layout.

## Step 1: The Naive Overlay

Start simple. Render the component, make its text invisible with `color: transparent`, and put a shimmer layer over the whole thing.

```html
<div style="position: relative;">
  <div class="card" style="color: transparent;">
    <img src="placeholder.jpg" class="avatar" />
    <h2>John Doe</h2>
    <p>Software Engineer</p>
  </div>
  <div class="shimmer-overlay"></div>
</div>
```

`color: transparent` hides text but preserves layout. Images are still visible, but the shimmer overlay covers them. Also add `pointer-events: none` on the hidden content, otherwise users can accidentally click invisible buttons or select invisible text while loading. This works but it's coarse. The shimmer covers the whole card as one rectangle.

## Step 2: Measuring the Real Layout

The browser already knows exactly where every element lives. `getBoundingClientRect()` returns the pixel position and dimensions of any DOM node, derived from the actual rendered layout, always correct.

```js
function measureLeafElements(container) {
  const elements = container.querySelectorAll(
    "img, h1, h2, h3, h4, h5, h6, p, span, button, a",
  );
  const containerRect = container.getBoundingClientRect();

  return Array.from(elements)
    .map((el) => {
      const rect = el.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return null;

      return {
        top: rect.top - containerRect.top,
        left: rect.left - containerRect.left,
        width: rect.width,
        height: rect.height,
      };
    })
    .filter(Boolean);
}
```

We query for leaf elements that actually contain visible content. We skip wrappers and layout containers. Positions are relative to the container by subtracting `containerRect` offsets, so we can use them with `position: absolute` inside the parent. Elements with zero dimensions are skipped.

Now render individual blocks instead of one overlay, and each block sits exactly over its corresponding element.

```jsx
function ShimmerBlocks({ measurements }) {
  return measurements.map((rect, i) => (
    <div
      key={i}
      className="shimmer-block"
      style={{
        position: "absolute",
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height,
      }}
    />
  ));
}
```

## Step 3: Getting Border Radius Right

The blocks are all sharp rectangles, but your real UI probably isn't. Read the computed styles from each element:

```js
const computed = getComputedStyle(el);
// borderTopLeftRadius is more reliable than the borderRadius shorthand,
// which can return an empty string when corners have mixed values.
const borderRadius = parseFloat(computed.borderTopLeftRadius) || 0;
```

For text elements without an explicit border-radius, apply a small default — 4px looks natural:

```js
const isTextElement = [
  "P",
  "H1",
  "H2",
  "H3",
  "H4",
  "H5",
  "H6",
  "SPAN",
].includes(el.tagName);

const borderRadius =
  parseFloat(computed.borderTopLeftRadius) || (isTextElement ? 4 : 0);
```

## Step 4: The Shimmer Animation

A gradient that sweeps left to right, giving the impression of light traveling across a surface:

```css
@keyframes shimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}

.shimmer-block {
  background: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0.08) 25%,
    rgba(255, 255, 255, 0.15) 50%,
    rgba(255, 255, 255, 0.08) 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite ease-in-out;
}
```

Semi-transparent white adapts to any background color. The shimmer is additive on top of whatever the container's color happens to be, so you don't need separate variants.

## Step 5: The React Wrapper

In a real app, data comes from an API. During loading it doesn't exist, so your component can't render — and if it can't render, there's nothing to measure. Two things to solve:

- Give the component fake data so it renders its full structure during loading.
- Measure before the browser paints, so the user never sees the invisible-text state.

```jsx
function Shimmer({ loading, children, templateProps }) {
  const containerRef = useRef(null);
  const [measurements, setMeasurements] = useState([]);

  useLayoutEffect(() => {
    if (loading && containerRef.current) {
      const rects = measureLeafElements(containerRef.current);
      setMeasurements(rects);
    }
  }, [loading]);

  if (!loading) return children;

  const child = React.Children.only(children);
  const clone = templateProps
    ? React.cloneElement(child, templateProps)
    : child;

  return (
    <div ref={containerRef} style={{ position: "relative" }}>
      <div style={{ color: "transparent", pointerEvents: "none" }}>{clone}</div>
      {measurements.map((rect, i) => (
        <div
          key={i}
          className="shimmer-block"
          style={{
            position: "absolute",
            top: rect.top,
            left: rect.left,
            width: rect.width,
            height: rect.height,
            borderRadius: rect.borderRadius,
          }}
        />
      ))}
    </div>
  );
}
```

Usage:

```jsx
<Shimmer
  loading={isLoading}
  templateProps={{
    name: "John Doe",
    role: "Software Engineer",
    avatar: "/placeholder.jpg",
  }}
>
  <UserCard name={user?.name} role={user?.role} avatar={user?.avatar} />
</Shimmer>
```

The `templateProps` values are invisible — they just need to produce roughly the right layout dimensions. "John Doe" as a name, "Software Engineer" as a role. The text is never seen; it just needs to occupy realistic space. The reason we need it: during loading, your real data doesn't exist yet, so `<UserCard name={undefined} />` might render nothing or crash. By cloning the child with `templateProps`, we give it enough data to render its full structure.

`React.cloneElement(element, props)` takes an existing React element and returns a new one with additional props merged in — think of it as `{ ...element.props, ...templateProps }` but for React elements. It expects a single element, so we use `React.Children.only(children)` to both extract that element and enforce the constraint. If someone accidentally passes two children, it throws immediately.

```jsx
// children is <UserCard name={undefined} role={undefined} />
const child = React.Children.only(children);

// clone is <UserCard name="John Doe" role="Software Engineer" />
const clone = React.cloneElement(child, templateProps);
```

`useLayoutEffect` fires synchronously after the DOM is updated but before the browser paints. (`useEffect` fires after the browser paints.) Measurement and shimmer placement happen in the same frame as the render. The user never sees the intermediate state.

## The library

The library that implements this fully is [shimmer-from-structure](https://github.com/darula-hpp/shimmer-from-structure). It handles the edge cases, plus configurable shimmer colors, animation duration, and a provider API for app-wide defaults. Built for React, Vue, Angular, Svelte and SolidJS.

[Boneyard](https://github.com/0xGF/boneyard) is another package that snapshots your real UI and captures a flat list of skeleton “bones” that mirror the page exactly. No guessing. No measuring. It generates skeletons at build time — not at runtime. Here's the three-step flow:

1. Wrap your component with `<Skeleton name="blog-card" loading={isLoading}>`. When `loading` is false, your children render normally.

2. Run `npx boneyard-js build`. This launches a headless browser via Playwright, visits your running app at multiple breakpoints, and calls `getBoundingClientRect()` on every visible element inside each named `<Skeleton>`. The exact pixel positions, sizes, and border radii are written to `.bones.json` files and a `registry.js` that maps each skeleton name to its bones. Subsequent builds are incremental — only changed components are recaptured. Customize breakpoints and defaults with `boneyard.config.json`.

3. Import the generated registry once in your app entry. When `loading` is true, boneyard looks up the pre-generated bones by name and renders them as gray rectangles — each one an absolutely positioned div matching the exact position from the real layout. When loading becomes false, your children replace the skeleton with zero layout shift.
