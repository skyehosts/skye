- Parse the architectural plan in docs/plans/frontend-multiple-image-upload.md
- This is the frontend counterpart for the plan docs/plans/aws-image-pipeline-spec.md.
- Parse staged files to understand context for already implemented backend & infra work
- It should connect and be compatible with the API and infra you created
- Scrutinise decisions/assumptions, if you identify issues, bring them to my attention
- If you have superior approaches, recommend them
- Don't implement, present a plan to me for review

# 🧩 Technical Architecture Plan

## Multi-Image Upload — Expo Image Picker + Custom UI

---

## 1️⃣ Core Stack

| Layer           | Technology                                   |
| --------------- | -------------------------------------------- |
| App Framework   | Expo (Managed Workflow or eas build --local) |
| Runtime         | React Native                                 |
| Image Selection | expo-image-picker                            |
| UI Components   | React Native Paper (optional)                |

---

## 2️⃣ Functional Requirements Coverage

### ✅ Multiple Image Insert

- Use system picker with multi-select where supported
- Graceful fallback to repeated single-select

### ✅ Mainstream & Maintained

- Official Expo SDK module
- No obscure dependencies

### ✅ Works With Existing EAS Setup

- No new billing categories
- No native build changes (unless you'd recommend otherwise)

---

## 3️⃣ High-Level User Flow

### Primary Flow (Most Devices — Multi-Select)

User taps **“Add Photos”**  
→ System gallery opens  
→ User selects multiple images  
→ Picker returns asset array  
→ App displays selected images grid  
→ User can:

- Remove
- Reorder
- Add more  
  → User taps **Upload**

---

### Fallback Flow (Older Android — Single-Select)

User taps **“Add Photos”**  
→ Gallery opens  
→ User selects one image  
→ Picker closes  
→ Image added to grid  
→ CTA: **“Add more photos”**  
→ Repeat until done

UX remains consistent because:

- Selection grid persists
- Progress is visible
- Loop is intentional

---

## 4️⃣ System Architecture

### 📱 Client Layer

#### A. Image Picker Service

Wrapper around Expo API

**Responsibilities**

- Permission handling
- Launch picker
- Normalize asset response
- Detect multi vs single return

---

#### B. Selection State Manager

Maintains:

- `selectedImages[]`
- Insert order
- Remove actions
- Max image count validation

---

#### C. Image Grid UI

Displays:

- Thumbnail grid
- Remove button
- Reorder (optional)
- “Add more” tile

**Built with**

- FlatList (virtualized grid)
- Paper Cards / Pressables

---

#### D. Upload Manager

Handles:

- File transformation (optional)
- Multipart upload
- Retry logic
- Progress state

---

## 5️⃣ Key Technical Components

### 📦 Permissions

- Request media library access via Expo
- iOS scoped photo permissions supported
- Android runtime permissions handled

---

### 🖼 Image Handling

Store per image:

```ts
{
  uri: string
  width: number
  height: number
  fileSize?: number
  mimeType?: string
}
```
