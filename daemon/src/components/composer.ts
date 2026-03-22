(function () {
  const composer = document.getElementById('note-composer');
  if (!composer) return;

  const form = composer.querySelector('.composer__form') as HTMLFormElement;
  const textarea = document.getElementById('composer-textarea') as HTMLTextAreaElement;
  const typeInput = document.getElementById('composer-type') as HTMLInputElement;
  const previewBtn = document.getElementById('preview-btn') as HTMLButtonElement;
  const previewPane = document.getElementById('preview-pane') as HTMLDivElement;
  const attachBtn = document.getElementById('attach-btn') as HTMLButtonElement;
  const fileInput = document.getElementById('file-input') as HTMLInputElement;
  const attachmentPreviews = document.getElementById('attachment-previews') as HTMLDivElement;
  const draftIndicator = document.getElementById('draft-indicator') as HTMLSpanElement | null;
  const discardBtn = document.getElementById('discard-btn') as HTMLButtonElement;
  const errorEl = document.getElementById('composer-error') as HTMLDivElement;
  const submitBtn = form.querySelector('.composer__submit') as HTMLButtonElement;

  // ── Type selector ────────────────────────────────────────────────────────
  const typeToggle = document.getElementById('type-toggle');
  const typeDropdown = document.getElementById('type-dropdown') as HTMLDivElement | null;

  if (typeToggle && typeDropdown) {
    typeToggle.addEventListener('click', () => {
      const expanded = typeToggle.getAttribute('aria-expanded') === 'true';
      typeToggle.setAttribute('aria-expanded', String(!expanded));
      typeDropdown.hidden = expanded;
    });

    document.addEventListener('click', (e) => {
      if (!typeDropdown.contains(e.target as Node) && !typeToggle.contains(e.target as Node)) {
        typeToggle.setAttribute('aria-expanded', 'false');
        typeDropdown.hidden = true;
      }
    });

    typeDropdown.querySelectorAll('.composer__type-option').forEach(btn => {
      btn.addEventListener('click', () => {
        const value = (btn as HTMLElement).dataset.value ?? 'note';
        const icon = (btn as HTMLElement).dataset.icon ?? '';
        const label = (btn as HTMLElement).dataset.label ?? '';
        const extra = (btn as HTMLElement).dataset.extra ?? 'none';

        typeInput.value = value;

        const iconEl = document.getElementById('type-icon');
        const labelEl = document.getElementById('type-label');
        if (iconEl) iconEl.textContent = icon;
        if (labelEl) labelEl.textContent = label;

        // Hide all extra fields, reset their inputs
        document.querySelectorAll('.composer__extra').forEach(el => {
          (el as HTMLElement).hidden = true;
          el.querySelectorAll('input, select').forEach(inp => {
            (inp as HTMLInputElement).value = '';
          });
        });

        // Show relevant extra field
        if (extra !== 'none') {
          const extraEl = document.getElementById(`extra-${extra}`);
          if (extraEl) extraEl.hidden = false;
        }

        typeToggle.setAttribute('aria-expanded', 'false');
        typeDropdown.hidden = true;
      });
    });
  }

  // ── Markdown toolbar ─────────────────────────────────────────────────────
  const linkPrompt = document.getElementById('link-prompt') as HTMLDivElement;
  const linkUrlInput = document.getElementById('link-url-input') as HTMLInputElement;
  const linkInsertBtn = document.getElementById('link-insert-btn') as HTMLButtonElement;

  function applyFormat(format: string) {
    const s = textarea.selectionStart;
    const e = textarea.selectionEnd;
    const sel = textarea.value.slice(s, e);

    if (format === 'bold') {
      textarea.setRangeText(`**${sel || 'text'}**`, s, e, 'end');
    } else if (format === 'italic') {
      textarea.setRangeText(`*${sel || 'text'}*`, s, e, 'end');
    } else if (format === 'link') {
      if (sel) {
        textarea.setRangeText(`[${sel}]()`, s, e, 'end');
        const pos = s + sel.length + 3;
        textarea.setSelectionRange(pos, pos);
      } else {
        linkPrompt.hidden = !linkPrompt.hidden;
        if (!linkPrompt.hidden) linkUrlInput.focus();
        return;
      }
    }
    textarea.dispatchEvent(new Event('input'));
    textarea.focus();
  }

  document.getElementById('tool-bold')?.addEventListener('click', () => applyFormat('bold'));
  document.getElementById('tool-italic')?.addEventListener('click', () => applyFormat('italic'));
  document.getElementById('tool-link')?.addEventListener('click', () => applyFormat('link'));

  linkInsertBtn?.addEventListener('click', () => {
    const url = linkUrlInput.value.trim();
    if (!url) return;
    const s = textarea.selectionStart;
    const e = textarea.selectionEnd;
    textarea.setRangeText(`[link text](${url})`, s, e, 'end');
    linkUrlInput.value = '';
    linkPrompt.hidden = true;
    textarea.dispatchEvent(new Event('input'));
    textarea.focus();
  });

  // ── Preview toggle ───────────────────────────────────────────────────────
  let markedLoaded = false;
  let markedFn: ((s: string) => string) | null = null;
  let inPreview = false;

  previewBtn?.addEventListener('click', async () => {
    inPreview = !inPreview;
    if (inPreview) {
      textarea.hidden = true;
      previewPane.hidden = false;
      previewBtn.textContent = 'Edit';
      if (!markedLoaded) {
        try {
          const mod = await import('https://cdn.jsdelivr.net/npm/marked/+esm' as string);
          markedFn = mod.marked;
          markedLoaded = true;
        } catch {
          previewPane.textContent = textarea.value;
          return;
        }
      }
      previewPane.innerHTML = markedFn ? (markedFn(textarea.value) as string) : textarea.value;
    } else {
      textarea.hidden = false;
      previewPane.hidden = true;
      previewBtn.textContent = 'Preview';
    }
  });

  // ── Draft persistence ────────────────────────────────────────────────────
  const DRAFT_KEY = 'indiepub_draft';
  let saveTimer: ReturnType<typeof setTimeout> | null = null;

  function showDraftIndicator() {
    if (draftIndicator) draftIndicator.hidden = false;
  }
  function hideDraftIndicator() {
    if (draftIndicator) draftIndicator.hidden = true;
  }

  // Restore draft on load (only if textarea is empty)
  try {
    const saved = localStorage.getItem(DRAFT_KEY);
    if (saved && !textarea.value) {
      textarea.value = saved;
      showDraftIndicator();
    }
  } catch {
    // localStorage unavailable
  }

  textarea.addEventListener('input', () => {
    if (saveTimer) clearTimeout(saveTimer);
    saveTimer = setTimeout(() => {
      try {
        if (textarea.value.trim()) {
          localStorage.setItem(DRAFT_KEY, textarea.value);
          showDraftIndicator();
        } else {
          localStorage.removeItem(DRAFT_KEY);
          hideDraftIndicator();
        }
      } catch {
        // ignore
      }
    }, 600);
  });

  discardBtn?.addEventListener('click', () => {
    try { localStorage.removeItem(DRAFT_KEY); } catch { /* ignore */ }
    textarea.value = '';
    hideDraftIndicator();
  });

  // ── Image attachment ─────────────────────────────────────────────────────
  attachBtn?.addEventListener('click', () => fileInput.click());

  fileInput?.addEventListener('change', () => {
    const files = Array.from(fileInput.files ?? []);
    fileInput.value = '';
    files.forEach(uploadFile);
  });

  textarea?.addEventListener('dragover', (e) => {
    e.preventDefault();
    textarea.classList.add('drag-over');
  });

  textarea?.addEventListener('dragleave', () => {
    textarea.classList.remove('drag-over');
  });

  textarea?.addEventListener('drop', (e) => {
    e.preventDefault();
    textarea.classList.remove('drag-over');
    const files = Array.from(e.dataTransfer?.files ?? []).filter(f => f.type.startsWith('image/'));
    files.forEach(uploadFile);
  });

  function uploadFile(file: File) {
    const placeholder = document.createElement('div');
    placeholder.className = 'composer__attachment-item';
    placeholder.innerHTML = `<div class="composer__attachment-loading">uploading\u2026</div>`;
    attachmentPreviews.appendChild(placeholder);

    const fd = new FormData();
    fd.append('file', file);

    fetch('/admin/upload', { method: 'POST', body: fd })
      .then(async res => {
        if (!res.ok) throw new Error('Upload failed');
        const { url } = await res.json() as { url: string };
        placeholder.innerHTML = `
          <img src="${url}" alt="" class="composer__attachment-img" />
          <button type="button" class="composer__attachment-remove" aria-label="Remove">\u00d7</button>
          <input type="hidden" name="photos" value="${url}" />
        `;
        placeholder.querySelector('.composer__attachment-remove')?.addEventListener('click', () => {
          placeholder.remove();
        });
      })
      .catch(() => {
        placeholder.innerHTML = `<div class="composer__attachment-loading" style="color:var(--color-error, red)">Failed</div>`;
      });
  }

  // ── Submit ───────────────────────────────────────────────────────────────
  form?.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Clear draft synchronously before any async work
    if (saveTimer) clearTimeout(saveTimer);
    try { localStorage.removeItem(DRAFT_KEY); } catch { /* ignore */ }
    hideDraftIndicator();

    submitBtn.disabled = true;
    errorEl.hidden = true;

    const body = new FormData(form);

    try {
      const res = await fetch('/admin/compose', { method: 'POST', body, redirect: 'follow' });
      if (res.ok || res.redirected) {
        window.location.href = res.url;
        return;
      }
      const json = await res.json().catch(() => ({ error: 'Post failed' })) as { error?: string };
      showError(json.error ?? 'Post failed');
      // Restore draft on failure
      try { localStorage.setItem(DRAFT_KEY, textarea.value); showDraftIndicator(); } catch { /* ignore */ }
    } catch {
      showError('Network error \u2014 please try again');
      try { localStorage.setItem(DRAFT_KEY, textarea.value); showDraftIndicator(); } catch { /* ignore */ }
    } finally {
      submitBtn.disabled = false;
    }
  });

  function showError(msg: string) {
    errorEl.textContent = msg;
    errorEl.hidden = false;
  }
})();
