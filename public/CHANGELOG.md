# [2025-04-17] - Draggable UI & ESLint Improvements

### ✨ Features

*   **Draggable Toolbar Buttons:** Toolbar buttons are now draggable, making it easier to create new nodes by dragging and dropping directly onto the canvas.
*   **Dialogue Node in Toolbar:** Added dialogue node to the toolbar for quick access and creation.

### 🐛 Fixes

*   **ESLint Warnings:** Fixed various warnings reported by ESLint to improve code quality and maintainability.

## [2025-04-16] - Jump Node & UI Improvements

### ✨ Features

*   **Jump Node Implementation:** Added Jump Node with target dialogue selection directly in the edit panel, allowing users to easily create connections between different conversations.

### 🐛 Fixes

*   **Form Content:** Added missing form content for adding NPCs and Dialogues in the sidebar, improving the user experience when creating new elements.
*   **Markdown Editor:** Implemented toggle-aware formatting buttons to prevent markup spam, making the editor more intuitive when adding or removing formatting.
*   **Drag and Drop:** Improved the smoothness of drag and drop animations in the sidebar for better visual feedback during reordering.

## [2025-04-15] - Modal Fix & Node Handle Style

### 🐛 Fixes

*   **Modal Sizing:** Resolved an issue causing incorrect modal sizing in certain situations.

### 🎨 Style

*   **Incoming Node Handle:** Hid the incoming connection handle on nodes for a cleaner visual appearance.
*   **Help Modal Hover:** Improved contrast for hovered items in the Help modal.

## [2025-04-14] - Node Placement Fix & NPC Node Editing

### ✨ Features

*   **Flexible NPC Node Assignment:** You can now change the NPC associated with an existing NPC dialogue node directly from the "Edit Node" panel.
    *   When an NPC node is selected, a new "Associated NPC" dropdown appears in the panel.
    *   This allows you to reassign a specific line of dialogue to a *different* NPC without needing to delete and recreate the node.
    *   This is useful for reusing dialogue structures or correcting assignments easily. The node's appearance (avatar, accent color) will update instantly based on the selected NPC.

### 🐛 Fixes

*   **Intuitive Node Placement on Drag-Create:** When creating a new node by dragging a connection handle onto an empty area of the canvas, the newly created node will now appear horizontally centered directly beneath the mouse cursor's release point. Previously, its positioning could be slightly offset, making placement less predictable.