---
slug: cli-tools-i-use-daily
type: article
title: "CLI Tools I Use Daily"
published: 2026-03-10T08:00:00Z
visibility: public
tags: [tools, productivity]
summary: "My terminal setup isn't fancy but it's fast. Here are the tools that stuck."
---

I used to spend weekends tweaking my dotfiles. Custom zsh themes, elaborate aliases, plugins I'd forget existed. These days my setup is boring and I'm happier for it.

## The list

**ripgrep (`rg`)** — I haven't typed `grep` in years. ripgrep is faster, respects `.gitignore`, and has saner defaults. `rg "TODO" --type ts` is muscle memory.

**fd** — Like `find`, but fast and intuitive. `fd '\.test\.ts$'` just works. No `-name` flags, no quoting gymnastics.

**jq** — Pipe any JSON into `jq` and it becomes readable. Pipe it into `jq '.data[] | .name'` and you've got a one-liner that would've been a script.

**fzf** — Fuzzy finder for everything. `Ctrl+R` for history search is the one that changed my workflow the most. Also great piped into `cd` or `vim`.

**bat** — `cat` with syntax highlighting and line numbers. I aliased `cat` to `bat` and forgot about it.

**delta** — Better git diffs. Side-by-side, syntax highlighting, line numbers. Set it as your `core.pager` and every `git diff` looks good.

## What I stopped using

I removed oh-my-zsh, starship prompt, and most zsh plugins. My prompt is `%~ %#` — just the directory and a `$`. It's instant. No git status in the prompt (I run `git status` when I want to know).

I stopped using tmux for most things. VS Code's integrated terminal is fine. I still use tmux on remote servers.

## The principle

Every tool here does one thing well, runs fast, and doesn't require configuration to be useful. If a tool needs a config file before it's better than the default, I'm probably not going to keep using it.
