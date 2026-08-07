# Real family — design guidelines

## Core principle

**Less text, more visual guidance.**

The goal is not “no text.” The goal is **only necessary text**.

> If the visual already communicates it, remove the sentence.  
> If the visual could be misunderstood, add the shortest useful label.

## Minimal-text rules

### 1. One message per screen

Each screen communicates:

- One main idea
- One primary action
- One clear next step

Remove text that does not help the user decide or act.

### 2. Strict text hierarchy

Limit each screen to:

- **Title:** 1–4 words
- **Supporting text:** one short sentence (optional)
- **Primary button:** 1–3 words
- **Optional** secondary action
- No paragraph unless essential

### 3. Show instead of explain

Prefer:

- Animation for direction
- Progress rings for completion
- Colour (plus text) for status
- Simple illustrations / brand marks for concepts
- Familiar icons for common actions
- Quiet sound only when already part of the product

Add a short label when an icon’s meaning is unclear.

### 4. Progressive disclosure

- Show essentials first
- Reveal details on request
- Put advanced options under “More”
- Hide settings during focused tasks
- Remember previous choices

### 5. Short, direct language

| Avoid | Prefer |
| --- | --- |
| Click here to continue | Continue |
| Would you like to begin? | Begin |
| Your changes were saved successfully | Saved |
| An error has occurred | Try again |
| Go back to the previous page | Back |
| View more information | Details |
| Session has been completed | Complete |

Active voice. No filler.

### 6. No repeated information

Do not repeat the same idea in title + subtitle + description + button.

### 7. Helpful defaults

Ship sensible defaults (durations, destinations, page mode). Let users change them later—don’t force setup walls.

### 8. Minimal navigation

About 3–5 primary destinations. Familiar names. Secondary options grouped.

### 9. Simple forms

Only necessary fields. Short labels. Errors beside the field. Examples only when needed.

### 10. Specific buttons

Use result-oriented labels: Save, Begin, Continue, Try again, Download, Delete.  
Avoid OK / Yes / Submit / Proceed. Destructive actions name the object when needed.

### 11. Visual empty states

- One simple visual
- Short title
- One helpful sentence if needed
- One primary action

### 12. Brief feedback

Saved · Sent · Copied · Try again — near the action, auto-dismiss when appropriate.

### 13. Accessibility is not optional

Keep screen-reader labels, form labels, error explanations, safety warnings, permission explanations, destructive consequences, and text alternatives. Never communicate state by colour alone.

## Recommended screen formula

1. One visual  
2. One short heading  
3. One optional sentence  
4. One primary action  
5. One quiet secondary action  

## Shared visual tokens

```css
:root {
  --real-ink: #17201d;
  --real-muted: #66706c;
  --real-paper: #f6f5f0;
  --real-surface: #ffffff;
  --real-line: #dde1de;
  --real-danger: #bd4a4a;
  --real-radius: 14px;
  --real-shadow: 0 16px 40px rgba(23, 32, 29, 0.12);
}
```

Wordmark: **real** + utility name. System fonts only. No remote assets.
