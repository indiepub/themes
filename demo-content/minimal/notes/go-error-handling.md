---
slug: go-error-handling
type: note
published: 2026-03-18T14:00:00Z
visibility: public
tags: [go]
---

I've come around on Go's error handling. Yes, `if err != nil` is verbose. But after debugging a Python codebase where exceptions propagate through six layers of abstraction before anyone catches them, explicit error returns don't seem so bad.
