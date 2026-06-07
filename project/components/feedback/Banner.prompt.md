Inline, non-blocking message. Success for detections, warning for size mismatch, accent for template mode.

```jsx
<Banner variant="success" icon="check-circle-2" title="40×30 label detected" />
<Banner variant="warning" icon="alert-triangle" title="Size mismatch"
        action={<Button size="sm" variant="secondary">Override</Button>}>
  Design is 50×30 but a 40×30 label is loaded.
</Banner>
<Banner variant="accent" icon="sparkles" title="Template mode" />
```
