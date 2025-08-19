# Obsidian Chat Log Maker Plugin

Create chat-style conversation logs with nested reply structure and export to markdown format.

## Development Setup

### Step 1: Clone and navigate to the project

```bash
cd obsidian-chat-log-maker-plugin
```

### Step 2: Install dependencies

```bash
npm install
```

### Step 3: Build the plugin

```bash
npm run dev
```

This command will:

- Compile TypeScript to JavaScript
- Watch for file changes and auto-rebuild
- Generate `main.js` file for Obsidian to load

### Step 4: Enable in Obsidian

1. Reload Obsidian (`Cmd/Ctrl + R`)
2. Go to Settings → Community Plugins
3. Enable "Chat Log Maker"
4. Use the ribbon icon or command palette to open the plugin

## Usage

1. Open the Chat Log Maker view (ribbon icon or command palette)
2. Set conversation title and add speakers
3. Create comments and replies in the preview panel
4. Export to markdown format with one click
