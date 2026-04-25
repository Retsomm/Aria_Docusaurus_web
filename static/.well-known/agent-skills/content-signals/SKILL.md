# Content Signals Skill

This site declares AI content usage preferences in `robots.txt` via Content Signals.

## Declared Signals

```
Content-Signal: ai-train=no, search=yes, ai-input=no
```

- `ai-train=no` — content must not be used to train AI models
- `search=yes` — content may be used in search indexes
- `ai-input=no` — content must not be used as direct AI prompt input

## Reference

- Content Signals: https://contentsignals.org/
- Draft spec: https://datatracker.ietf.org/doc/draft-romm-aipref-contentsignals/
