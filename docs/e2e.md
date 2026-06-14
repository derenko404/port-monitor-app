# Manual E2E checks

## Force-kill fallback

Spawn a process that **listens** on a port but **ignores SIGTERM**, so the app
falls back to the "Still running — force kill?" → SIGKILL flow.

```sh
node -e "process.on('SIGTERM',()=>console.log('ignored SIGTERM')); require('http').createServer((_,r)=>r.end('hi')).listen(7777,()=>console.log('listening :7777 pid',process.pid))"
```

Then in the app:

1. Find `:7777` → **Kill** → sends SIGTERM (ignored).
2. After the grace window the **"Still running — force kill?"** dialog appears.
3. **Force kill** → SIGKILL (can't be trapped) → process dies, list refreshes.

Bash alternative:

```sh
bash -c 'trap "" TERM; python3 -m http.server 7777'
```
