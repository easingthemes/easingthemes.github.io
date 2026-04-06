# AEM Component Development Guide

## 1. Granite UI Dialog Node Structure

From dialog root to a field, the nesting order is:

```
cq:dialog                (nt:unstructured, sling:resourceType = "cq/gui/components/authoring/dialog")
 └── content             (nt:unstructured, sling:resourceType = "granite/ui/components/coral/foundation/container")
      └── items          (nt:unstructured)
           └── tabs      (nt:unstructured, sling:resourceType = "granite/ui/components/coral/foundation/tabs")
                └── items (nt:unstructured)
                     └── tab1 (nt:unstructured, sling:resourceType = "granite/ui/components/coral/foundation/container")
                          └── items (nt:unstructured)
                               └── columns (nt:unstructured, sling:resourceType = "granite/ui/components/coral/foundation/fixedcolumns")
                                    └── items (nt:unstructured)
                                         └── column (nt:unstructured, sling:resourceType = "granite/ui/components/coral/foundation/container")
                                              └── items (nt:unstructured)
                                                   └── myField (nt:unstructured, sling:resourceType = "granite/ui/components/coral/foundation/form/textfield")
```

The minimum required path (without tabs/columns) is:

```
cq:dialog > content > items > myField
```

Key rule: every `container` or structural element requires a child `items` node to hold its children.

---

## 2. Composite Multifield

```xml
<?xml version="1.0" encoding="UTF-8"?>
<jcr:root xmlns:sling="http://sling.apache.org/jcr/sling/1.0"
           xmlns:jcr="http://www.jcp.org/jcr/1.0"
           xmlns:nt="http://www.jcp.org/jcr/nt/1.0"
           xmlns:granite="http://www.adobe.com/jcr/granite/1.0">
    <multifield
        jcr:primaryType="nt:unstructured"
        sling:resourceType="granite/ui/components/coral/foundation/form/multifield"
        composite="{Boolean}true"
        fieldLabel="Card Items">
        <field
            jcr:primaryType="nt:unstructured"
            sling:resourceType="granite/ui/components/coral/foundation/container"
            name="./cardItems">
            <items jcr:primaryType="nt:unstructured">
                <title
                    jcr:primaryType="nt:unstructured"
                    sling:resourceType="granite/ui/components/coral/foundation/form/textfield"
                    fieldLabel="Title"
                    name="./title"/>
                <imagePath
                    jcr:primaryType="nt:unstructured"
                    sling:resourceType="granite/ui/components/coral/foundation/form/pathfield"
                    fieldLabel="Image Path"
                    name="./imagePath"
                    rootPath="/content/dam"/>
            </items>
        </field>
    </multifield>
</jcr:root>
```

**The critical property is `composite="{Boolean}true"`** on the multifield node.

| | Non-composite | Composite |
|---|---|---|
| **Storage** | Each value stored as a multi-value `String[]` property | Each entry stored as a child node (`item0`, `item1`, ...) with sub-properties |
| **Fields** | Single field only | Multiple sub-fields per entry |
| **`field` child** | Points directly to the widget | Points to a `container` wrapping sub-fields |

---

## 3. `data-sly-list` vs `data-sly-repeat`

| | `data-sly-list` | `data-sly-repeat` |
|---|---|---|
| **Renders the host element?** | No — the element with the attribute is **removed**; only its children repeat | Yes — the element with the attribute **itself** repeats |
| **Use case** | When you need a wrapper and want to repeat inner markup | When the host element is the repeated item (e.g., `<li>`) |

Example:

```html
<!-- data-sly-list: the <div> is removed, only <p> repeats -->
<div data-sly-list="${model.items}">
    <p>${item.title}</p>
</div>

<!-- data-sly-repeat: the <li> itself repeats -->
<li data-sly-repeat="${model.items}">${item.title}</li>
```

**All iteration metadata variables** (accessed via `itemList` or `<variable>List`):

| Variable | Type | Description |
|---|---|---|
| `index` | `int` | Zero-based index (0, 1, 2, ...) |
| `count` | `int` | One-based count (1, 2, 3, ...) |
| `first` | `boolean` | `true` for the first item |
| `middle` | `boolean` | `true` if neither first nor last |
| `last` | `boolean` | `true` for the last item |
| `odd` | `boolean` | `true` when `index` is odd |
| `even` | `boolean` | `true` when `index` is even |

Usage: `${itemList.index}`, `${itemList.first}`, etc. If you alias the iterator (`data-sly-list.myItem`), the metadata is `${myItemList.index}`.

---

## 4. HTL Expressions Inside `<script>` / `<style>` Tags

**What happens:** HTL automatically applies the **`unsafe`** display context — it **removes the expression entirely** and outputs nothing (empty string).

**Why:** HTL's XSS protection engine cannot safely sanitize values inside script or style blocks. Inline JS/CSS injection is a major XSS vector. Rather than guess wrong, HTL blocks output entirely.

**The fix:** Explicitly set the context if you know what you're doing:

```html
<!-- Won't work — output is blank -->
<script>var title = '${model.title}';</script>

<!-- Works — you explicitly accept the risk -->
<script>var title = '${model.title @ context="scriptString"}';</script>

<!-- For use in a script src attribute -->
<script src="${model.scriptUrl @ context='uri'}"></script>
```

Available contexts for these cases: `scriptString`, `scriptComment`, `scriptToken`, `styleString`, `styleToken`, `uri`.

---

## 5. Sling Model Adaptables: `Resource.class` vs `SlingHttpServletRequest.class`

```java
// Adapts from Resource only
@Model(adaptables = Resource.class)

// Adapts from Request
@Model(adaptables = SlingHttpServletRequest.class)
```

| | `Resource.class` | `SlingHttpServletRequest.class` |
|---|---|---|
| **Available injections** | `@ValueMapValue`, `@ChildResource`, `@ResourcePath`, resource properties | Everything from Resource **plus** request objects, selectors, query params, `WCMMode`, `PageManager`, `CurrentPage` |
| **Can use `@ScriptVariable`?** | No | Yes (`currentPage`, `currentStyle`, `designer`, etc.) |
| **Can inject OSGi services?** | Yes (via `@OSGiService`) | Yes |
| **Usable outside HTTP context?** | Yes (workflows, servlets, jobs) | No — requires an active request |
| **Performance** | Slightly lighter | Slightly heavier |

**When you need Request:**
- Accessing `currentPage`, `currentDesign`, `currentStyle` via `@ScriptVariable`
- Reading query parameters or selectors
- Checking `WCMMode` (edit, preview, publish)
- Inheriting values via `InheritanceValueMap` / `currentPage`
- Using `SlingHttpServletRequest`-based services

**Rule of thumb:** Start with `Resource.class`. Upgrade to `SlingHttpServletRequest.class` only when you need request-scoped data.

---

## 6. `dependencies` vs `embed` in `cq:ClientLibraryFolder`

```
// .content.xml of a clientlib
dependencies="[site.core, site.vendor]"
embed="[site.utils, site.polyfills]"
```

| | `dependencies` | `embed` |
|---|---|---|
| **What it does** | Ensures listed libraries are **loaded before** this one (separate HTTP requests) | **Inlines** the listed libraries' code **into** this library's output file |
| **HTTP requests** | One request per library | Single merged request |
| **Caching** | Each library cached independently | All embedded libs share one cache entry |
| **Updates** | Changing a dependency doesn't invalidate this lib's cache | Changing any embedded lib invalidates the whole bundle |

**When to use each:**

- **`embed`** — For libraries you own/control that are always used together. Reduces HTTP requests. Great for bundling small utilities into a main clientlib.
- **`dependencies`** — For shared/third-party libraries used across multiple components (e.g., jQuery, a shared framework). Keeps them independently cached and avoids duplication if multiple clientlibs depend on the same thing.

**Anti-pattern:** Don't embed a large shared library (like lodash) into multiple clientlibs — it gets duplicated in each. Use `dependencies` for shared code instead.

---

## 7. Dialog Field Conditional Visibility (showhide)

Show a text field only when a checkbox is checked:

```xml
<showTitle
    jcr:primaryType="nt:unstructured"
    sling:resourceType="granite/ui/components/coral/foundation/form/checkbox"
    fieldDescription="Check to show title"
    name="./showTitle"
    text="Show Title"
    value="{Boolean}true"
    uncheckedValue="{Boolean}false"
    granite:class="cq-dialog-checkbox-showhide"
    checked="{Boolean}false">
    <granite:data
        jcr:primaryType="nt:unstructured"
        cq-dialog-checkbox-showhide-target=".title-showhide-target"/>
</showTitle>

<title
    jcr:primaryType="nt:unstructured"
    sling:resourceType="granite/ui/components/coral/foundation/form/textfield"
    fieldLabel="Title"
    name="./title"
    granite:class="hide title-showhide-target"/>
```

**How it works:**
1. The checkbox gets the class `cq-dialog-checkbox-showhide` — this activates the OOTB showhide clientlib
2. `granite:data/cq-dialog-checkbox-showhide-target` points to a CSS selector matching the target field(s)
3. The target field gets the matching class (`title-showhide-target`) plus `hide` (hidden by default)

For **dropdown-based** visibility, use `cq-dialog-dropdown-showhide` and a `showhidetargetvalue` on each target:

```xml
<type
    jcr:primaryType="nt:unstructured"
    sling:resourceType="granite/ui/components/coral/foundation/form/select"
    fieldLabel="Type"
    name="./type"
    granite:class="cq-dialog-dropdown-showhide">
    <granite:data
        jcr:primaryType="nt:unstructured"
        cq-dialog-dropdown-showhide-target=".type-showhide-target"/>
    <items jcr:primaryType="nt:unstructured">
        <text jcr:primaryType="nt:unstructured" text="Text" value="text"/>
        <image jcr:primaryType="nt:unstructured" text="Image" value="image"/>
    </items>
</type>

<titleField
    jcr:primaryType="nt:unstructured"
    sling:resourceType="granite/ui/components/coral/foundation/form/textfield"
    fieldLabel="Title"
    name="./title"
    granite:class="hide type-showhide-target"
    showhidetargetvalue="text"/>
```

---

## 8. Sling Model Exporter for SPA Editor

```java
@Model(
    adaptables = SlingHttpServletRequest.class,
    adapters = { MyComponent.class, ComponentExporter.class },
    resourceType = "myproject/components/mycomponent",
    defaultInjectionStrategy = DefaultInjectionStrategy.OPTIONAL
)
@Exporter(
    name = ExporterConstants.SLING_MODEL_EXPORTER_NAME,   // = "jackson"
    extensions = ExporterConstants.SLING_MODEL_EXTENSION   // = "json"
)
public class MyComponentImpl implements MyComponent, ComponentExporter {

    @ValueMapValue
    private String title;

    public String getTitle() { return title; }

    @Override
    @NotNull
    public String getExportedType() {
        return "myproject/components/mycomponent";
    }
}
```

**Critical pieces:**
- `adapters` must include `ComponentExporter.class`
- `resourceType` must match the component's `sling:resourceType`
- `@Exporter` with name `jackson` and extension `json`
- `getExportedType()` returns the resource type (used by SPA framework to map to frontend components)

**URL pattern produced:**

```
/content/myproject/en/mypage.model.json        ← full page model (all components)
/content/myproject/en/mypage/jcr:content/root/mycomponent.model.json  ← single component
```

The `.model.json` selector+extension is handled by the `ContentModelServlet` which delegates to the Sling Model Exporter. The page-level JSON includes a `:type` field per component that matches `getExportedType()`, which the SPA framework (React/Angular) uses for component mapping.
